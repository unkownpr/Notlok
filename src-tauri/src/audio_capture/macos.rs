use std::sync::{Arc, Mutex};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

// FFI declarations for Swift ScreenCaptureKit bridge
extern "C" {
    fn sc_audio_capture_start(buffer: *mut f32, size: i32) -> bool;
    fn sc_audio_capture_stop();
    fn sc_audio_capture_get_samples() -> i32;
}

pub fn capture_audio(
    buffer: Arc<Mutex<Vec<f32>>>,
    is_recording: Arc<Mutex<bool>>,
) -> Result<(), String> {
    // Start both system audio and microphone capture in parallel
    let system_buffer = buffer.clone();
    let system_recording = is_recording.clone();

    let mic_buffer = buffer.clone();
    let mic_recording = is_recording.clone();

    // Spawn system audio capture thread (ScreenCaptureKit)
    let system_thread = std::thread::spawn(move || {
        if let Err(e) = capture_system_audio(system_buffer, system_recording) {
            eprintln!("System audio capture error: {}", e);
        }
    });

    // Spawn microphone capture thread
    let mic_thread = std::thread::spawn(move || {
        if let Err(e) = capture_microphone(mic_buffer, mic_recording) {
            eprintln!("Microphone capture error: {}", e);
        }
    });

    // Wait for both threads
    let _ = system_thread.join();
    let _ = mic_thread.join();

    Ok(())
}

fn capture_system_audio(
    buffer: Arc<Mutex<Vec<f32>>>,
    is_recording: Arc<Mutex<bool>>,
) -> Result<(), String> {
    // Allocate buffer for system audio (10 minutes at 16kHz)
    let max_samples = 16000 * 60 * 10;
    let mut system_buffer: Vec<f32> = vec![0.0; max_samples];

    unsafe {
        let started = sc_audio_capture_start(system_buffer.as_mut_ptr(), max_samples as i32);
        if !started {
            return Err("Failed to start ScreenCaptureKit audio capture. Make sure Screen Recording permission is granted.".to_string());
        }

        #[cfg(debug_assertions)]
        println!("System audio capture started (ScreenCaptureKit)");

        let mut last_index = 0;

        // Poll for new samples while recording
        while *is_recording.lock().unwrap() {
            std::thread::sleep(std::time::Duration::from_millis(50));

            let current_index = sc_audio_capture_get_samples() as usize;

            if current_index > last_index {
                // Copy new samples to shared buffer
                let new_samples = current_index - last_index;
                
                // Log every 5 seconds worth of samples (~80000 samples at 16kHz)
                #[cfg(debug_assertions)]
                if current_index % 80000 < new_samples {
                    println!("📊 System audio progress: {} samples collected", current_index);
                }
                
                let mut shared_buffer = buffer.lock().unwrap();
                shared_buffer.extend_from_slice(&system_buffer[last_index..current_index]);
                last_index = current_index;
            }
        }

        sc_audio_capture_stop();
        #[cfg(debug_assertions)]
        println!("System audio capture stopped");
    }

    Ok(())
}

fn capture_microphone(
    buffer: Arc<Mutex<Vec<f32>>>,
    is_recording: Arc<Mutex<bool>>,
) -> Result<(), String> {
    let host = cpal::default_host();
    let device = host.default_input_device()
        .ok_or("No input device available")?;

    let supported_config = device.default_input_config()
        .map_err(|e| e.to_string())?;

    let sample_rate = supported_config.sample_rate().0;
    let channels = supported_config.channels();

    let config = cpal::StreamConfig {
        channels,
        sample_rate: cpal::SampleRate(sample_rate),
        buffer_size: cpal::BufferSize::Default,
    };

    let buffer_clone = buffer.clone();
    let target_sample_rate = 16000u32;

    let stream = device.build_input_stream(
        &config,
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            // Convert to mono
            let mono_samples: Vec<f32> = if channels > 1 {
                data.chunks(channels as usize)
                    .map(|chunk| chunk.iter().sum::<f32>() / channels as f32)
                    .collect()
            } else {
                data.to_vec()
            };

            // Resample to 16kHz if needed
            let resampled = if sample_rate != target_sample_rate {
                resample(&mono_samples, sample_rate, target_sample_rate)
            } else {
                mono_samples
            };

            let mut buf = buffer_clone.lock().unwrap();
            buf.extend(resampled);
        },
        |err| eprintln!("Microphone stream error: {}", err),
        None,
    ).map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    #[cfg(debug_assertions)]
    println!("Microphone capture started");

    // Wait until recording stops
    loop {
        std::thread::sleep(std::time::Duration::from_millis(100));
        if !*is_recording.lock().unwrap() {
            break;
        }
    }

    Ok(())
}

fn resample(samples: &[f32], from_rate: u32, to_rate: u32) -> Vec<f32> {
    if from_rate == to_rate {
        return samples.to_vec();
    }

    let ratio = from_rate as f64 / to_rate as f64;
    let new_len = (samples.len() as f64 / ratio) as usize;
    let mut resampled = Vec::with_capacity(new_len);

    for i in 0..new_len {
        let src_idx = i as f64 * ratio;
        let idx = src_idx as usize;
        let frac = src_idx - idx as f64;

        if idx + 1 < samples.len() {
            let sample = samples[idx] * (1.0 - frac as f32) + samples[idx + 1] * frac as f32;
            resampled.push(sample);
        } else if idx < samples.len() {
            resampled.push(samples[idx]);
        }
    }

    resampled
}
