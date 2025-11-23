use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, Mutex};
use std::time::Duration;

pub fn capture_audio(buffer: Arc<Mutex<Vec<f32>>>, is_recording: Arc<Mutex<bool>>) -> Result<(), String> {
    let host = cpal::default_host();

    // Get default output device (speakers) for loopback
    let device = host.default_output_device().ok_or("No output device found")?;

    let config: cpal::StreamConfig = device.default_output_config().map_err(|e| e.to_string())?.into();

    // Clone buffer for the callback
    let buffer_handle = buffer.clone();

    let stream = device.build_input_stream(
        &config,
        move |data: &[f32], _: &_| {
            let mut buf = buffer_handle.lock().unwrap();
            // Simple downmix to mono if needed, or just take first channel
            // Assuming interleaved stereo, take average or just left
            // For simplicity, just append all (Whisper might need resampling later)
            buf.extend_from_slice(data);
        },
        move |err| {
            eprintln!("Stream error: {}", err);
        },
        None // Timeout
    ).map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    // Keep thread alive while recording
    while *is_recording.lock().unwrap() {
        std::thread::sleep(Duration::from_millis(100));
    }

    drop(stream); // Stop stream
    Ok(())
}
