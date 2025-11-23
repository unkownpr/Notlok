# Notlok Güncelleme Sistemi Entegrasyonu

Bu doküman, notlok.app API'si ile entegre otomatik güncelleme sisteminin kullanımını açıklar.

## 🎯 Sistem Özeti

Notlok uygulaması, [notlok.app](https://notlok.app) üzerinde barındırılan kendi API'sini kullanarak güncelleme kontrolü yapar.

### API Endpoints:

1. **Genel Version Bilgisi**
   ```
   GET https://notlok.app/api/version
   ```

2. **Kullanıcı Version Kontrolü**
   ```
   GET https://notlok.app/api/version/check?version=1.0.0
   ```

## 📡 API Yanıtları

### 1. Genel Version Endpoint

**Request:**
```bash
curl https://notlok.app/api/version
```

**Response:**
```json
{
    "status": "success",
    "current_version": "1.0.0",
    "minimum_version": "1.0.0",
    "force_update": false,
    "update_message": "Yeni sürüm mevcut!",
    "download_url": "",
    "changelog": "",
    "check_date": "2025-11-23 08:45:15"
}
```

### 2. Version Check Endpoint

**Request:**
```bash
curl "https://notlok.app/api/version/check?version=1.0.0"
```

**Response (Güncel):**
```json
{
    "status": "success",
    "user_version": "1.0.0",
    "current_version": "1.0.0",
    "minimum_version": "1.0.0",
    "is_up_to_date": true,
    "is_supported": true,
    "update_available": false,
    "update_required": false,
    "force_update": false
}
```

**Response (Güncelleme Mevcut):**
```json
{
    "status": "success",
    "user_version": "1.0.0",
    "current_version": "1.0.1",
    "minimum_version": "1.0.0",
    "is_up_to_date": false,
    "is_supported": true,
    "update_available": true,
    "update_required": false,
    "force_update": false,
    "update_message": "Yeni özellikler ve hata düzeltmeleri!",
    "download_url": "https://notlok.app/download",
    "changelog": "• Ses cihazı seçimi eklendi\n• Dark mode iyileştirildi"
}
```

**Response (Zorunlu Güncelleme):**
```json
{
    "status": "success",
    "user_version": "0.9.0",
    "current_version": "1.0.1",
    "minimum_version": "1.0.0",
    "is_up_to_date": false,
    "is_supported": false,
    "update_available": true,
    "update_required": true,
    "force_update": true,
    "update_message": "Bu sürüm artık desteklenmiyor!",
    "download_url": "https://notlok.app/download"
}
```

## 🔍 API Alanları Açıklaması

| Alan | Tip | Açıklama |
|------|-----|----------|
| `status` | string | API yanıt durumu ("success" veya "error") |
| `user_version` | string | Kullanıcının mevcut versiyonu |
| `current_version` | string | En son yayınlanan versiyon |
| `minimum_version` | string | Desteklenen minimum versiyon |
| `is_up_to_date` | boolean | Kullanıcı en son versiyonda mı? |
| `is_supported` | boolean | Kullanıcı versiyonu destekleniyor mu? |
| `update_available` | boolean | Yeni güncelleme var mı? |
| `update_required` | boolean | Güncelleme gerekli mi? |
| `force_update` | boolean | Zorunlu güncelleme mi? (kritik) |
| `update_message` | string | Kullanıcıya gösterilecek mesaj |
| `download_url` | string | İndirme linki |
| `changelog` | string | Değişiklik listesi |

## 💻 Uygulama Entegrasyonu

### TypeScript Interface

```typescript
interface UpdateInfo {
  status: string;
  user_version: string;
  current_version: string;
  minimum_version: string;
  is_up_to_date: boolean;
  is_supported: boolean;
  update_available: boolean;
  update_required: boolean;
  force_update: boolean;
  update_message?: string;
  download_url?: string;
  changelog?: string;
}
```

### Güncelleme Kontrolü

```typescript
async function checkForUpdates(silent = false) {
  if (!silent) setIsCheckingUpdate(true);
  
  try {
    const response = await fetch(
      `https://notlok.app/api/version/check?version=${appVersion}`
    );
    
    const data: UpdateInfo = await response.json();
    setUpdateInfo(data);
    
    // Güncelleme varsa dialog göster
    if (data.update_available || data.force_update) {
      setShowUpdateDialog(true);
    }
    
    // Zorunlu güncelleme uyarısı
    if (data.force_update) {
      alert("Bu sürüm artık desteklenmiyor. Lütfen güncelleyin.");
    }
    
  } catch (error) {
    console.error('Update check error:', error);
  } finally {
    if (!silent) setIsCheckingUpdate(false);
  }
}
```

## 🎬 Kullanım Senaryoları

### 1. Otomatik Kontrol (Başlangıçta)

Uygulama başladığında 3 saniye sonra otomatik kontrol:

```typescript
useEffect(() => {
  async function initializeApp() {
    // ... diğer başlangıç işlemleri
    
    // Güncelleme kontrolü (sessiz, arka planda)
    setTimeout(() => {
      checkForUpdates(true);
    }, 3000);
  }
  
  initializeApp();
}, []);
```

**Davranış:**
- ✅ Kullanıcıyı rahatsız etmez
- ✅ Güncelleme varsa dialog gösterir
- ✅ Güncelleme yoksa sessiz kalır

### 2. Manuel Kontrol (Ayarlarda)

Kullanıcı manuel olarak kontrol edebilir:

```typescript
<button 
  onClick={() => checkForUpdates(false)} 
  disabled={isCheckingUpdate}
