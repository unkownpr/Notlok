#!/bin/bash

# GitHub Kimlik Bilgileri Güncelleme Script'i

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GitHub Kimlik Bilgileri Güncelleme    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Mevcut remote'u göster
echo -e "${YELLOW}Mevcut remote URL:${NC}"
git remote get-url origin 2>/dev/null || echo "Remote bulunamadı"
echo ""

# Token oluşturma talimatı
echo -e "${GREEN}▶ Adım 1: Personal Access Token Oluşturun${NC}"
echo ""
echo "   Tarayıcınızda şu sayfayı açın:"
echo -e "   ${BLUE}https://github.com/settings/tokens/new${NC}"
echo ""
echo "   Ayarlar:"
echo "   • Note: 'Notlok Development'"
echo "   • Expiration: 90 days (veya No expiration)"
echo "   • Scopes: ✅ repo, ✅ workflow"
echo ""
echo "   'Generate token' tıklayın ve token'ı kopyalayın"
echo ""

# Token iste
echo -e "${GREEN}▶ Adım 2: Token'ı Yapıştırın${NC}"
echo ""
echo -e "${YELLOW}Personal Access Token'ınızı buraya yapıştırın:${NC}"
read -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Token boş olamaz!${NC}"
    exit 1
fi

# Kullanıcı adını iste
echo ""
echo -e "${YELLOW}GitHub kullanıcı adınız (unkownpr):${NC}"
read GITHUB_USERNAME
GITHUB_USERNAME=${GITHUB_USERNAME:-unkownpr}

# Remote'u güncelle
echo ""
echo -e "${GREEN}▶ Adım 3: Remote URL Güncelleniyor...${NC}"
echo ""

# Eski remote'u kaldır
git remote remove origin 2>/dev/null

# Yeni remote ekle
REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/Notlok.git"
git remote add origin "$REMOTE_URL"

echo -e "${GREEN}✅ Remote URL güncellendi!${NC}"
echo ""

# Test et
echo -e "${GREEN}▶ Adım 4: Bağlantı Test Ediliyor...${NC}"
echo ""

if git ls-remote origin &>/dev/null; then
    echo -e "${GREEN}✅ Bağlantı başarılı!${NC}"
    echo ""
    echo -e "${BLUE}Artık push yapabilirsiniz:${NC}"
    echo -e "   ${YELLOW}git push -u origin main${NC}"
else
    echo -e "${RED}❌ Bağlantı başarısız!${NC}"
    echo ""
    echo "Lütfen kontrol edin:"
    echo "  • Token doğru mu?"
    echo "  • Kullanıcı adı doğru mu?"
    echo "  • Repository var mı?"
    exit 1
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Tamamlandı! 🎉               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

