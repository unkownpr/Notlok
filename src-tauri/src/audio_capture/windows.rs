use std::sync::{Arc, Mutex};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

pub fn capture_audio(
    buffer: Arc<Mutex<Vec<f32>>>,
    is_recording: Arc<Mutex<bool>>,
) -> Result<(), String> {
    // Capture system audio (loopback)
    let system_buffer = buffer.clone();
    let system_recording = is_recording.clone();
    let system_thread = std::thread::spawn(move || {
        if let Err(e) = capture_loopback(system_buffer, system_recording) {
            eprintln!("System audio capture error: {}", e);
        }
    });

    // Capture microphone
    let mic_buffer = buffer.clone();
    let mic_recording = is_recording.clone();
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

fn capture_loopback(
    buffer: Arc<Mutex<Vec<f32>>>,
    is_recording: Arc<Mutex<bool>>,
) -> Result<(), String> {
    // Get WASAPI host for loopback support
    let host = cpal::host_from_id(cpal::HostId::Wasapi)
        .map_err(|e| format!("Failed to get WASAPI host: {}", e))?;

    // Get default output device for loopback
    let device = host.default_output_device()
        .ok_or("No output device available for loopback")?;

    println!("Using output device for loopback: {}", device.name().unwrap_or_default());

    // Get supported config
    let supported_config = device.default_output_config()
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

    // Build loopback stream
    let stream = device.build_input_stream(
        &config,
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            // Convert to mono and resample to 16kHz
            let mono_samples: Vec<f32> = if channels > 1 {
                data.chunks(channels as usize)
                    .map(|chunk| chunk.iter().sum::<f32>() / channels as f32)
                    .collect()
            } else {
                data.to_vec()
            };

            // Simple resampling (linear interpolation)
            let resampled = resample(&mono_samples, sample_rate, target_sample_rate);
            buffer_clone.lock().unwrap().extend(resampled);
        },
        |err| eprintln!("Loopback stream error: {}", err),
        None,
    ).map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    println!("System audio capture started (WASAPI loopback)");

    // Wait until recording stops
    loop {
        std::thread::sleep(std::time::Duration::from_millis(100));
        if !*is_recording.lock().unwrap() {
            break;
        }
    }

    println!("System audio capture stopped");
    Ok(())
}

fn capture_microphone(
    buffer: Arc<Mutex<Vec<f32>>>,
    is_recording: Arc<Mutex<bool>>,
) -> Result<(), String> {
    let host = cpal::default_host();
    let device = host.default_input_device()
        .ok_or("No input device available")?;

    println!("Using microphone: {}", device.name().unwrap_or_default());

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
            // Convert to mono and resample
            let mono_samples: Vec<f32> = if channels > 1 {
                data.chunks(channels as usize)
                    .map(|chunk| chunk.iter().sum::<f32>() / channels as f32)
                    .collect()
            } else {
                data.to_vec()
            };

            let resampled = resample(&mono_samples, sample_rate, target_sample_rate);
            buffer_clone.lock().unwrap().extend(resampled);
        },
        |err| eprintln!("Microphone stream error: {}", err),
        None,
    ).map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    println!("Microphone capture started");

    // Wait until recording stops
    loop {
        std::thread::sleep(std::time::Duration::from_millis(100));
        if !*is_recording.lock().unwrap() {
            break;
        }
    }

    println!("Microphone capture stopped");
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
