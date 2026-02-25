// Parakeet support temporarily disabled due to ort API complexity
// Will be implemented in a future update

pub struct ParakeetTranscriber {
    _placeholder: (),
}

impl ParakeetTranscriber {
    pub fn new(_model_path: &str) -> Result<Self, String> {
        Err("Parakeet desteği henüz aktif değil. Lütfen Whisper modellerini kullanın.".to_string())
    }

    pub fn transcribe(&self, _audio_data: &[f32]) -> Result<String, String> {
        Err("Parakeet desteği henüz aktif değil".to_string())
    }
}
