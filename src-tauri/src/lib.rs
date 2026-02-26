mod audio_capture;
mod transcription;

use audio_capture::{AudioRecorder, AudioDevice};
use transcription::{TranscriberModel, WhisperTranscriber};
use std::sync::Mutex;
use std::path::PathBuf;
use tauri::{State, AppHandle, Manager, Emitter};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize)]
pub struct AudioStats {
    pub average: f32,
    pub peak: f32,
    pub silence: f32,
}

// FFI declarations for permission checks and icon (macOS)
#[cfg(target_os = "macos")]
extern "C" {
    fn sc_check_screen_recording_permission() -> bool;
    fn sc_request_screen_recording_permission() -> bool;
    fn sc_check_microphone_permission() -> i32;
    fn sc_set_app_icon(data: *const u8, length: i32);
}

#[derive(Clone, Serialize)]
pub struct PermissionStatus {
    pub screen_recording: bool,
    pub microphone: String, // "granted", "denied", "not_determined"
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub size: String,
    pub quality: String,
    pub url: String,
}

#[derive(Clone, Serialize)]
pub struct DownloadProgress {
    pub model_id: String,
    pub progress: f64,
    pub downloaded: u64,
    pub total: u64,
}

fn get_available_models() -> Vec<ModelInfo> {
    vec![
        // Whisper models
        ModelInfo {
            id: "whisper-tiny".to_string(),
            name: "Whisper Tiny".to_string(),
            size: "75 MB".to_string(),
            quality: "Hızlı, düşük kalite".to_string(),
            url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin".to_string(),
        },
        ModelInfo {
            id: "whisper-base".to_string(),
            name: "Whisper Base".to_string(),
            size: "142 MB".to_string(),
            quality: "Dengeli".to_string(),
            url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin".to_string(),
        },
        ModelInfo {
            id: "whisper-small".to_string(),
            name: "Whisper Small".to_string(),
            size: "466 MB".to_string(),
            quality: "İyi kalite".to_string(),
            url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin".to_string(),
        },
        ModelInfo {
            id: "whisper-medium".to_string(),
            name: "Whisper Medium".to_string(),
            size: "1.5 GB".to_string(),
            quality: "Çok iyi kalite".to_string(),
            url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin".to_string(),
        },
        ModelInfo {
            id: "whisper-large-v3".to_string(),
            name: "Whisper Large V3".to_string(),
            size: "3.1 GB".to_string(),
            quality: "En iyi kalite".to_string(),
            url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin".to_string(),
        },
    ]
}

pub struct AppState {
    recorder: AudioRecorder,
    transcriber: Mutex<Option<TranscriberModel>>,
    current_model: Mutex<Option<String>>,
    language: Mutex<String>,
    recording_start_time: Mutex<Option<std::time::Instant>>,
}

fn get_models_dir(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("models")
}

fn get_model_path(app: &AppHandle, model_id: &str) -> PathBuf {
    let models_dir = get_models_dir(app);
    let whisper_id = model_id.strip_prefix("whisper-").unwrap_or(model_id);
    models_dir.join(format!("ggml-{}.bin", whisper_id))
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn list_models(app: AppHandle) -> Vec<ModelInfo> {
    let models = get_available_models();
    let _models_dir = get_models_dir(&app);

    models.into_iter().map(|mut m| {
        let path = get_model_path(&app, &m.id);
        if path.exists() {
            m.quality = format!("{} (İndirildi)", m.quality);
        }
        m
    }).collect()
}

#[tauri::command]
fn is_model_downloaded(app: AppHandle, model_id: String) -> bool {
    get_model_path(&app, &model_id).exists()
}

#[tauri::command]
async fn download_model(app: AppHandle, model_id: String) -> Result<String, String> {
    let models = get_available_models();
    let model = models.iter().find(|m| m.id == model_id)
        .ok_or_else(|| "Model bulunamadı".to_string())?;

    let models_dir = get_models_dir(&app);
    std::fs::create_dir_all(&models_dir).map_err(|e| e.to_string())?;

    let target_path = get_model_path(&app, &model_id);

    if target_path.exists() {
        return Ok("Model zaten indirilmiş".to_string());
    }

    // Download
    let response = reqwest::get(&model.url).await.map_err(|e| e.to_string())?;
    let total_size = response.content_length().unwrap_or(0);

    let mut file = std::fs::File::create(&target_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    use futures_util::StreamExt;
    use std::io::Write;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;

        let progress = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
        } else {
            0.0
        };
        let _ = app.emit("download-progress", DownloadProgress {
            model_id: model_id.clone(),
            progress,
            downloaded,
            total: total_size,
        });
    }

    Ok("Model başarıyla indirildi".to_string())
}

