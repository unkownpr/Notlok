# 📥 Build'leri İndirme Kılavuzu

GitHub Actions build'leri başarılı ama otomatik release oluşturma izni yok (403 hatası).
Bu normal bir durum ve build'ler yine de kullanılabilir!

---

## ✅ Build'ler Hazır!

GitHub Actions başarıyla build aldı:
- 🍎 macOS Apple Silicon (M1/M2/M3/M4)
- 🪟 Windows x64

---

## 📥 Adım 1: Artifacts'e Gidin

1. GitHub repository'nize gidin:
   ```
   https://github.com/unkownpr/Notlok
   ```

2. **Actions** sekmesine tıklayın

3. En üstteki **tamamlanmış** (yeşil tik ✓) workflow'a tıklayın
   - İsmi: "Build and Release"
   - Tag: v1.0.0

4. Sayfayı aşağı scroll edin → **Artifacts** bölümünü bulun

---

## 📦 Adım 2: Platform Build'lerini İndirin

Artifacts bölümünde 2 dosya göreceksiniz:

### 🍎 macOS Build
```
macos-aarch64.zip
```
İçinde:
- `Notlok_1.0.0_aarch64.dmg` - Installer
- `Notlok.app` - Application

**Uyumlu**: M1, M2, M3, M4 Mac'ler

### 🪟 Windows Build
```
windows-x64.zip
```
İçinde:
- `Notlok_1.0.0_x64.msi` - MSI installer (önerilen)
- `Notlok_1.0.0_x64-setup.exe` - NSIS installer

**Uyumlu**: Windows 10/11 x64

### ⏬ İndirme

Her bir artifact'e tıklayın → Otomatik indirilir (ZIP formatında)

---

## 📤 Adım 3: Manuel Release Oluşturun (Opsiyonel)

Build'leri GitHub Releases'te yayınlamak için:

### 1. Releases Sayfasına Gidin

```
https://github.com/unkownpr/Notlok/releases
```

### 2. "Draft a new release" Tıklayın

### 3. Release Bilgilerini Doldurun

**Tag**: `v1.0.0` (mevcut tag'i seçin)

**Release title**: `Notlok v1.0.0`

**Description**:
```markdown
## 🎉 Notlok v1.0.0 - First Release

### ✨ Features
- Real-time audio transcription with Whisper AI
- Multi-language support (Turkish/English)
- AI-powered meeting summaries (Notlok AI / Gemini)
- Audio device selection (microphone + system audio)
- Recording history
- Auto-update system
- License management with LemonSqueezy

### 📦 Downloads

#### macOS (Apple Silicon Only)
Download `Notlok_1.0.0_aarch64.dmg`
- Compatible with M1, M2, M3, M4 Macs
- **Intel Mac users**: See BUILD_AND_DEPLOY.md for local build

#### Windows
Download `Notlok_1.0.0_x64.msi` (recommended) or `.exe`
- Compatible with Windows 10/11 x64

### 📄 License
This software requires a valid license key.
Get yours at [notlok.app](https://notlok.app)
```

### 4. Dosyaları Upload Edin

**Attach binaries** bölümünde:
1. İndirdiğiniz ZIP'leri extract edin
2. Dosyaları sürükleyip bırakın:
   - `Notlok_1.0.0_aarch64.dmg`
   - `Notlok_1.0.0_x64.msi`
   - `Notlok_1.0.0_x64-setup.exe`

### 5. Yayınlayın

- **"Set as a pre-release"** işaretsiz bırakın
- **"Set as the latest release"** işaretli olsun
- **"Publish release"** tıklayın

✅ Artık herkes Releases sekmesinden indirebilir!

---

## 🔄 Gelecekteki Build'ler

Her yeni tag push ettiğinizde:
1. GitHub Actions otomatik build alır
2. Artifacts'ten indirin
3. İsterseniz manuel release oluşturun

### Hızlı Komut:
```bash
git tag v1.0.1
git push origin v1.0.1
# ~20 dakika bekleyin
# Actions → Artifacts'ten indirin
```

---

## 💡 İpuçları

### Artifacts Saklama Süresi
- **90 gün** saklanır
- Sonra otomatik silinir
- O yüzden release oluşturmak önemli

### Lisans Gereksinimi
- Uygulama çalışması için lisans anahtarı gerekli
- [notlok.app](https://notlok.app)'ten alınabilir

### Test Etme
İndirdiğiniz build'leri test edin:
1. macOS: DMG'yi aç → Uygulamayı kopyala
2. Windows: MSI'ı çalıştır → Kur
3. Lisans gir → Test et

---

## 🐛 Sorun mu Var?

### Build Başarısız Olursa
Actions → Workflow → Logs'a bakın

### İzin Hatası (403)
Normal! Artifacts kullanın veya manuel release oluşturun

### Build Bulamıyorum
- Actions sekmesi → "Build and Release" workflow
- Yeşil tik ✓ olan workflow
- En alta scroll → Artifacts

---

## 📚 Daha Fazla

- [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) - Detaylı release kılavuzu
- [GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md) - Actions rehberi
- [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) - Local build

---

**🎉 Build'leriniz hazır ve kullanıma uygun!**
