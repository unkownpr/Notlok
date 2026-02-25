use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};

#[cfg(target_os = "macos")]
mod macos;

#[cfg(target_os = "windows")]
mod windows;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

pub struct AudioRecorder {
    is_recording: Arc<Mutex<bool>>,
    audio_buffer: Arc<Mutex<Vec<f32>>>,
    #[allow(dead_code)]
    sample_rate: u32, // Reserved for future use
    selected_input_device: Arc<Mutex<Option<String>>>,
}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            is_recording: Arc::new(Mutex::new(false)),
            audio_buffer: Arc::new(Mutex::new(Vec::new())),
            sample_rate: 16000, // Whisper expects 16kHz
            selected_input_device: Arc::new(Mutex::new(None)),
        }
    }

    pub fn get_audio_buffer(&self) -> Vec<f32> {
        self.audio_buffer.lock().unwrap().clone()
    }

    pub fn set_input_device(&self, device_id: Option<String>) {
        *self.selected_input_device.lock().unwrap() = device_id;
    }

    pub fn get_input_device(&self) -> Option<String> {
        self.selected_input_device.lock().unwrap().clone()
    }

    pub fn list_input_devices() -> Result<Vec<AudioDevice>, String> {
        use cpal::traits::{HostTrait, DeviceTrait};
        
        let host = cpal::default_host();
        let default_device = host.default_input_device();
        let default_name = default_device.as_ref()
            .and_then(|d| d.name().ok());
        
        let mut devices = Vec::new();
        
        if let Ok(available_devices) = host.input_devices() {
            for (index, device) in available_devices.enumerate() {
                if let Ok(name) = device.name() {
                    let is_default = Some(&name) == default_name.as_ref();
                    devices.push(AudioDevice {
                        id: format!("input_{}", index),
                        name: name.clone(),
                        is_default,
                    });
                }
            }
        }
        
        Ok(devices)
    }

    pub fn list_output_devices() -> Result<Vec<AudioDevice>, String> {
        use cpal::traits::{HostTrait, DeviceTrait};
        
        let host = cpal::default_host();
        let default_device = host.default_output_device();
        let default_name = default_device.as_ref()
            .and_then(|d| d.name().ok());
        
        let mut devices = Vec::new();
        
        if let Ok(available_devices) = host.output_devices() {
            for (index, device) in available_devices.enumerate() {
                if let Ok(name) = device.name() {
                    let is_default = Some(&name) == default_name.as_ref();
                    devices.push(AudioDevice {
                        id: format!("output_{}", index),
                        name: name.clone(),
                        is_default,
                    });
                }
            }
        }
        
        Ok(devices)
    }

    pub fn start_recording(&self) -> Result<(), String> {
        let mut is_recording = self.is_recording.lock().unwrap();
        if *is_recording {
            return Err("Already recording".to_string());
        }
        *is_recording = true;
        drop(is_recording);

        // Clear previous buffer
        self.audio_buffer.lock().unwrap().clear();

        // Start platform-specific capture
        #[cfg(target_os = "macos")]
        {
            let buffer = self.audio_buffer.clone();
            let is_recording = self.is_recording.clone();
            std::thread::spawn(move || {
                if let Err(e) = macos::capture_audio(buffer, is_recording) {
                    eprintln!("macOS audio capture error: {}", e);
                }
            });
        }

        #[cfg(target_os = "windows")]
        {
            let buffer = self.audio_buffer.clone();
            let is_recording = self.is_recording.clone();
            std::thread::spawn(move || {
                if let Err(e) = windows::capture_audio(buffer, is_recording) {
                    eprintln!("Windows audio capture error: {}", e);
                }
            });
        }

        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        {
            return Err("Platform not supported".to_string());
        }

        println!("Started recording system audio + microphone");
        Ok(())
    }

    pub fn stop_recording(&self) -> Result<(), String> {
        let mut is_recording = self.is_recording.lock().unwrap();
        if !*is_recording {
            return Err("Not recording".to_string());
        }
        *is_recording = false;

        println!("Stopped recording. Buffer size: {} samples", self.audio_buffer.lock().unwrap().len());
        Ok(())
    }
}