>
  {isCheckingUpdate ? 'Kontrol Ediliyor...' : 'Güncellemeleri Kontrol Et'}
</button>
```

**Davranış:**
- ✅ Loading göstergesi
- ✅ Güncelleme yoksa "Güncelsiniz!" mesajı
- ✅ Güncelleme varsa dialog açar

### 3. Zorunlu Güncelleme

`force_update: true` durumunda:

```typescript
if (data.force_update) {
  // Dialog kapatılamaz
  // "Şimdi Değil" butonu gösterilmez
  alert("Bu sürüm artık desteklenmiyor!");
}
```

## 🎨 UI Bileşenleri

### Güncelleme Dialog'u

```jsx
{showUpdateDialog && updateInfo && (
  <div className="update-overlay">
    <div className="update-dialog">
      <h2>{updateInfo.force_update ? 'Güncelleme Gerekli!' : 'Güncelleme Mevcut!'}</h2>
      
      <div className="update-versions">
        <div>Mevcut Sürüm: v{updateInfo.user_version}</div>
        <div>En Son Sürüm: v{updateInfo.current_version}</div>
      </div>
      
      {updateInfo.update_message && (
        <p className="update-message">{updateInfo.update_message}</p>
      )}
      
      {updateInfo.changelog && (
        <div className="update-changelog">
          <h4>Değişiklikler:</h4>
          <p>{updateInfo.changelog}</p>
        </div>
      )}
      
      <div className="update-actions">
        <button onClick={openDownloadUrl}>
          Güncellemeyi İndir
        </button>
        {!updateInfo.force_update && (
          <button onClick={() => setShowUpdateDialog(false)}>
            Şimdi Değil
          </button>
        )}
      </div>
    </div>
  </div>
)}
```

### Ayarlarda Version Bilgisi

```jsx
<div className="settings-panel">
  <h3>Sürüm</h3>
  
  <div className="version-info">
    <div className="version-item">
      <span>Mevcut Sürüm:</span>
      <span>v{appVersion}</span>
    </div>
    
    {updateInfo?.update_available && (
      <div className="version-item">
        <span>En Son Sürüm:</span>
        <span className="update-badge">v{updateInfo.current_version}</span>
      </div>
    )}
  </div>
  
  <button onClick={() => checkForUpdates(false)}>
    Güncellemeleri Kontrol Et
  </button>
  
  {updateInfo?.update_available && (
    <button onClick={openDownloadUrl}>
      Güncellemeyi İndir
    </button>
  )}
</div>
```

## 🎯 Güncelleme Akışı

```
┌─────────────────────────┐
│  Uygulama Başladı       │
└───────────┬─────────────┘
            │
            ▼
    (3 saniye bekle)
            │
            ▼
┌─────────────────────────┐
│  API'ye Güncelleme      │
│  Kontrolü İsteği        │
│  ?version=1.0.0         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  API Yanıtı Alındı      │
└───────────┬─────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐   ┌─────────┐
│ Güncel  │   │ Eski    │
│ Versiyon│   │ Versiyon│
└────┬────┘   └────┬────┘
     │             │
     │             ▼
     │      ┌─────────────┐
     │      │ Dialog Aç   │
     │      └──────┬──────┘
     │             │
     │      ┌──────┴───────┐
     │      │              │
     │      ▼              ▼
     │  ┌─────────┐   ┌─────────┐
     │  │ Normal  │   │ Zorunlu │
     │  │Update   │   │ Update  │
     │  └────┬────┘   └────┬────┘
     │       │             │
     │       ▼             ▼
     │  ┌─────────┐   ┌─────────┐
     │  │Şimdi    │   │Sadece   │
     │  │Değil OK │   │İndir OK │
     │  └─────────┘   └─────────┘
     │
     ▼
┌─────────────┐
│  Devam Et   │
└─────────────┘
```

## 🔐 Güvenlik

### HTTPS Zorunlu

API endpoint'leri **HTTPS** kullanır. HTTP ile yapılan istekler başarısız olur.

### CORS Ayarları

API, tüm origin'lere izin verir (cross-domain istekler için):
```
Access-Control-Allow-Origin: *
```

### Rate Limiting

API rate limiting uygulanmış olabilir. Gereksiz istek yapmaktan kaçının:
- ✅ Başlangıçta bir kez (3 saniye bekleyerek)
- ✅ Manuel kontrol (kullanıcı isteğiyle)
- ❌ Her 5 saniyede bir polling **YAPMAYIN**

## 📊 Version Numaralandırma

Semantic Versioning kullanılır:

```
MAJOR.MINOR.PATCH
  1  .  0  .  1
