# Notlok - Build ve Dağıtım Kılavuzu

Bu dokümantasyon, Notlok uygulamasını macOS ve Windows için nasıl build alacağınızı ve dağıtacağınızı açıklar.

---

## 📋 İçindekiler

- [Gereksinimler](#gereksinimler)
- [Proje Yapısı](#proje-yapısı)
- [macOS için Build](#macos-için-build)
- [Windows için Build](#windows-için-build)
- [Sürüm Güncelleme](#sürüm-güncelleme)
- [Code Signing ve Notarization](#code-signing-ve-notarization)
- [Dağıtım](#dağıtım)
- [Sorun Giderme](#sorun-giderme)

---

## 🔧 Gereksinimler

### Genel Gereksinimler
- **Node.js** (v18 veya üzeri)
- **npm** veya **pnpm**
- **Rust** (latest stable)
- **Git**

### macOS için
- **Xcode** (14 veya üzeri)
- **Xcode Command Line Tools**
- **Apple Developer hesabı** (opsiyonel, code signing için)

```bash
# Xcode Command Line Tools kurulumu
xcode-select --install

# Rust kurulumu (eğer yoksa)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Windows için
- **Visual Studio 2022** (C++ Build Tools)
- **Rust** (MSVC toolchain)
- **WebView2 Runtime** (otomatik dahil edilir)

```powershell
# Rust kurulumu (PowerShell)
# https://rustup.rs adresinden indirin

# Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/
# "Desktop development with C++" workload'unu seçin
```

---

## 📁 Proje Yapısı

```
notlok/
├── src/                    # React frontend
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs
│   │   ├── audio_capture.rs
│   │   └── transcription.rs
│   ├── swift/              # macOS Swift kod
│   │   └── AudioCapture.swift
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```

---

## 🍎 macOS için Build

### 1. Bağımlılıkları Yükleyin

```bash
# Proje dizinine gidin
cd notlok

# Node.js bağımlılıkları
npm install

# Rust bağımlılıkları otomatik yüklenecek
```

### 2. Development Build

```bash
# Development modunda çalıştır
npm run tauri dev
```

### 3. Production Build

```bash
# Production build
npm run tauri build
```

Build tamamlandığında dosyalar şurada olacak:

```
src-tauri/target/release/bundle/
├── dmg/                    # DMG installer
│   └── Notlok_0.1.0_aarch64.dmg
└── macos/                  # .app bundle
    └── Notlok.app
```

### 4. Farklı Mimariler için Build

```bash
# Apple Silicon (M1/M2/M3) için
npm run tauri build -- --target aarch64-apple-darwin

# Intel Mac için
npm run tauri build -- --target x86_64-apple-darwin

# Universal Binary (hem Intel hem Apple Silicon)
npm run tauri build -- --target universal-apple-darwin
```

### 5. DMG Özelleştirme

`src-tauri/tauri.conf.json` dosyasında DMG ayarlarını düzenleyin:

```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "dmg": {
          "appPosition": {
            "x": 180,
            "y": 170
          },
          "applicationFolderPosition": {
            "x": 480,
            "y": 170
          },
          "windowSize": {
            "width": 660,
            "height": 400
          }
        }
      }
    }
  }
}
```

---

## 🪟 Windows için Build

### 1. Bağımlılıkları Yükleyin

```powershell
# Proje dizinine gidin
cd notlok

# Node.js bağımlılıkları
npm install
```

### 2. Development Build

```powershell
# Development modunda çalıştır
npm run tauri dev
```

### 3. Production Build

```powershell
# Production build
npm run tauri build
```

Build tamamlandığında dosyalar şurada olacak:

```
src-tauri/target/release/bundle/
├── msi/                    # MSI installer
│   └── Notlok_0.1.0_x64_en-US.msi
└── nsis/                   # NSIS installer (opsiyonel)
    └── Notlok_0.1.0_x64-setup.exe
```

### 4. Installer Türleri

`src-tauri/tauri.conf.json` dosyasında installer türlerini seçin:

```json
{
  "tauri": {
    "bundle": {
      "targets": ["msi", "nsis"],
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    }
  }
}
```

**MSI (Microsoft Installer):**
- Daha profesyonel
- Kurumsal ortamlarda tercih edilir
- Group Policy ile yönetilebilir

**NSIS (Nullsoft Scriptable Install System):**
- Daha küçük dosya boyutu
- Daha esnek özelleştirme
- Modern görünüm

---

## 🔢 Sürüm Güncelleme

### 1. package.json

```json
{
  "name": "notlok",
  "version": "0.2.0",  // ← Burası
  "description": "Notlok - AI Destekli Sesli Not Uygulaması"
}
```

### 2. src-tauri/Cargo.toml

```toml
[package]
name = "notlok"
version = "0.2.0"  # ← Burası
description = "Notlok - AI Destekli Sesli Not Uygulaması"
```

### 3. src-tauri/tauri.conf.json

```json
{
  "package": {
    "productName": "Notlok",
    "version": "0.2.0"  // ← Burası
  }
}
```

### Otomatik Güncelleme

Tüm sürüm numaralarını güncellemek için:

```bash
# package.json versiyonunu güncelle
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Diğer dosyaları manuel güncelleyin
```

---

## 🔐 Code Signing ve Notarization

### macOS Code Signing

#### 1. Developer Certificate'i Alın

- Apple Developer hesabı gerekli
- Xcode > Preferences > Accounts > Manage Certificates

#### 2. Certificate Bilgilerini Tauri'ye Verin

```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
        "entitlements": "./entitlements.plist",
        "providerShortName": "TEAM_ID"
      }
    }
  }
}
```

#### 3. Notarization

```bash
# Build sonrası notarize et
xcrun notarytool submit \
  "src-tauri/target/release/bundle/dmg/Notlok_0.1.0_aarch64.dmg" \
  --apple-id "your@email.com" \
  --team-id "TEAM_ID" \
  --password "app-specific-password" \
  --wait

