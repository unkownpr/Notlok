# Changelog

Notlok projesindeki tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardını takip eder,
ve bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kullanır.

## [Unreleased]

### Planlanıyor
- [ ] Otomatik güncelleme sistemi
- [ ] Çoklu dil transkripsiyon desteği
- [ ] Özel AI prompt şablonları
- [ ] Transkript düzenleme özellikleri
- [ ] Export özelliği (PDF, DOCX)

## [0.1.0] - 2024-11-22

### 🎉 İlk Sürüm

#### Eklenenler
- ✅ **Sistem Ses Yakalama**: BlackHole olmadan direkt sistem sesi kaydı (macOS ScreenCaptureKit)
- ✅ **AI Transkripsiyon**: Whisper modelleri ile yerel transkripsiyon
  - Whisper Tiny (75 MB)
  - Whisper Base (142 MB)
  - Whisper Small (466 MB)
  - Whisper Medium (1.5 GB)
  - Whisper Large V3 (3.1 GB)
- ✅ **Parakeet Modelleri**: Alternatif transkripsiyon motorları
  - Parakeet CTC 0.6B (İngilizce)
  - Parakeet TDT 0.6B (Çok dilli)
- ✅ **AI Rapor Oluşturma**:
  - Notlok AI entegrasyonu
  - Gemini AI desteği
  - Önceden tanımlı prompt şablonları
  - Özel prompt desteği
- ✅ **Lisans Sistemi**: Lemon Squeezy entegrasyonu
  - Otomatik aktivasyon
  - Cihaz bazlı lisanslama
  - Email doğrulama
- ✅ **Kayıt Geçmişi**:
  - Tüm kayıtları saklama
  - AI raporları ile birlikte görüntüleme
  - Geçmiş yönetimi
- ✅ **Tema Desteği**:
  - Açık tema
  - Koyu tema
  - Sistem teması (otomatik)
- ✅ **Çoklu Dil Arayüzü**:
  - Türkçe
  - İngilizce
- ✅ **İzin Yönetimi**:
  - Ekran kaydı izni kontrolü
  - Mikrofon izni kontrolü
  - Kolay izin talep sistemi

#### Teknik Özellikler
- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri
- **AI**: Whisper.cpp, Parakeet
- **Ses Yakalama**: ScreenCaptureKit (macOS), WASAPI (Windows)
- **Platform**: macOS 10.15+, Windows 10+

#### Güvenlik
- 🔒 Tüm işlemler yerel cihazda gerçekleşir
- 🔒 Veriler internet üzerinden paylaşılmaz
- 🔒 Lisans doğrulama haricinde network kullanımı yok

---

## Sürüm Numaralandırma

Projenin versiyonlaması şu şekildedir:

- **Major version (X.0.0)**: API değişiklikleri veya uyumsuz değişiklikler
- **Minor version (0.X.0)**: Geriye dönük uyumlu yeni özellikler
- **Patch version (0.0.X)**: Geriye dönük uyumlu hata düzeltmeleri

---

## Destek

Sorularınız veya önerileriniz için:
- 🌐 Web: [https://notlok.app](https://notlok.app)
- 💬 GitHub Issues: [github.com/ssilistre/notlok/issues](https://github.com/ssilistre/notlok/issues)
- 📧 Email: support@notlok.app

---

**Powered by [ssilistre.dev](https://ssilistre.dev)**