#[tauri::command]
async fn load_model(app: AppHandle, state: State<'_, AppState>, model_id: String) -> Result<String, String> {
    let model_path = get_model_path(&app, &model_id);

    if !model_path.exists() {
        return Err("Model indirilmemiş".to_string());
    }

    let path_str = model_path.to_string_lossy().to_string();
    
    // Run model loading in a blocking task to avoid blocking the async runtime
    // Model loading is CPU-intensive and takes time
    let model_id_clone = model_id.clone();
    tokio::task::block_in_place(move || {
        let mut transcriber_guard = state.transcriber.lock().map_err(|e| e.to_string())?;

        let transcriber = WhisperTranscriber::new(&path_str)?;
        *transcriber_guard = Some(TranscriberModel::Whisper(transcriber));

        *state.current_model.lock().map_err(|e| e.to_string())? = Some(model_id.clone());

        Ok(format!("Model yüklendi: {}", model_id_clone))
    })
}

#[tauri::command]
fn set_language(state: State<'_, AppState>, language: String) -> Result<(), String> {
    let valid_languages = ["tr", "en", "auto"];
    if !valid_languages.contains(&language.as_str()) {
        return Err("Geçersiz dil. tr, en veya auto kullanın".to_string());
    }
    *state.language.lock().map_err(|e| e.to_string())? = language;
    Ok(())
}

#[tauri::command]
fn get_current_settings(state: State<'_, AppState>) -> Result<(Option<String>, String), String> {
    let model = state.current_model.lock().map_err(|e| e.to_string())?.clone();
    let language = state.language.lock().map_err(|e| e.to_string())?.clone();
    Ok((model, language))
}

#[tauri::command]
fn list_audio_input_devices() -> Result<Vec<AudioDevice>, String> {
    AudioRecorder::list_input_devices()
}

#[tauri::command]
fn list_audio_output_devices() -> Result<Vec<AudioDevice>, String> {
    AudioRecorder::list_output_devices()
}

#[tauri::command]
fn set_input_device(state: State<'_, AppState>, device_id: Option<String>) -> Result<(), String> {
    state.recorder.set_input_device(device_id);
    Ok(())
}

#[tauri::command]
fn get_input_device(state: State<'_, AppState>) -> Result<Option<String>, String> {
    Ok(state.recorder.get_input_device())
}

#[tauri::command]
fn start_recording(state: State<'_, AppState>) -> Result<(), String> {
    // Start recording timer
    let mut start_time = state.recording_start_time.lock().map_err(|e| e.to_string())?;
    *start_time = Some(std::time::Instant::now());
    
    state.recorder.start_recording()
}

#[tauri::command]
fn get_recording_duration(state: State<'_, AppState>) -> Result<f64, String> {
    let start_time = state.recording_start_time.lock().map_err(|e| e.to_string())?;
    
    if let Some(start) = *start_time {
        let duration = start.elapsed().as_secs_f64();
        Ok(duration)
    } else {
        Ok(0.0)
    }
}


#[tauri::command]
fn get_audio_buffer_size(state: State<'_, AppState>) -> Result<usize, String> {
    let buffer = state.recorder.get_audio_buffer();
    Ok(buffer.len())
}

#[tauri::command]
fn get_audio_stats(state: State<'_, AppState>) -> Result<AudioStats, String> {
    let buffer = state.recorder.get_audio_buffer();
    
    if buffer.is_empty() {
        return Ok(AudioStats {
            average: 0.0,
            peak: 0.0,
            silence: 100.0,
        });
    }
    
    // Calculate average absolute value (volume)
    let sum: f32 = buffer.iter().map(|s| s.abs()).sum();
    let average = sum / buffer.len() as f32;
    
    // Calculate peak
    let peak = buffer.iter().map(|s| s.abs()).fold(0.0f32, f32::max);
    
    // Calculate silence percentage (samples below threshold)
    let silence_threshold = 0.01f32;
    let silent_samples = buffer.iter().filter(|s| s.abs() < silence_threshold).count();
    let silence = (silent_samples as f32 / buffer.len() as f32) * 100.0;
    
    Ok(AudioStats {
        average,
        peak,
        silence,
    })
}

#[tauri::command]
async fn stop_recording_only(state: State<'_, AppState>) -> Result<(), String> {
    // Reset recording timer
    let mut start_time = state.recording_start_time.lock().map_err(|e| e.to_string())?;
    *start_time = None;
    
    // Non-blocking stop - just set the flag
    let _ = state.recorder.stop_recording();
    Ok(())
}

#[tauri::command]
async fn transcribe_audio(state: State<'_, AppState>) -> Result<String, String> {
    // Get the recorded audio buffer
    let audio_data = state.recorder.get_audio_buffer();

    let audio_to_use = if audio_data.is_empty() {
        // Use placeholder if no actual audio recorded yet
        vec![0.0; 16000 * 5]
    } else {
        audio_data
    };

    // Run transcription in a blocking context to avoid blocking the async runtime
    tokio::task::block_in_place(|| {
        let mut transcriber = state.transcriber.lock().map_err(|e| e.to_string())?;
        if let Some(t) = transcriber.as_mut() {
            return t.transcribe(&audio_to_use);
        }
        Ok("Kayıt durduruldu. Model yüklenmemiş, transkript yok.".to_string())
    })
}

