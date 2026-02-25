# Notlok - Build All Platforms Script (Windows)
# Bu script Windows için build alır

param(
    [Parameter()]
    [ValidateSet('msi', 'nsis', 'all')]
    [string]$Type = 'all'
)

# Hata durumunda dur
$ErrorActionPreference = "Stop"

Write-Host "🚀 Notlok Build Script (Windows)" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue
Write-Host ""

# Versiyon kontrolü
$packageJson = Get-Content -Raw -Path "package.json" | ConvertFrom-Json
$version = $packageJson.version
Write-Host "📦 Sürüm: $version" -ForegroundColor Cyan
Write-Host ""

# Dependencies kontrolü
Write-Host "🔍 Dependencies kontrol ediliyor..." -ForegroundColor Yellow

# Node.js kontrolü
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js bulunamadı!" -ForegroundColor Red
    exit 1
}

# Rust kontrolü
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Rust bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies tamam" -ForegroundColor Green

# Node modules kontrolü
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Node modules yükleniyor..." -ForegroundColor Yellow
    npm install
}

# Build fonksiyonu
function Build-Windows {
    Write-Host ""
    Write-Host "🪟 Windows build başlıyor..." -ForegroundColor Blue
    
    try {
        npm run tauri build
        Write-Host "✅ Windows build tamamlandı!" -ForegroundColor Green
        Write-Host "📍 Dosyalar:" -ForegroundColor Yellow
        Write-Host "   MSI: src-tauri/target/release/bundle/msi/" -ForegroundColor Gray
        
        if (Test-Path "src-tauri/target/release/bundle/nsis") {
            Write-Host "   NSIS: src-tauri/target/release/bundle/nsis/" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Build hatası: $_" -ForegroundColor Red
        exit 1
    }
}

# Build işlemi
switch ($Type) {
    'msi' {
        Write-Host "MSI Installer oluşturuluyor..." -ForegroundColor Cyan
        Build-Windows
    }
    'nsis' {
        Write-Host "NSIS Installer oluşturuluyor..." -ForegroundColor Cyan
        Build-Windows
    }
    'all' {
        Write-Host "Tüm installer türleri oluşturuluyor..." -ForegroundColor Cyan
        Build-Windows
    }
}

# Özet
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "🎉 Build tamamlandı!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "Sürüm: $version" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build dosyaları:" -ForegroundColor Yellow
Write-Host "  src-tauri/target/release/bundle/" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 İpucu: Build dosyalarını test etmeyi unutmayın!" -ForegroundColor Yellow
Write-Host ""

# Dosya boyutlarını göster
Write-Host "📊 Dosya Boyutları:" -ForegroundColor Cyan
Get-ChildItem -Path "src-tauri/target/release/bundle" -Recurse -Include *.msi, *.exe | 
    ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   $($_.Name): ${size} MB" -ForegroundColor Gray
    }

