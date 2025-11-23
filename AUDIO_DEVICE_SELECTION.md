# Ses Cihazı Seçimi Özelliği

Bu doküman, Notlok uygulamasına eklenen ses cihazı seçimi özelliğini açıklar.

## 🎯 Özellik Özeti

Kullanıcılar artık kayıt yapmadan önce hangi mikrofon ve ses çıkış cihazını kullanacaklarını seçebiliyorlar.

## ✨ Yeni Özellikler

### 1. **Giriş Cihazı (Mikrofon) Seçimi**
- Sistemdeki tüm mikrofon cihazlarını listeler
- Varsayılan cihazı işaretler
- Seçilen cihaz localStorage'da saklanır
- Kayıt sırasında değiştirilemez

### 2. **Çıkış Cihazı (Sistem Sesi) Seçimi**
- Sistemdeki tüm ses çıkış cihazlarını listeler
- Hoparlör, kulaklık, vb. cihazlar
- Seçilen cihaz localStorage'da saklanır
- Not: macOS'ta ScreenCaptureKit varsayılan sistem sesini yakalar

### 3. **Cihaz Yenileme**
- "Yenile" butonu ile cihaz listesi güncellenebilir
- USB mikrofon vs. bağlandığında kullanışlı

## 🖥️ Kullanıcı Arayüzü

### Ayarlar Sekmesi

Yeni bir panel eklendi: **Ses Cihazları**

```
┌─────────────────────────────────────┐
│ Ses Cihazları                       │
├─────────────────────────────────────┤
│ Mikrofon (Mikrofon):                │
│ [ MacBook Pro Microphone ▼ ]       │
│                                     │
│ Sistem Sesi (Ekran Kaydı):         │
│ [ MacBook Pro Speakers ▼ ]         │
│                                     │
│ [Yenile]                            │
└─────────────────────────────────────┘
```

Dropdown'larda:
- ✓ İlk seçenek: "Varsayılan"
- ✓ Her cihaz adı
- ✓ Varsayılan cihazın yanında "(Varsayılan)" etiketi

## 🔧 Teknik Implementasyon

### Rust (Backend)

**Yeni Struct:**
```rust
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}
```

**AudioRecorder'a Eklenenler:**
```rust
pub struct AudioRecorder {
    // ... existing fields
    selected_input_device: Arc<Mutex<Option<String>>>,
}

impl AudioRecorder {
    pub fn set_input_device(&self, device_id: Option<String>);
    pub fn get_input_device(&self) -> Option<String>;
    pub fn list_input_devices() -> Result<Vec<AudioDevice>, String>;
    pub fn list_output_devices() -> Result<Vec<AudioDevice>, String>;
}
```

**Yeni Tauri Komutları:**
- `list_audio_input_devices()` - Mikrofon listesi
- `list_audio_output_devices()` - Çıkış cihazı listesi
- `set_input_device(device_id)` - Mikrofon seç
- `get_input_device()` - Seçili mikrofonu al

### React (Frontend)

**Yeni State'ler:**
```typescript
const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
const [selectedInputDevice, setSelectedInputDevice] = useState<string>("default");
const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>("default");
```

**Yeni Fonksiyonlar:**
```typescript
async function loadAudioDevices() {
  const inputs = await invoke<AudioDevice[]>("list_audio_input_devices");
  const outputs = await invoke<AudioDevice[]>("list_audio_output_devices");
  setInputDevices(inputs);
  setOutputDevices(outputs);
}

async function handleInputDeviceChange(deviceId: string) {
  setSelectedInputDevice(deviceId);
  localStorage.setItem("notlok-input-device", deviceId);
  await invoke("set_input_device", { deviceId });
}
```

## 💾 Veri Saklama

Seçili cihazlar localStorage'da saklanıyor:

```typescript
// Kaydetme
localStorage.setItem("notlok-input-device", deviceId);
localStorage.setItem("notlok-output-device", deviceId);

// Yükleme (başlangıçta)
const savedInputDevice = localStorage.getItem("notlok-input-device") || "default";
const savedOutputDevice = localStorage.getItem("notlok-output-device") || "default";
```

## 🎨 UI/UX Detayları

### Dropdown Seçenekleri

**Mikrofon Dropdown:**
```
Varsayılan
MacBook Pro Microphone (Varsayılan)
USB Audio Device
AirPods Pro
```