# Notarization başarılıysa staple et
xcrun stapler staple \
  "src-tauri/target/release/bundle/dmg/Notlok_0.1.0_aarch64.dmg"
```

#### 4. Entitlements Dosyası

`src-tauri/entitlements.plist` oluşturun:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.device.audio-input</key>
    <true/>
    <key>com.apple.security.device.camera</key>
    <true/>
</dict>
</plist>
```

### Windows Code Signing

#### 1. Certificate Alın

- DigiCert, Sectigo, veya benzeri CA'den
- EV Code Signing Certificate önerilir

#### 2. Certificate'i Import Edin

```powershell
# Certificate'i Windows Certificate Store'a import edin
# certmgr.msc ile kontrol edin
```

#### 3. tauri.conf.json Güncelleyin

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

#### 4. Thumbprint Bulma

```powershell
# PowerShell
Get-ChildItem -Path Cert:\CurrentUser\My | Format-List Thumbprint, Subject
```

---

## 📦 Dağıtım

### 1. GitHub Releases

```bash
# GitHub Release oluştur
gh release create v0.1.0 \
  src-tauri/target/release/bundle/dmg/Notlok_0.1.0_aarch64.dmg \
  src-tauri/target/release/bundle/msi/Notlok_0.1.0_x64_en-US.msi \
  --title "Notlok v0.1.0" \
  --notes "Release notes burada"
```

### 2. Otomatik Update (Tauri Updater)

#### tauri.conf.json'a ekleyin:

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.myapp.com/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

#### Update JSON formatı:

```json
{
  "version": "0.2.0",
  "notes": "Yeni özellikler ve düzeltmeler",
  "pub_date": "2024-01-01T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "...",
      "url": "https://releases.myapp.com/Notlok_0.2.0_aarch64.dmg"
    },
    "darwin-x86_64": {
      "signature": "...",
      "url": "https://releases.myapp.com/Notlok_0.2.0_x64.dmg"
    },
    "windows-x86_64": {
      "signature": "...",
      "url": "https://releases.myapp.com/Notlok_0.2.0_x64.msi"
    }
  }
}
```

