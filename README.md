# 🎙️ Notlok - AI Destekli Sesli Not Uygulaması

> Yerel, güvenli ve özel sesli not uygulamanız. Tüm işlemler cihazınızda gerçekleşir.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-macOS%20|%20Windows-lightgrey.svg)]()

---

## ✨ Özellikler

### 🎯 Temel Özellikler
- 🎤 **Sistem Ses Yakalama**: BlackHole veya loopback device olmadan sistem sesi kaydı
- 🤖 **AI Transkripsiyon**: Yerel Whisper ve Parakeet modelleri ile transkripsiyon
- 📝 **AI Rapor Oluşturma**: Sesli not özetleri, aksiyon maddeleri, karar günlükleri
- 💾 **Kayıt Geçmişi**: Tüm kayıtlarınız ve AI raporlarınız yerel olarak saklanır
- 🔐 **Lisans Sistemi**: Lemon Squeezy entegrasyonu ile güvenli aktivasyon
- 🌍 **Çoklu Dil**: Türkçe ve İngilizce arayüz desteği
- 🎨 **Tema Desteği**: Açık, koyu ve sistem teması

### 🔒 Gizlilik ve Güvenlik
- ✅ Tüm işlemler **yerel cihazda** gerçekleşir
- ✅ Veriler **internet üzerinden paylaşılmaz**
- ✅ Kayıtlarınız **sadece size aittir**
- ✅ AI işlemleri **cihazınızda** çalışır

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **macOS**: 10.15 (Catalina) veya üzeri
- **Windows**: 10 (1809) veya üzeri
- 4 GB RAM (minimum), 8 GB RAM (önerilen)
- 5 GB boş disk alanı (AI modelleri için)

### Kurulum

#### macOS
```bash
# DMG dosyasını indirin
# Notlok.app'i Applications klasörüne sürükleyin
# İlk açılışta "Open" butonuna tıklayın
```

#### Windows
```bash
# MSI dosyasını indirin
# Kurulum sihirbazını takip edin
# Uygulamayı başlatın
```

### İlk Kullanım

1. **Lisans Aktivasyonu**
   - Uygulamayı başlatın
   - Email ve lisans anahtarınızı girin
   - "Aktifleştir" butonuna tıklayın

2. **İzinleri Verin**
   - macOS: Screen Recording ve Microphone izinleri
   - Windows: Mikrofonizin çalıştığından emin olun

3. **Model İndirin**
   - Settings > Model seçin (Whisper Base önerilir)
   - "İndir" butonuna tıklayın
   - Model indirildikten sonra "Yükle" butonuna tıklayın

4. **Kayda Başlayın**
   - "Kayda Başla" butonuna tıklayın
   - Sesli notunuzu kaydedin
   - "Kaydı Durdur" ile bitirin
   - Transkript otomatik oluşturulacak

---

## 🛠️ Geliştirici Kurulumu

### Gereksinimler
- Node.js 18+
- Rust (latest stable)
- Xcode (macOS) veya Visual Studio 2022 (Windows)

### Kurulum

```bash
# Repository'i klonlayın
git clone https://github.com/ssilistre/notlok.git
cd notlok

# Dependencies'i yükleyin
npm install

# Development modunda çalıştırın
npm run tauri:dev
```

### Build

```bash
# Hızlı build (mevcut platform)
npm run tauri:build

# macOS Apple Silicon
npm run tauri:build:mac:arm

# macOS Intel
npm run tauri:build:mac:intel

# macOS Universal
npm run tauri:build:mac:universal

# Windows
npm run tauri:build:windows

# Script ile tüm platformlar
./scripts/build-all.sh        # macOS/Linux
.\scripts\build-all.ps1       # Windows
```

Detaylı build ve dağıtım bilgileri için [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md) dosyasına bakın.

---

## 📚 Dokümantasyon

- [Build ve Dağıtım Kılavuzu](BUILD_AND_DEPLOY.md)
- [Changelog](CHANGELOG.md)
- [API Dokümantasyonu](docs/API.md) _(yakında)_
- [Kullanım Kılavuzu](docs/USER_GUIDE.md) _(yakında)_

---

## 🏗️ Teknoloji Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling _(upcoming)_

### Backend
- **Rust** - Core logic
- **Tauri 2** - Desktop framework
- **Whisper.cpp** - AI transcription
- **ScreenCaptureKit** - System audio capture (macOS)

### AI Models
- **Whisper** (Tiny, Base, Small, Medium, Large V3)
- **Parakeet** (CTC 0.6B, TDT 0.6B)
- **Gemini AI** - Cloud AI support

---

## 🎯 Roadmap

### v0.2.0 (Planlanan)
- [ ] Otomatik güncelleme sistemi
- [ ] Linux desteği
- [ ] Özel AI prompt şablonları
- [ ] Export özelliği (PDF, DOCX, TXT)
- [ ] Transkript düzenleme

### v0.3.0 (Uzun vadeli)
- [ ] Gerçek zamanlı transkripsiyon
- [ ] Çoklu konuşmacı tanıma
- [ ] Sesli not analitikleri
- [ ] Cloud sync (opsiyonel)
- [ ] Browser extension

Tüm değişiklikler için [CHANGELOG.md](CHANGELOG.md) dosyasına bakın.

---

## 🤝 Katkıda Bulunma

Şu anda private repository olduğu için katkılar kabul edilmemektedir. Gelecekte açık kaynak olabilir.

---

## 📄 Lisans

Bu proje proprietary lisans altındadır. Kullanım için geçerli bir lisans anahtarı gereklidir.

Lisans satın almak için: [https://notlok.app](https://notlok.app)

---

## 🙋 Destek

### Sorunlar ve Öneriler
- 🌐 Web: [https://notlok.app](https://notlok.app)
- 📧 Email: support@notlok.app
- 💬 GitHub Issues: [github.com/ssilistre/notlok/issues](https://github.com/ssilistre/notlok/issues)

### Sıkça Sorulan Sorular

**Q: Sistem sesini nasıl kaydediyor?**  
A: macOS'ta ScreenCaptureKit API kullanıyoruz. BlackHole veya loopback device gerekmez.

**Q: İnternet bağlantısı gerekli mi?**  
A: Sadece lisans aktivasyonu ve AI rapor oluşturma için. Transkripsiyon tamamen offline çalışır.

**Q: AI modelleri ne kadar yer kaplıyor?**  
A: Whisper Base ~142 MB, Whisper Large V3 ~3.1 GB. İhtiyacınıza göre seçebilirsiniz.

**Q: Verilerim güvende mi?**  
A: Evet! Tüm kayıtlar ve işlemler yerel cihazınızda kalır.

---

## 👨‍💻 Geliştirici

**ssilistre.dev**
- 🌐 Web: [https://ssilistre.dev](https://ssilistre.dev)
- 💼 LinkedIn: [linkedin.com/in/ssilistre](https://linkedin.com/in/ssilistre)
- 🐦 Twitter: [@ssilistre](https://twitter.com/ssilistre)

---

## 🙏 Teşekkürler

- [Tauri](https://tauri.app/) - Harika desktop framework
- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) - Yerel AI transkripsiyon
- [Lemon Squeezy](https://lemonsqueezy.com/) - Lisans yönetimi
- [React](https://react.dev/) - UI framework

---

<div align="center">

**[Notlok](https://notlok.app)** - Sesli Notlarınızı AI ile Yönetin

Powered by [ssilistre.dev](https://ssilistre.dev)

</div>
