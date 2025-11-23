# 🚀 Notlok - Hızlı Başlangıç

Windows build almak için 3 basit adım!

---

## 🎯 Yöntem 1: GitHub Actions (Önerilen - ÜCRETSİZ)

### 1️⃣ GitHub'a Push Edin

```bash
cd /Users/ssilistre/Desktop/Project/notlok

# İlk kez ise:
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluşturun: https://github.com/new
# Repo adı: notlok

# Remote ekleyin (KULLANICI_ADINIZ'ı değiştirin):
git remote add origin https://github.com/KULLANICI_ADINIZ/notlok.git
git branch -M main
git push -u origin main
```

### 2️⃣ Release Yapın

```bash
# Otomatik script ile:
./prepare-release.sh

# Manuel olarak:
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 3️⃣ Build'leri İndirin

1. GitHub repo sayfanıza gidin
2. **Actions** sekmesine tıklayın
3. Çalışan workflow'u bekleyin (~30 dakika)
4. **Artifacts** bölümünden indirin:
   - `macos-universal` → .dmg dosyası
   - `windows-x64` → .msi veya .exe dosyası
   - `linux-x64` → .deb veya .AppImage

✅ **Bitti!** Tüm platformlar için build'leriniz hazır.

---

## 💻 Yöntem 2: Windows Sanal Sunucu

Eğer kendi sunucunuzda build almak isterseniz:

### Azure/AWS/DigitalOcean'da Windows VM Kiralayın

**Minimum Gereksinimler:**
- Windows Server 2019/2022
- 4GB RAM
- 30GB Disk
- Maliyet: ~$25-40/ay

### VM'de Build Alın

```powershell
# 1. Rust kur
winget install --id Rustlang.Rustup

# 2. Visual Studio Build Tools (C++ için)
winget install Microsoft.VisualStudio.2022.BuildTools `
  --override "--wait --add Microsoft.VisualStudio.Workload.VCTools"

# 3. Node.js
winget install OpenJS.NodeJS

# 4. Git
winget install Git.Git

# 5. Restart terminal, sonra:
git clone https://github.com/KULLANICI_ADINIZ/notlok.git
cd notlok

# 6. Build
npm install
npm run tauri build

# 7. Build çıktısı:
# src-tauri\target\release\bundle\msi\Notlok_1.0.0_x64.msi
# src-tauri\target\release\bundle\nsis\Notlok_1.0.0_x64-setup.exe
```

---

## 🔄 Karşılaştırma

| Özellik | GitHub Actions | Windows VM |
|---------|---------------|------------|
| **Maliyet** | ÜCRETSİZ | ~$30/ay |
| **Kurulum** | Kolay | Orta |
| **Süre** | 30 dk (otomatik) | 15-20 dk (manuel) |
| **Bakım** | Yok | Gerekli |
| **Multi-platform** | ✅ Evet | ❌ Hayır |
| **CI/CD** | ✅ Entegre | ❌ Manuel |

---

## 📚 Detaylı Dokümantasyon

- **GitHub Actions Kılavuzu**: [GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md)
- **Build ve Deploy**: [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md)
- **Otomatik Güncelleme**: [AUTO_UPDATE_GUIDE.md](./AUTO_UPDATE_GUIDE.md)

---

## ❓ Sıkça Sorulan Sorular

### GitHub Actions dakika limiti var mı?
- **Public repo**: Sınırsız ve ücretsiz
- **Private repo**: 2,000 dk/ay (Free plan)

### Build ne kadar sürer?
- macOS: ~25-30 dakika
- Windows: ~15-20 dakika  
- Linux: ~10-15 dakika
- **Toplam**: ~30 dakika (paralel çalışır)

### Birden fazla build alabilir miyim?
Evet! Her push/tag için otomatik build alınır.

### Windows build'i macOS'ta test edebilir miyim?
Hayır, ama VM'de ya da başka Windows bilgisayarda test edebilirsiniz.

---

## 🎉 Sonuç

**GitHub Actions** kullanmanızı şiddetle tavsiye ederiz çünkü:

1. ✅ Tamamen ücretsiz (public repo)
2. ✅ Otomatik multi-platform build
3. ✅ Sıfır bakım gerektirir
4. ✅ Professional CI/CD pipeline
5. ✅ Her commit için test edebilirsiniz

**Hemen başlayın:**
```bash
./prepare-release.sh
```

İyi geliştirmeler! 🚀