```

- **MAJOR:** Breaking changes (1.0.0 → 2.0.0)
- **MINOR:** Yeni özellikler (1.0.0 → 1.1.0)
- **PATCH:** Bug fixes (1.0.0 → 1.0.1)

### Örnekler:

| Değişiklik | Version |
|------------|---------|
| İlk release | 1.0.0 |
| Bug fix | 1.0.1 |
| Ses cihazı seçimi eklendi | 1.1.0 |
| API değişti (breaking) | 2.0.0 |

## 🧪 Test Senaryoları

### 1. Güncel Versiyon Testi

**Kullanıcı:** v1.0.0  
**Server:** v1.0.0

**Beklenen:**
- ✅ `is_up_to_date: true`
- ✅ Dialog gösterilmez
- ✅ Manuel kontrolde "Güncelsiniz!" mesajı

### 2. Güncelleme Mevcut

**Kullanıcı:** v1.0.0  
**Server:** v1.0.1

**Beklenen:**
- ✅ `update_available: true`
- ✅ Dialog açılır
- ✅ "Şimdi Değil" butonu var
- ✅ İndirme linki gösterilir

### 3. Zorunlu Güncelleme

**Kullanıcı:** v0.9.0  
**Server:** v1.0.1  
**Minimum:** v1.0.0

**Beklenen:**
- ✅ `force_update: true`
- ✅ Dialog açılır
- ❌ "Şimdi Değil" butonu YOK
- ✅ Kritik uyarı mesajı
- ✅ İndirme linki gösterilir

### 4. API Hatası

**Network error veya 500 response**

**Beklenen:**
- ✅ Hata yakalanır
- ✅ Console'a log
- ✅ Manuel kontrolde "Kontrol başarısız" mesajı
- ✅ Uygulama çalışmaya devam eder

## 🚀 Deployment Checklist

Yeni sürüm yayınlarken:

### 1. Version Güncelle

```bash
# package.json
"version": "1.0.1"

# Cargo.toml
version = "1.0.1"
```

### 2. CHANGELOG Hazırla

```markdown
## v1.0.1 (2025-11-23)

### Yeni Özellikler
- Ses cihazı seçimi eklendi

### İyileştirmeler
- Dark mode performansı

### Bug Düzeltmeleri
- Kayıt dondurma sorunu çözüldü
```

### 3. API'yi Güncelle

Backend'de (notlok.app):
```sql
UPDATE app_versions 
SET current_version = '1.0.1',
    changelog = '• Ses cihazı seçimi\n• Dark mode iyileştirme',
    download_url = 'https://notlok.app/download'
WHERE id = 1;
```

### 4. Build ve Yayınla

```bash
# Build
npm run tauri:build

# Test
# Eski versiyonu aç → Güncelleme kontrolü yapmalı

# Release
# GitHub Releases veya notlok.app/download
```

### 5. Duyuru

- Website'de güncelleme duyurusu
- Kullanıcılara email (opsiyonel)
- Social media (opsiyonel)

## 📱 Platform Notları

### macOS

- Güncelleme yükleme manuel (kullanıcı .dmg indirir)
- App Store harici yayında notarization gerekli

### Windows

- .msi veya .exe installer
- Otomatik güncelleme için admin yetkisi gerekebilir

### Linux

- AppImage, .deb veya .rpm
- Paket yöneticisi ile güncelleme önerilir

## 🔧 Troubleshooting

### Sorun: "Güncelleme kontrolü başarısız"

**Olası Nedenler:**
- İnternet bağlantısı yok
- API down
- CORS problemi

**Çözüm:**
```typescript
try {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  // ...
} catch (error) {
  console.error('Network error:', error);
  // Gracefully handle
}
```

### Sorun: Dialog sürekli açılıyor

**Neden:** Her render'da kontrol yapılıyor

**Çözüm:**
```typescript
// ✅ Sadece mount'da
useEffect(() => {
  checkForUpdates(true);
}, []); // Empty dependency array

// ❌ Her render'da
useEffect(() => {
  checkForUpdates(true);
}); // No dependency array
```

### Sorun: Version eşleşmiyor

**Neden:** package.json vs Cargo.toml farklı

**Çözüm:**
```bash
# Her ikisini de güncelle
# package.json: "version": "1.0.1"
# Cargo.toml: version = "1.0.1"
```

## 📚 Kaynaklar

- [Notlok API](https://notlok.app/api/version)
- [Semantic Versioning](https://semver.org/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Son Güncelleme:** Kasım 2025  
**API Version:** 1.0  
**Yazar:** Notlok Development Team

