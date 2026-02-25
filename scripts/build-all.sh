#!/bin/bash

# Notlok - Build All Platforms Script
# Bu script tüm platformlar için build alır

set -e

echo "🚀 Notlok Build Script"
echo "====================="
echo ""

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Versiyon kontrolü
VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Sürüm: ${VERSION}${NC}"
echo ""

# Platform seçimi
echo "Platform seçin:"
echo "1) macOS (Apple Silicon)"
echo "2) macOS (Intel)"
echo "3) macOS (Universal)"
echo "4) Windows"
echo "5) Hepsi"
read -p "Seçim (1-5): " PLATFORM

# Dependencies kontrolü
echo ""
echo -e "${YELLOW}🔍 Dependencies kontrol ediliyor...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı!${NC}"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Rust bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies tamam${NC}"

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Node modules yükleniyor...${NC}"
    npm install
fi

# Build fonksiyonu
build_macos_arm() {
    echo ""
    echo -e "${BLUE}🍎 macOS (Apple Silicon) build başlıyor...${NC}"
    npm run tauri build -- --target aarch64-apple-darwin
    echo -e "${GREEN}✅ macOS (Apple Silicon) build tamamlandı!${NC}"
    echo -e "${YELLOW}📍 Dosya: src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/${NC}"
}

build_macos_intel() {
    echo ""
    echo -e "${BLUE}🍎 macOS (Intel) build başlıyor...${NC}"
    npm run tauri build -- --target x86_64-apple-darwin
    echo -e "${GREEN}✅ macOS (Intel) build tamamlandı!${NC}"
    echo -e "${YELLOW}📍 Dosya: src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/${NC}"
}

build_macos_universal() {
    echo ""
    echo -e "${BLUE}🍎 macOS (Universal) build başlıyor...${NC}"
    npm run tauri build -- --target universal-apple-darwin
    echo -e "${GREEN}✅ macOS (Universal) build tamamlandı!${NC}"
    echo -e "${YELLOW}📍 Dosya: src-tauri/target/universal-apple-darwin/release/bundle/dmg/${NC}"
}

build_windows() {
    echo ""
    echo -e "${BLUE}🪟 Windows build başlıyor...${NC}"
    npm run tauri build
    echo -e "${GREEN}✅ Windows build tamamlandı!${NC}"
    echo -e "${YELLOW}📍 Dosya: src-tauri/target/release/bundle/msi/${NC}"
}

# Build işlemi
case $PLATFORM in
    1)
        build_macos_arm
        ;;
    2)
        build_macos_intel
        ;;
    3)
        build_macos_universal
        ;;
    4)
        build_windows
        ;;
    5)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            build_macos_arm
            build_macos_intel
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            build_windows
        else
            echo -e "${RED}❌ Desteklenmeyen platform${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ Geçersiz seçim${NC}"
        exit 1
        ;;
esac

# Özet
echo ""
echo "═══════════════════════════════════════"
echo -e "${GREEN}🎉 Build tamamlandı!${NC}"
echo "═══════════════════════════════════════"
echo -e "${BLUE}Sürüm: ${VERSION}${NC}"
echo ""
echo "Build dosyaları:"
echo "  src-tauri/target/[platform]/release/bundle/"
echo ""
echo -e "${YELLOW}💡 İpucu: Build dosyalarını test etmeyi unutmayın!${NC}"