**Sistem Sesi Dropdown:**
```
Varsayılan
MacBook Pro Speakers (Varsayılan)
External HDMI
AirPods Pro
```

### Devre Dışı Bırakma

Kayıt sırasında:
- ✅ Dropdown'lar devre dışı
- ✅ Yenile butonu devre dışı
- ✅ Kayıt bitmeden değişiklik yapılamaz

### Varsayılan Davranış

Eğer kullanıcı hiç seçim yapmamışsa:
1. "Varsayılan" seçili gelir
2. Sistem varsayılan cihazı kullanılır
3. İlk açılışta otomatik olarak varsayılan cihaz seçilir

## 🔍 Kullanım Senaryoları

### Senaryo 1: Podcast Kaydı
**Durum:** Profesyonel USB mikrofon kullanılıyor
1. Ayarlar → Ses Cihazları
2. Mikrofon → "Blue Yeti" seç
3. Sistem Sesi → "Varsayılan" bırak
4. Kayda başla

### Senaryo 2: Kulaklıkla Kayıt
**Durum:** AirPods'tan ses kaydetmek isteniyor
1. Ayarlar → Ses Cihazları
2. Mikrofon → "AirPods Pro" seç
3. Sistem Sesi → "MacBook Pro Speakers" seç
4. Kayda başla

### Senaryo 3: USB Mikrofon Bağlandı
**Durum:** Kayıt sırasında yeni cihaz bağlandı
1. Kaydı durdur
2. Ayarlar → Ses Cihazları
3. "Yenile" butonuna tıkla
4. Yeni cihazı seç
5. Tekrar kayda başla

## ⚠️ Önemli Notlar

### macOS ScreenCaptureKit Sınırlaması

macOS'ta sistem sesini yakalamak için ScreenCaptureKit kullanılıyor. Bu API:
- ✅ Varsayılan ses çıkış cihazını yakalar
- ⚠️ Kullanıcının seçtiği belirli bir cihazı yakalamaz
- ℹ️ Sistem ses ayarlarındaki varsayılan cihaz hangisiyse onu kullanır

**Çözüm:** Kullanıcı istediği cihazı sistem ses ayarlarından varsayılan yapmalı.

### Cihaz ID'leri

Cihaz ID'leri format: `input_0`, `input_1`, `output_0`, `output_1`, vb.
- Cihazlar her defasında farklı sırayla gelebilir
- ID'ler yeniden başlatmada değişebilir
- Bu yüzden varsayılan cihaz her zaman güvenli seçenek

## 🚀 Gelecek İyileştirmeler

- [ ] Cihaz adı yerine ID'si ile saklama (daha güvenilir)
- [ ] Cihaz ses seviyesi ayarı (volume control)
- [ ] Cihaz preview (test kaydı)
- [ ] Birden fazla mikrofon aynı anda (multi-track)
- [ ] Ses monitörü (gerçek zamanlı ses dalgası görüntüleme)

## 📋 Test Listesi

- [x] Mikrofon listesi gösteriliyor
- [x] Çıkış cihazı listesi gösteriliyor
- [x] Varsayılan cihaz işaretleniyor
- [x] Cihaz seçimi kaydediliyor
- [x] Uygulama yeniden başlatıldığında seçim hatırlanıyor
- [x] Kayıt sırasında değişiklik yapılamıyor
- [x] Yenile butonu çalışıyor
- [x] Cihaz yok ise hata vermiyor
- [x] Dark mode uyumlu

## 📝 Çeviri

Yeni translation key'ler:

**Türkçe:**
```typescript
audioDevices: "Ses Cihazları"
inputDevice: "Mikrofon"
outputDevice: "Sistem Sesi"
selectDevice: "Cihaz Seç"
defaultDevice: "Varsayılan"
refreshDevices: "Yenile"
```

**İngilizce:**
```typescript
audioDevices: "Audio Devices"
inputDevice: "Microphone"
outputDevice: "System Audio"
selectDevice: "Select Device"
defaultDevice: "Default"
refreshDevices: "Refresh"
```

## 🎯 Değiştirilen Dosyalar

- ✅ `src-tauri/src/audio_capture.rs` - Cihaz listeleme fonksiyonları
- ✅ `src-tauri/src/lib.rs` - Tauri komutları
- ✅ `src/App.tsx` - UI ve state yönetimi
- ✅ Translation strings (TR & EN)

---

**Son Güncelleme:** Kasım 2025

