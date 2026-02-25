#!/bin/bash

# Notlok Release Hazırlama Script'i
# Bu script yeni bir sürüm için gerekli adımları yapar

set -e

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Notlok Release Hazırlama Script'i  ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Mevcut sürümü oku
CURRENT_VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*: "\(.*\)".*/\1/')
echo -e "${GREEN}Mevcut sürüm: ${CURRENT_VERSION}${NC}"
echo ""

# Yeni sürümü sor
echo -e "${YELLOW}Yeni sürüm numarasını girin (örn: 1.0.1):${NC}"
read NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo -e "${RED}Hata: Sürüm numarası boş olamaz!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Sürüm güncellemesi yapılıyor...${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# package.json güncelle
echo -e "${YELLOW}📦 package.json güncelleniyor...${NC}"
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak

# src-tauri/tauri.conf.json güncelle
echo -e "${YELLOW}⚙️  tauri.conf.json güncelleniyor...${NC}"
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
rm src-tauri/tauri.conf.json.bak

# src-tauri/Cargo.toml güncelle
echo -e "${YELLOW}🦀 Cargo.toml güncelleniyor...${NC}"
sed -i.bak "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
rm src-tauri/Cargo.toml.bak

# Info.plist güncelle
echo -e "${YELLOW}🍎 Info.plist güncelleniyor...${NC}"
sed -i.bak "s/<string>$CURRENT_VERSION<\/string>/<string>$NEW_VERSION<\/string>/" src-tauri/Info.plist
rm src-tauri/Info.plist.bak

# Git durumunu kontrol et
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Git durumu kontrol ediliyor...${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -z "$(git status --porcelain)" ]; then 
    echo -e "${RED}⚠️  Değişiklik yok, commit yapılmayacak${NC}"
else
    echo -e "${GREEN}✓ Değişiklikler bulundu${NC}"
    echo ""
    
    # Değişiklikleri göster
    echo -e "${YELLOW}Değişen dosyalar:${NC}"
    git status --short
    echo ""
    
    # Commit yap
    echo -e "${YELLOW}📝 Commit mesajı:${NC}"
    COMMIT_MSG="Release v$NEW_VERSION"
    echo "   $COMMIT_MSG"
    echo ""
    
    git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Info.plist
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✓ Commit yapıldı${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Tag oluşturuluyor...${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Tag oluştur
TAG_NAME="v$NEW_VERSION"
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
echo -e "${GREEN}✓ Tag oluşturuldu: ${TAG_NAME}${NC}"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Tamamlandı! 🎉               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Sonraki adımlar:${NC}"
echo ""
echo -e "${GREEN}1. Push yapın:${NC}"
echo -e "   ${BLUE}git push origin main --tags${NC}"
echo ""
echo -e "${GREEN}2. GitHub Actions'ı izleyin:${NC}"
echo -e "   ${BLUE}https://github.com/KULLANICI_ADINIZ/notlok/actions${NC}"
echo ""
echo -e "${GREEN}3. Build'ler hazır olunca Releases'te görünecek${NC}"
echo ""
echo -e "${YELLOW}Ya da manuel build için:${NC}"
echo -e "   ${BLUE}npm run tauri build${NC}"
echo ""