### 3. Web Sitesi / Landing Page

- DMG ve MSI dosyalarını sunun
- Sistem gereksinimlerini belirtin
- Kurulum talimatlarını ekleyin
- Changelog yayınlayın

### 4. Lemon Squeezy / Gumroad Entegrasyonu

Zaten entegre! Kullanıcılar lisans anahtarı ile uygulamayı aktive edebilir.

---

## 🐛 Sorun Giderme

### macOS

#### "App is damaged and can't be opened"
```bash
# Quarantine attribute'unu kaldır
xattr -cr /Applications/Notlok.app
```

#### Swift Build Hatası
```bash
# Swift derleyici yolunu kontrol et
which swiftc
xcrun --find swiftc

# Build klasörünü temizle
rm -rf src-tauri/target
```

#### Screen Recording Permission
- System Settings > Privacy & Security > Screen Recording
- Notlok'u ekleyin ve yeniden başlatın

### Windows

#### MSVC Build Tools Hatası
```powershell
# Visual Studio Installer ile "Desktop development with C++" yükleyin
# Yeniden başlatın
```

#### WebView2 Runtime Hatası
```powershell
# WebView2 otomatik yüklenir, manuel kurulum için:
# https://developer.microsoft.com/microsoft-edge/webview2/
```

#### Antivirus Uyarıları
- Code signing ile çözülür
- Windows Defender SmartScreen bypass için EV certificate gerekli

### Her İki Platform

#### Rust Build Hatası
```bash
# Cargo cache'i temizle
cargo clean

# Dependencies'i güncelle
cargo update

# Toolchain'i güncelle
rustup update
```

#### Node.js Bağımlılık Hatası
```bash
# node_modules'u sil ve yeniden yükle
rm -rf node_modules package-lock.json
npm install

# veya
pnpm install --force
```

---

## 📊 Build Checklist

### Yeni Sürüm Çıkarmadan Önce

- [ ] Sürüm numaralarını güncelleyin (package.json, Cargo.toml, tauri.conf.json)
- [ ] CHANGELOG.md dosyasını güncelleyin
- [ ] Tüm testleri çalıştırın
- [ ] macOS build alın ve test edin
- [ ] Windows build alın ve test edin
- [ ] Code signing yapın (varsa)
- [ ] Notarization yapın (macOS)
- [ ] GitHub Release oluşturun
- [ ] Web sitesini güncelleyin
- [ ] Müşterilere email gönderin

---

## 🔗 Faydalı Linkler

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri Bundle Configuration](https://tauri.app/v1/api/config/#bundleconfig)
- [Apple Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Windows Code Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [Rust Documentation](https://doc.rust-lang.org/)

---

## 💡 İpuçları

1. **CI/CD Pipeline Kurun**: GitHub Actions ile otomatik build
2. **Beta Channel Oluşturun**: Erken erişim için
3. **Telemetry Ekleyin**: Crash report ve analytics
4. **Auto-Update Aktif Edin**: Kullanıcılar her zaman güncel kalsın
5. **Backup Alın**: Build artifact'larını saklayın

---

## 📝 Notlar

- **macOS**: M1/M2/M3 (Apple Silicon) için `aarch64`, Intel için `x86_64` hedefleyin
- **Windows**: 64-bit (`x86_64`) tavsiye edilir, 32-bit (`i686`) eski sistemler için
- **Minimum macOS**: 10.15 (Catalina) veya üzeri
- **Minimum Windows**: Windows 10 1809 veya üzeri

---

**Son Güncelleme**: Kasım 2025
**Yazar**: ssilistre.dev
**Proje**: Notlok - AI Destekli Sesli Not Uygulaması

