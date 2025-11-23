# GitHub Actions ile Otomatik Build

Bu kılavuz, GitHub Actions kullanarak Windows, macOS ve Linux için otomatik build almayı açıklar.

## 🎯 Avantajlar

- ✅ **ÜCRETSİZ** - Public repo için sınırsız
- ✅ **Otomatik** - Tag push ettiğinizde build alınır
- ✅ **Multi-platform** - Windows, macOS, Linux hepsi bir arada
- ✅ **GitHub'da hosted** - Kendi sunucu gerekmez
- ✅ **Artifact storage** - Build'ler otomatik saklanır

---

## 📋 Kurulum Adımları

### 1. GitHub Repository Oluşturun

```bash
cd /Users/ssilistre/Desktop/Project/notlok

# Git init (henüz yapmadıysanız)
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluşturun (notlok), sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/notlok.git
git branch -M main
git push -u origin main
```

### 2. Workflow Dosyası Zaten Hazır

`.github/workflows/build.yml` dosyası oluşturuldu. Bu dosya:
- Her platform için build alır
- Artifact olarak saklar
- Tag push edildiğinde release oluşturur

### 3. Build Almak İçin Tag Push Edin

```bash
# Sürüm numarasını güncelleyin
# package.json ve src-tauri/tauri.conf.json'da version'ı değiştirin

git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 4. GitHub Actions Çalışmayı Başlatır

- GitHub repo sayfanıza gidin
- "Actions" sekmesine tıklayın
- Build işlemini izleyin (yaklaşık 20-30 dakika)

### 5. Build'leri İndirin

**Yöntem 1: Artifacts (Her push için)**
- Actions → Workflow run → Artifacts bölümünden indirin
  - `macos-universal` → .dmg ve .app
  - `windows-x64` → .msi ve .exe
  - `linux-x64` → .deb ve .AppImage

**Yöntem 2: Releases (Tag push için)**
- Releases sekmesine gidin
- Draft release'i düzenleyin
- Publish edin
- Kullanıcılar buradan indirebilir

---

## 🚀 Manuel Workflow Tetikleme

Tag oluşturmadan test etmek için:

1. GitHub repo → Actions
2. "Build and Release" workflow'u seçin
3. "Run workflow" → "Run workflow"
4. İşlem biter → Artifacts'ten indirin

---

## ⚙️ Özelleştirme

### Sadece Windows Build İçin

`.github/workflows/build.yml` içinde `matrix.platform` bölümünü düzenleyin:

```yaml
matrix:
  platform:
    - os: windows-latest
      target: x86_64-pc-windows-msvc
      arch: x64
```

### Build Ayarlarını Değiştirme

Workflow dosyasında:
- `node-version: 20` → Node.js versiyonu
- `targets:` → Rust hedef platformları
- `path:` → Build çıktı yolları

---

## 🔐 Code Signing (Opsiyonel)

### macOS için

1. Apple Developer Program üyeliği
2. Certificate oluşturun
3. GitHub Secrets ekleyin:
   - `APPLE_CERTIFICATE`
   - `APPLE_CERTIFICATE_PASSWORD`
   - `APPLE_ID`
   - `APPLE_TEAM_ID`

### Windows için

1. Code signing certificate alın
2. GitHub Secrets ekleyin:
   - `WINDOWS_CERTIFICATE`
   - `WINDOWS_CERTIFICATE_PASSWORD`

---

## 📊 Build Süreleri

Ortalama süreler (GitHub-hosted runners):
- **macOS Universal**: ~25-30 dakika
- **Windows x64**: ~15-20 dakika
- **Linux x64**: ~10-15 dakika

**Toplam**: ~50-60 dakika (paralel çalışır)

---

## 💡 İpuçları

### 1. Private Repository
Private repo'da da çalışır ama:
- Free plan: 2,000 dakika/ay
- Pro plan: 3,000 dakika/ay
- Team plan: 10,000 dakika/ay

### 2. Cache Kullanımı
Hızlandırmak için workflow'a ekleyin:

```yaml
- name: Cache Rust
  uses: actions/cache@v3
  with:
    path: |
      ~/.cargo/bin/
      ~/.cargo/registry/index/
      ~/.cargo/registry/cache/
      ~/.cargo/git/db/
      src-tauri/target/
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```

### 3. Bildirimler
Workflow tamamlandığında email alırsınız (GitHub settings'ten)

---

## 🐛 Sorun Giderme

### Build Başarısız Olursa

1. **Actions** sekmesinden log'lara bakın
2. Hangi adımda hata verdiğini görün
3. Yaygın sorunlar:
   - Bağımlılık eksik
   - Syntax hatası
   - Memory/disk doldu

### Bağımlılık Hataları

Windows için `Cargo.toml` kontrol edin:
```toml
[target.'cfg(windows)'.dependencies]
windows = { version = "0.51", features = ["..."] }
```

### Secrets Eksik

Code signing yapıyorsanız secrets gereklidir. Yoksa:
```yaml
env:
  TAURI_PRIVATE_KEY: ""  # Boş bırakın
```

---

## 📦 Alternatif: Windows Sanal Sunucu

Eğer GitHub Actions kullanmak istemezseniz:

### Azure/AWS/DigitalOcean Windows VM

```powershell
# VM'de:
# 1. Rust kur
winget install --id Rustlang.Rustup

# 2. Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --add Microsoft.VisualStudio.Workload.VCTools"

# 3. Node.js
winget install OpenJS.NodeJS

# 4. Git clone
git clone https://github.com/KULLANICI_ADINIZ/notlok.git
cd notlok

# 5. Build
npm install
npm run tauri build
```

**Maliyet**: 
- Azure B2s: ~$30-40/ay
- AWS t3.medium: ~$30/ay
- DigitalOcean: $24/ay (4GB RAM)

**Dezavantajlar**:
- Aylık maliyet
- Manuel yönetim
- Güvenlik güncellemeleri

---

## ✅ Sonuç

**Öneri**: GitHub Actions kullanın çünkü:
1. Ücretsiz
2. Otomatik
3. Multi-platform
4. Bakım gerektirmez
5. CI/CD best practice

Sadece kodu push edin, 30 dakika sonra her platform için build'iniz hazır! 🚀

