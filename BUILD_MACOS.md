# macOS Build & Distribution Guide

## DMG "Damaged" Hatası Çözümü

### Hızlı Çözüm (Development/Test)

```bash
# DMG için
xattr -cr /path/to/Notlok.dmg

# Veya mount ettikten sonra .app için
xattr -cr /Applications/Notlok.app
```

### Manuel Açma

1. DMG'yi sağ tıkla → **Open With** → **DiskImageMounter**
2. Veya Terminal'den:
```bash
hdiutil attach Notlok.dmg -noverify
```

## Production Build (Code Signing)

### 1. Prerequisites

- **Apple Developer Account** ($99/yıl)
- **Developer ID Application Certificate** yüklü olmalı
- **App-Specific Password** oluşturulmuş olmalı

### 2. Certificate Kontrol

```bash
# Certificate'ları listele
security find-identity -v -p codesigning

# Çıktı şuna benzer olmalı:
# 1) XXXXX "Developer ID Application: Your Name (TEAM_ID)"
```

### 3. Certificate Yoksa

1. https://developer.apple.com/account adresine git
2. **Certificates, IDs & Profiles** → **Certificates**
3. **+** → **Developer ID Application**
4. CSR oluştur ve yükle
5. Certificate'ı indir ve Keychain'e ekle

### 4. Build Komutları

#### Ad-hoc Signing (Test)
```bash
npm run tauri:build
```

#### Production Signing
```bash
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
npm run tauri:build
```

#### Universal Binary (Intel + Apple Silicon)
```bash
npm run tauri:build:mac:universal
```

## Notarization (Apple Onayı)

### 1. App-Specific Password Oluştur

1. https://appleid.apple.com → **Sign-In and Security**
2. **App-Specific Passwords** → **Generate**
3. Password'u kaydet

### 2. Environment Variables

```bash
export APPLE_ID="your-apple-id@email.com"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
export APPLE_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

### 3. Notarize Script

```bash
# Build yap
npm run tauri:build

# DMG'yi notarize et
./notarize.sh src-tauri/target/release/bundle/dmg/Notlok_2.0.5_universal.dmg
```

### 4. Manuel Notarization

```bash
# Submit
xcrun notarytool submit Notlok.dmg \
    --apple-id "your-apple-id@email.com" \
    --team-id "YOUR_TEAM_ID" \
    --password "xxxx-xxxx-xxxx-xxxx" \
    --wait

# Staple ticket
xcrun stapler staple Notlok.dmg
```

## GitHub Actions (Otomatik Build)

### Secrets Ekle

Repository → **Settings** → **Secrets and variables** → **Actions**

- `APPLE_CERTIFICATE`: Base64-encoded .p12 certificate
- `APPLE_CERTIFICATE_PASSWORD`: .p12 password
- `APPLE_SIGNING_IDENTITY`: "Developer ID Application: Your Name (TEAM_ID)"
- `APPLE_ID`: Apple ID email
- `APPLE_TEAM_ID`: Team ID
- `APPLE_APP_PASSWORD`: App-specific password

### Workflow Örneği

```yaml
# .github/workflows/build-macos.yml
name: Build macOS

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-apple-darwin,x86_64-apple-darwin
          
      - name: Install dependencies
        run: npm ci
        
      - name: Import Code Signing Certificate
        env:
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
        run: |
          echo "$APPLE_CERTIFICATE" | base64 --decode > certificate.p12
          security create-keychain -p "" build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P "$APPLE_CERTIFICATE_PASSWORD" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "" build.keychain
          
      - name: Build DMG
        env:
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
        run: npm run tauri:build:mac:universal
        
      - name: Notarize DMG
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          APPLE_APP_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
        run: |
          DMG_PATH=$(find src-tauri/target/release/bundle/dmg -name "*.dmg" | head -n 1)
          xcrun notarytool submit "$DMG_PATH" \
            --apple-id "$APPLE_ID" \
            --team-id "$APPLE_TEAM_ID" \
            --password "$APPLE_APP_PASSWORD" \
            --wait
          xcrun stapler staple "$DMG_PATH"
          
      - name: Upload Release Asset
        uses: actions/upload-artifact@v3
        with:
          name: Notlok-macOS
          path: src-tauri/target/release/bundle/dmg/*.dmg
```

## Troubleshooting

### "damaged and can't be opened"
```bash
xattr -cr /Applications/Notlok.app
```

### "code signature invalid"
```bash
codesign --verify --deep --strict /Applications/Notlok.app
codesign -dvv /Applications/Notlok.app
```

### "unidentified developer"
```bash
# Geçici olarak Gatekeeper'ı atla
sudo spctl --master-disable

# Gatekeeper'ı tekrar aç (önerilen)
sudo spctl --master-enable
```

### DMG Mount Edilmiyor
```bash
# Force mount
hdiutil attach Notlok.dmg -noverify -nobrowse

# Veya convert et
hdiutil convert Notlok.dmg -format UDZO -o Notlok-fixed.dmg
```

### Build Logs
```bash
# Verbose logging
RUST_LOG=debug npm run tauri:build

# Tauri debug
npm run tauri build -- --verbose
```

## Dağıtım Kontrol Listesi

- [ ] Apple Developer Account aktif
- [ ] Developer ID Application certificate yüklü
- [ ] Code signing çalışıyor (`codesign --verify`)
- [ ] DMG notarize edilmiş
- [ ] Notarization ticket stapled
- [ ] Test Mac'te (temiz bir Mac) DMG açılabiliyor
- [ ] Gatekeeper uyarısı çıkmıyor
- [ ] Version number güncellendi
- [ ] Changelog hazırlandı
- [ ] Download URL hazır

## Useful Commands

```bash
# Build info
npm run tauri info

# Clean build
rm -rf src-tauri/target
npm run tauri:build

# Check DMG
hdiutil imageinfo Notlok.dmg

# Verify code signing
codesign -dvvv --deep --strict Notlok.app
spctl -a -vvv Notlok.app

# Check notarization
xcrun stapler validate Notlok.dmg
```

## Resources

- [Tauri Code Signing](https://tauri.app/v1/guides/distribution/sign-macos)
- [Apple Notarization](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Code Signing Guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Introduction/Introduction.html)

---

**Son Güncelleme**: 2025-01-26
**Tauri Version**: 2.x
**macOS Minimum**: 13.0

