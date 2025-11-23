# Tauri Otomatik Güncelleme Sistemi Rehberi

Bu doküman, Notlok gibi Tauri uygulamaları için profesyonel bir otomatik güncelleme sistemi kurmanın detaylı rehberidir.

## 📋 İçindekiler

1. [Otomatik Güncelleme Nasıl Çalışır?](#nasıl-çalışır)
2. [Gereksinimler](#gereksinimler)
3. [Adım Adım Kurulum](#kurulum)
4. [Güncelleme Sunucusu](#sunucu)
5. [Kod İmzalama](#imzalama)
6. [Uygulama Kodu](#kod)
7. [Test](#test)
8. [Deployment](#deployment)

---

## 🎯 Nasıl Çalışır?

### Temel Akış:

```
┌─────────────┐
│  Uygulama   │
│  Açılıyor   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Güncelleme Kontrolü         │
│ (Sunucuya istek)            │
└──────┬──────────────────────┘
       │
       ▼
   ┌───────┐
   │ Yeni  │
   │Sürüm? │
   └───┬───┘
       │
   ┌───▼────┐
   │  Evet  │────────┐
   └────────┘        │
       │             │
       ▼             │
┌─────────────┐     │
│ Kullanıcıya │     │
│   Bildir    │     │
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐    │
│  İndir ve   │    │
│   Yükle     │    │
└──────┬──────┘    │
       │           │
       ▼           │
┌─────────────┐   │
│  Yeniden    │   │
│  Başlat     │   │
└─────────────┘   │
                  │
   ┌──────────────┘
   │  Hayır
   ▼
┌─────────────┐
│  Devam Et   │
└─────────────┘
```

### Teknik Detaylar:

1. **Uygulama başladığında** → Sunucuya version check isteği
2. **Sunucu yanıt verir** → `latest.json` dosyası (versiyon, URL, imza)
3. **Karşılaştırma** → Mevcut version vs Sunucu version
4. **Yeni sürüm varsa** → Dialog göster
5. **Kullanıcı onaylarsa** → Arkaplanda indir
6. **İndirme tamamlandı** → Signature doğrula
7. **Kurulum** → Uygulamayı yeniden başlat

---

## ✅ Gereksinimler

### 1. Tauri Updater Plugin

```bash
npm install @tauri-apps/plugin-updater
```

### 2. Code Signing Sertifikası

**macOS:**
- Apple Developer hesabı ($99/yıl)
- Developer ID Application certificate

**Windows:**
- Code signing certificate (Sectigo, DigiCert, vb.)
- Fiyat: ~$100-300/yıl

**Linux:**
- İsteğe bağlı (GPG imzası kullanılabilir)

### 3. Güncelleme Sunucusu

Aşağıdakilerden biri:
- **GitHub Releases** (Ücretsiz, popüler)
- **S3 + CloudFront** (AWS)
- **Kendi sunucunuz** (VPS)
- **Tauri Action** (GitHub Actions ile otomatik)

---

## 🔧 Kurulum

### Adım 1: `tauri.conf.json` Yapılandırması

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "com.notlok.app",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    },
    "macOS": {
      "entitlements": null,
      "exceptionDomain": "",
      "frameworks": [],
      "providerShortName": null,
      "signingIdentity": null
    }
  },
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.notlok.app/{{target}}/{{arch}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### Adım 2: Package.json Version

```json
{
  "name": "notlok",
  "version": "1.0.0",  // ← Bu önemli!
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  }
}
```

### Adım 3: Cargo.toml Version

```toml
[package]
name = "notlok"
version = "1.0.0"  # ← Bu da önemli!
edition = "2021"
```

**ÖNEMLİ:** Her iki version numarası da **aynı** olmalı!

---

## 🔑 Kod İmzalama (Code Signing)

### Neden Gerekli?

1. **Güvenlik:** Güncellemelerin sizden geldiğini doğrular
2. **macOS Gatekeeper:** İmzasız uygulamalar engellenir
3. **Windows SmartScreen:** İmzasız uygulamalar uyarı verir
4. **Kullanıcı Güveni:** Profesyonel görünüm

### Anahtar Çifti Oluşturma

```bash
# Tauri CLI ile
npm run tauri signer generate -- -w ~/.tauri/notlok.key

# Veya
tauri signer generate -w ~/.tauri/notlok.key
```

Bu komut iki dosya oluşturur:
- `~/.tauri/notlok.key` → **Private key** (GİZLİ TUT!)
- `~/.tauri/notlok.key.pub` → Public key (paylaşılabilir)

### Public Key'i tauri.conf.json'a Ekle

```json
{
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEFCQ0RFRkdISUpL..."
    }
  }
}
```

### Private Key'i Güvenli Sakla

**Local Development:**
```bash
export TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/notlok.key)
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="your_secure_password"
```

**GitHub Actions:**
- Repository Settings → Secrets
- `TAURI_SIGNING_PRIVATE_KEY` → Key içeriği
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` → Şifre

**⚠️ ASLA GIT'E COMMIT ETME!**

`.gitignore`:
```
*.key
*.key.pub
```

---

## 🌐 Güncelleme Sunucusu

### Seçenek 1: GitHub Releases (Önerilen - Ücretsiz)

#### 1.1. GitHub Actions Workflow

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies (ubuntu only)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev \
            libappindicator3-dev librsvg2-dev patchelf

      - name: Install frontend dependencies
        run: npm install

      - name: Build and Release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: v__VERSION__
          releaseName: 'Notlok v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: false
          prerelease: false
```

#### 1.2. Release Yapmak

```bash
# 1. Version'ı güncelle
# package.json ve Cargo.toml'da 1.0.0 → 1.0.1

# 2. Commit
git add .
git commit -m "chore: bump version to 1.0.1"

# 3. Tag oluştur
git tag v1.0.1

# 4. Push
git push origin main
git push origin v1.0.1

# 5. GitHub Actions otomatik çalışır ve release oluşturur
```

#### 1.3. Endpoint Ayarı

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://github.com/username/notlok/releases/latest/download/latest.json"
      ]
    }
  }
}
```

### Seçenek 2: Kendi Sunucunuz

#### 2.1. Sunucu Yapısı

```
https://updates.notlok.app/
├── darwin/
│   ├── aarch64/
│   │   └── 1.0.0/
│   │       └── latest.json
│   └── x86_64/
│       └── 1.0.0/
│           └── latest.json
├── windows/
│   └── x86_64/
│       └── 1.0.0/
│           └── latest.json
└── linux/
    └── x86_64/
        └── 1.0.0/
            └── latest.json
```

#### 2.2. latest.json Format

```json
{
  "version": "1.0.1",
  "notes": "Bug fixes and improvements",
  "pub_date": "2024-11-23T10:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://updates.notlok.app/Notlok_1.0.1_aarch64.app.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://updates.notlok.app/Notlok_1.0.1_x64.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://updates.notlok.app/Notlok_1.0.1_x64_en-US.msi.zip"
    }
  }
}
```

#### 2.3. Nginx Yapılandırması

```nginx
server {
    listen 443 ssl http2;
    server_name updates.notlok.app;

    ssl_certificate /etc/letsencrypt/live/updates.notlok.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/updates.notlok.app/privkey.pem;

    root /var/www/updates;

    location / {
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    location ~ \.json$ {
        add_header Content-Type application/json;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## 💻 Uygulama Kodu

### Rust (Backend)

`src-tauri/src/lib.rs`:

```rust
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    check_for_updates(handle).await;
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(desktop)]
async fn check_for_updates(app: tauri::AppHandle) {
    use tauri_plugin_updater::UpdaterExt;

    // 5 saniye bekle (uygulama tamamen yüklenmesi için)
    tokio::time::sleep(std::time::Duration::from_secs(5)).await;

    match app.updater() {
        Ok(updater) => {
            match updater.check().await {
                Ok(Some(update)) => {
                    println!("Yeni güncelleme bulundu: v{}", update.version);
                    
                    // Frontend'e bildirim gönder
                    let _ = app.emit("update-available", &update.version);
                    
                    // Otomatik indir ve kur
                    match update.download_and_install().await {
                        Ok(_) => {
                            println!("Güncelleme yüklendi, yeniden başlatılıyor...");
                            std::process::exit(0);
                        }
                        Err(e) => {
                            eprintln!("Güncelleme hatası: {}", e);
                        }
                    }
                }
                Ok(None) => {
                    println!("Güncelleme yok, en son sürümdesiniz");
                }
                Err(e) => {
                    eprintln!("Güncelleme kontrolü hatası: {}", e);
                }
            }
        }
        Err(e) => {
            eprintln!("Updater başlatılamadı: {}", e);
        }
    }
}
```

### React (Frontend)

`src/App.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    // Güncelleme bildirimini dinle
    const unlisten = listen('update-available', (event) => {
      setNewVersion(event.payload as string);
      setUpdateAvailable(true);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  return (
    <div>
      {/* Güncelleme bildirimi */}
      {updateAvailable && (
        <div className="update-banner">
          <div className="update-content">
            <span>🎉 Yeni sürüm {newVersion} indiriliyor...</span>
            <p>Güncelleme tamamlandığında uygulama yeniden başlayacak</p>
          </div>
        </div>
      )}
      
      {/* ... rest of your app */}
    </div>
  );
}
```

### Manuel Güncelleme Kontrolü

```typescript
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

async function checkForUpdates() {
  try {
    const update = await check();
    
    if (update) {
      console.log(`Güncelleme bulundu: ${update.version}`);
      console.log(`Release notları: ${update.body}`);
      console.log(`Tarih: ${update.date}`);

      // Kullanıcıya sor
      const shouldUpdate = window.confirm(
        `Yeni sürüm ${update.version} mevcut!\n\n` +
        `${update.body}\n\n` +
        `Şimdi güncellemek ister misiniz?`
      );

      if (shouldUpdate) {
        // İndir ve kur
        await update.downloadAndInstall();
        
        // Yeniden başlat
        await relaunch();
      }
    } else {
      alert('En son sürümdesiniz! 🎉');
    }
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    alert('Güncelleme kontrolü başarısız');
  }
}

// Ayarlar menüsünde kullan
<button onClick={checkForUpdates}>
  Güncellemeleri Kontrol Et
</button>
```

---

## 🧪 Test

### Local Test

1. **İlk sürümü derle:**
```bash
# Version: 1.0.0
npm run tauri build
```

2. **Test sunucusu kur:**
```bash
# Python HTTP server
cd src-tauri/target/release/bundle
python3 -m http.server 8000
```

3. **latest.json oluştur:**
```json
{
  "version": "1.0.1",
  "notes": "Test güncellemesi",
  "pub_date": "2024-11-23T10:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "...",
      "url": "http://localhost:8000/macos/Notlok.app.tar.gz"
    }
  }
}
```

4. **tauri.conf.json'da endpoint değiştir:**
```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "http://localhost:8000/latest.json"
      ]
    }
  }
}
```

5. **Uygulamayı aç ve test et!**

### Beta Testing

1. **GitHub Pre-release kullan:**
```yaml
# .github/workflows/release.yml
with:
  prerelease: true  # Beta için
```

2. **Beta tester'lara ver:**
```bash
# Beta endpoint
https://github.com/username/notlok/releases/download/v1.0.0-beta.1/latest.json
```

---

## 🚀 Deployment Checklist

### Release Yapmadan Önce:

- [ ] Version numaralarını güncelle (package.json + Cargo.toml)
- [ ] CHANGELOG.md'yi güncelle
- [ ] Test et (local)
- [ ] Code signing sertifikası geçerli mi?
- [ ] Private key güvenli mi?
- [ ] GitHub Secrets ayarlandı mı?
- [ ] Workflow dosyası doğru mu?

### Release Süreci:

```bash
# 1. Version bump
npm version patch  # 1.0.0 → 1.0.1
# veya
npm version minor  # 1.0.0 → 1.1.0
# veya
npm version major  # 1.0.0 → 2.0.0

# 2. Changelog güncelle
# CHANGELOG.md

# 3. Commit
git add .
git commit -m "chore: release v1.0.1"

# 4. Tag
git tag v1.0.1

# 5. Push
git push origin main --tags

# 6. GitHub Actions otomatik çalışır
```

### Release Sonrası:

- [ ] GitHub Release sayfasını kontrol et
- [ ] Artifacts indirildi mi?
- [ ] latest.json oluştu mu?
- [ ] Eski uygulamayı aç, güncelleme testi yap
- [ ] Beta tester'lara duyur

---

## 📱 Platform Özel Notlar

### macOS

**Notarization:**
```bash
# Apple notarization için
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"
```

**Gatekeeper:**
- İmzalı uygulamalar otomatik açılır
- İmzasız uygulamalar için: System Settings → Privacy & Security

### Windows

**SmartScreen:**
- İlk kullanıcılar için uyarı alabilir
- Çözüm: EV Code Signing Certificate ($300-500/yıl)

**Installer:**
```json
{
  "bundle": {
    "windows": {
      "wix": {
        "language": "en-US",
        "upgradeCode": "UNIQUE-GUID-HERE"
      }
    }
  }
}
```

### Linux

**AppImage:**
- Güncellemeler AppImageUpdate ile
- Otomatik güncelleme sistemi farklı

---

## 💰 Maliyet Analizi

### Ücretsiz Seçenekler:

| Özellik | Maliyet | Not |
|---------|---------|-----|
| GitHub Releases | $0 | 2GB storage, unlimited downloads |
| Tauri Action | $0 | GitHub Actions ile |
| Self-signed | $0 | Test için uygun, production için değil |

### Ücretli Seçenekler:

| Özellik | Maliyet/Yıl | Önerilen? |
|---------|-------------|-----------|
| Apple Developer | $99 | ✅ Zorunlu (macOS) |
| Windows Code Sign | $100-300 | ✅ Önerilen |
| EV Certificate | $300-500 | ⭐ SmartScreen bypass |
| S3 + CloudFront | ~$5-20 | 🤔 İsteğe bağlı |

**Toplam:** ~$200-400/yıl (profesyonel setup için)

---

## 🎓 Best Practices

### 1. Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → İlk release
1.0.1 → Bug fix
1.1.0 → Yeni özellik
2.0.0 → Breaking change
```

### 2. Release Notes

```markdown
# v1.0.1

## 🎉 Yeni Özellikler
- Ses cihazı seçimi eklendi
- Dark mode desteği

## 🐛 Bug Düzeltmeleri
- Kayıt durdurma donması düzeltildi
- Mikrofon izin kontrolü iyileştirildi

## 🔧 İyileştirmeler
- Performans optimizasyonları
- UI/UX geliştirmeleri
```

### 3. Güvenlik

- ✅ HTTPS kullan (Let's Encrypt ücretsiz)
- ✅ Code signing zorunlu
- ✅ Private key'leri GİZLE
- ✅ Signature verification aktif
- ❌ HTTP endpoint kullanma
- ❌ Git'e key commit etme

### 4. Kullanıcı Deneyimi

- Silent update (arkaplanda)
- Progress bar göster
- Release notes göster
- "Şimdi değil" seçeneği
- Otomatik yeniden başlatma

### 5. Error Handling

```typescript
try {
  const update = await check();
  // ...
} catch (error) {
  if (error === 'NETWORK_ERROR') {
    console.log('İnternet bağlantısı yok');
  } else if (error === 'SIGNATURE_INVALID') {
    console.error('Güncelleme imzası geçersiz!');
  } else {
    console.error('Bilinmeyen hata:', error);
  }
}
```

---

## 🔍 Troubleshooting

### Sorun: "Update check failed"

**Nedeni:**
- Sunucu erişilemiyor
- latest.json bulunamadı
- CORS hatası

**Çözüm:**
```bash
# Endpoint'i kontrol et
curl https://your-endpoint/latest.json

# CORS headers'ı kontrol et
curl -I https://your-endpoint/latest.json
```

### Sorun: "Signature verification failed"

**Nedeni:**
- Public key yanlış
- Private key ile imzalanmamış
- Dosya corrupted

**Çözüm:**
```bash
# Public key'i kontrol et
cat tauri.conf.json | grep pubkey

# Signature'ı manuel doğrula
tauri signer verify --public-key <pubkey> --file <binary>
```

### Sorun: "Update downloaded but not installing"

**Nedeni:**
- Yeterli izin yok
- Dosya locked
- Antivirus blocking

**Çözüm:**
- Admin olarak çalıştır
- Uygulamayı kapat
- Antivirus exception ekle

---

## 📚 Kaynaklar

### Resmi Dokümantasyon:
- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [Tauri Action](https://github.com/tauri-apps/tauri-action)
- [Code Signing Guide](https://tauri.app/v1/guides/distribution/sign-macos/)

### Örnek Projeler:
- [Tauri Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Wails Updater](https://wails.io/docs/guides/windows-update/)

### Sertifika Sağlayıcılar:
- [Apple Developer](https://developer.apple.com)
- [Sectigo](https://sectigo.com/ssl-certificates-tls/code-signing)
- [DigiCert](https://www.digicert.com/signing/code-signing-certificates)

---

## 🎯 Özet: Notlok İçin Önerilen Setup

### 1. GitHub Releases Kullan (Ücretsiz)

```bash
# Repository secrets ekle
TAURI_SIGNING_PRIVATE_KEY
TAURI_SIGNING_PRIVATE_KEY_PASSWORD
APPLE_ID (macOS için)
APPLE_PASSWORD (macOS için)
```

### 2. Workflow Dosyası

`.github/workflows/release.yml` (yukarıdaki örnekteki gibi)

### 3. tauri.conf.json

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/yourusername/notlok/releases/latest/download/latest.json"
      ],
      "dialog": false,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### 4. Uygulama Kodu

- Otomatik check (startup)
- Manuel check butonu (ayarlarda)
- Silent update (arkaplanda)

### 5. Release Süreci

```bash
npm version patch
git push --tags
# GitHub Actions otomatik çalışır
```

**Tahmini Maliyet:** $99/yıl (sadece Apple Developer)

---

**Son Güncelleme:** Kasım 2025
**Yazar:** Notlok Development Team

