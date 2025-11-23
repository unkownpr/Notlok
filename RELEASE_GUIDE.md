# 🚀 Release Kılavuzu

GitHub Actions ile otomatik multi-platform build ve release oluşturma.

---

## ✅ v1.0.0 Release Tetiklendi!

GitHub Actions şu anda çalışıyor. İşte neler oluyor:

### 📊 Build Pipeline

```
Tag Push (v1.0.0)
    ↓
GitHub Actions Tetiklendi
    ↓
    ├─→ macOS Build (15-20 dk)
    │   ├─ Apple Silicon (aarch64)
    │   └─ DMG Installer
    │
    └─→ Windows Build (15-20 dk)
        ├─ MSI Installer
        └─ NSIS Installer (EXE)
    ↓
Draft Release Oluşturuldu
    ↓
Artifacts Yüklendi
```

---

## 🔍 Build'leri İzleme

### 1. Actions Sayfasına Gidin

```
https://github.com/unkownpr/Notlok/actions
```

### 2. "Build and Release" Workflow'unu Seçin

En üstteki çalışan (sarı nokta) workflow'a tıklayın.

### 3. İlerlemeyi İzleyin

Her platform için ayrı job göreceksiniz:
- 🍎 **build (macos-latest)** - Apple Silicon (M1/M2/M3/M4)
- 🪟 **build (windows-latest)** - MSI + EXE

### 4. Logları Kontrol Edin

Herhangi bir job'a tıklayarak detaylı log görebilirsiniz.

---

## 📦 Build Tamamlandığında

### Artifacts'i İndirme (Hemen)

Build tamamlandığında artifacts bölümünden indirebilirsiniz:

1. Actions → Tamamlanan workflow
2. En alta scroll → **Artifacts** bölümü
3. Platform'ları indirin:
   - `macos-aarch64` → Notlok_1.0.0_aarch64.dmg (Apple Silicon only)
   - `windows-x64` → Notlok_1.0.0_x64.msi / .exe

> **Not**: Artifacts 90 gün saklanır.

### Release'i Yayınlama (Sonra)

Tag push ettiğiniz için otomatik **draft release** oluşturuldu:

1. Repository → **Releases** sekmesi
2. Draft release'i görün
3. İsterseniz açıklamayı düzenleyin
4. **Publish release** tıklayın

Artık kullanıcılar buradan indirebilir!

---

## 🎯 Gelecekteki Release'ler

### Yeni Sürüm İçin:

```bash
# 1. Sürüm numarasını güncelleyin
# package.json ve src-tauri/tauri.conf.json'da version değiştirin

# 2. Değişiklikleri commit edin
git add .
git commit -m "Bump version to 1.0.1"
git push

# 3. Tag oluşturun ve push edin
git tag -a v1.0.1 -m "Release v1.0.1

New features:
- Feature 1
- Feature 2

Bug fixes:
- Fix 1
- Fix 2"

git push origin v1.0.1
```

### Otomatik Script ile:

```bash
./prepare-release.sh
# Sürüm numarasını girin
# Script her şeyi otomatik yapar
```

---

## 🔧 Workflow Yapılandırması

Workflow dosyası: `.github/workflows/build.yml`

### Build Matrix:

| Platform | OS | Target | Süre |
|----------|-----|---------|------|
| macOS | macos-latest | aarch64-apple-darwin | ~15-20 dk |
| Windows | windows-latest | x86_64-pc-windows-msvc | ~15-20 dk |

### Paralel Çalışma

Her iki platform paralel build alır → Toplam ~20 dakika

### ⚠️ Intel Mac Notu

Intel Mac (x86_64) desteği Swift kodu sınırlaması nedeniyle GitHub Actions'ta mevcut değil.
Intel Mac kullanıcıları local build yapmalı: `npm run tauri build`

---

## 📝 Build Çıktıları

### macOS (Apple Silicon Only)
- `Notlok_1.0.0_aarch64.dmg` - Disk image (M1/M2/M3/M4 Macs)
- `Notlok.app` - Application bundle

**Intel Mac kullanıcıları**: Local build gerekli

### Windows
- `Notlok_1.0.0_x64.msi` - MSI installer (önerilen)
- `Notlok_1.0.0_x64-setup.exe` - NSIS installer

---

## 🐛 Sorun Giderme

### Build Başarısız Olursa

1. **Actions loglarına bakın**
   - Hangi adımda hata verdiğini görün
   - Hata mesajını okuyun

2. **Yaygın Sorunlar:**

   **macOS:**
   - Framework bulunamadı → Xcode versiyonu
   - Signing hatası → Ignore edin (development)
   
   **Windows:**
   - Dependency eksik → Cargo.toml kontrol
   - Compile error → Rust versiyonu
   
   **Linux:**
   - Missing library → Ubuntu packages

3. **Düzeltme:**
   - Kodu düzeltin
   - Commit + push
   - Yeni tag oluşturun (v1.0.0-fix1)

### Workflow'u Manuel Tetikleme

Tag beklemeden test etmek için:

1. Actions sekmesi
2. "Build and Release" workflow
3. "Run workflow" → Branch: main
4. "Run workflow" tıklayın

Artifacts oluşur ama release olmaz.

---

## ✅ Kontrol Listesi

Release öncesi kontrol edin:

- [ ] Version numaraları güncellendi
- [ ] CHANGELOG.md eklendi
- [ ] Tests passed
- [ ] Linter temiz
- [ ] LICENSE güncel
- [ ] README güncel
- [ ] Tag mesajı açıklayıcı
- [ ] Commit'ler temiz

---

## 📚 Daha Fazla Bilgi

- [GITHUB_ACTIONS_GUIDE.md](./GITHUB_ACTIONS_GUIDE.md) - Detaylı GitHub Actions kılavuzu
- [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) - Manuel build kılavuzu
- [QUICK_START.md](./QUICK_START.md) - Hızlı başlangıç

---

## 🎉 İlk Release'iniz Hazır!

Artık her tag push ettiğinizde:
1. ✅ Otomatik build alınır
2. ✅ Tüm platformlar desteklenir
3. ✅ Draft release oluşturulur
4. ✅ Artifacts saklanır

**Şu anda Actions çalışıyor:**
https://github.com/unkownpr/Notlok/actions

30 dakika sonra buluşalım! ☕