#[tauri::command]
fn stop_recording(state: State<'_, AppState>) -> Result<String, String> {
    state.recorder.stop_recording()?;

    // Get the recorded audio buffer
    let audio_data = state.recorder.get_audio_buffer();

    let audio_to_use = if audio_data.is_empty() {
        // Use placeholder if no actual audio recorded yet
        vec![0.0; 16000 * 5]
    } else {
        audio_data
    };

    let mut transcriber = state.transcriber.lock().map_err(|e| e.to_string())?;
    if let Some(t) = transcriber.as_mut() {
        return t.transcribe(&audio_to_use);
    }

    Ok("Kayıt durduruldu. Model yüklenmemiş, transkript yok.".to_string())
}

#[tauri::command]
fn check_permissions() -> PermissionStatus {
    #[cfg(target_os = "macos")]
    {
        let screen = unsafe { sc_check_screen_recording_permission() };
        let mic = unsafe { sc_check_microphone_permission() };
        let mic_status = match mic {
            1 => "granted",
            0 => "not_determined",
            _ => "denied",
        };
        PermissionStatus {
            screen_recording: screen,
            microphone: mic_status.to_string(),
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        PermissionStatus {
            screen_recording: true,
            microphone: "granted".to_string(),
        }
    }
}

#[tauri::command]
fn request_screen_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        unsafe { sc_request_screen_recording_permission() }
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

#[tauri::command]
fn open_system_preferences() {
    let _ = tauri_plugin_opener::open_url(
        "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
        None::<&str>,
    );
}

#[tauri::command]
fn open_microphone_preferences() {
    let _ = tauri_plugin_opener::open_url(
        "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
        None::<&str>,
    );
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        recorder: AudioRecorder::new(),
        transcriber: Mutex::new(None),
        current_model: Mutex::new(None),
        language: Mutex::new("tr".to_string()),
        recording_start_time: Mutex::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use tauri::menu::{Menu, Submenu, PredefinedMenuItem, AboutMetadata};

                // Set NSApplication icon directly via Swift — most reliable for dev mode
                const ICON_ICNS: &[u8] = include_bytes!("../icons/icon.icns");
                unsafe { sc_set_app_icon(ICON_ICNS.as_ptr(), ICON_ICNS.len() as i32) };

                // Also pass icon to AboutMetadata (fallback)
                let icon = tauri::image::Image::from_bytes(
                    include_bytes!("../icons/icon.png")
                ).ok();

                // App menu
                let about = PredefinedMenuItem::about(
                    app,
                    Some("About Notlok"),
                    Some(AboutMetadata {
                        name: Some("Notlok".to_string()),
                        version: Some("2.0.6".to_string()),
                        copyright: Some("Copyright © 2026 ssilistre".to_string()),
                        website: Some("https://ssilistre.dev".to_string()),
                        website_label: Some("ssilistre.dev".to_string()),
                        icon,
                        ..Default::default()
                    }),
                )?;
                let sep1 = PredefinedMenuItem::separator(app)?;
                let services = PredefinedMenuItem::services(app, None)?;
                let sep2 = PredefinedMenuItem::separator(app)?;
                let hide = PredefinedMenuItem::hide(app, None)?;
                let hide_others = PredefinedMenuItem::hide_others(app, None)?;
                let show_all = PredefinedMenuItem::show_all(app, None)?;
                let sep3 = PredefinedMenuItem::separator(app)?;
                let quit = PredefinedMenuItem::quit(app, Some("Quit Notlok"))?;
                let app_menu = Submenu::with_items(
                    app, "Notlok", true,
                    &[&about, &sep1, &services, &sep2, &hide, &hide_others, &show_all, &sep3, &quit],
                )?;

                // Edit menu
                let undo = PredefinedMenuItem::undo(app, None)?;
                let redo = PredefinedMenuItem::redo(app, None)?;
                let sep4 = PredefinedMenuItem::separator(app)?;
                let cut = PredefinedMenuItem::cut(app, None)?;
                let copy = PredefinedMenuItem::copy(app, None)?;
                let paste = PredefinedMenuItem::paste(app, None)?;
                let select_all = PredefinedMenuItem::select_all(app, None)?;
                let edit_menu = Submenu::with_items(
                    app, "Edit", true,
                    &[&undo, &redo, &sep4, &cut, &copy, &paste, &select_all],
                )?;

                // Window menu
                let minimize = PredefinedMenuItem::minimize(app, None)?;
                let close = PredefinedMenuItem::close_window(app, None)?;
                let window_menu = Submenu::with_items(
                    app, "Window", true,
                    &[&minimize, &close],
                )?;

                let menu = Menu::with_items(app, &[&app_menu, &edit_menu, &window_menu])?;
                app.set_menu(menu)?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            list_audio_input_devices,
            list_audio_output_devices,
            set_input_device,
            get_input_device,
            start_recording,
            stop_recording,
            stop_recording_only,
            transcribe_audio,
            get_audio_buffer_size,
            get_audio_stats,
            get_recording_duration,
            list_models,
            is_model_downloaded,
            download_model,
            load_model,
            set_language,
            get_current_settings,
            check_permissions,
            request_screen_permission,
            open_system_preferences,
            open_microphone_preferences
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
