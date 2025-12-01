#!/bin/bash

# Railway Deployment Fix Script
# Bu script, Railway deployment öncesi gerekli temizlikleri yapar

echo "🔧 Railway Deployment Fix Script"
echo "================================"
echo ""

# 1. WCFinder-clean.git klasörünü git'ten kaldır
echo "1️⃣ WCFinder-clean.git klasörünü git'ten kaldırılıyor..."
if [ -d "WCFinder-clean.git" ]; then
    git rm -r --cached WCFinder-clean.git 2>/dev/null || echo "   ⚠️  Zaten git'ten kaldırılmış veya yok"
    echo "   ✅ Tamamlandı"
else
    echo "   ℹ️  WCFinder-clean.git klasörü bulunamadı (zaten temizlenmiş)"
fi

# 2. Git status kontrolü
echo ""
echo "2️⃣ Git status kontrol ediliyor..."
git status --short | head -20

# 3. Railway.json dosyalarını kontrol et
echo ""
echo "3️⃣ Railway.json dosyaları kontrol ediliyor..."
if [ -f "SERVER/railway.json" ]; then
    echo "   ✅ SERVER/railway.json mevcut"
else
    echo "   ❌ SERVER/railway.json bulunamadı"
fi

if [ -f "CLIENT/railway.json" ]; then
    echo "   ✅ CLIENT/railway.json mevcut"
else
    echo "   ❌ CLIENT/railway.json bulunamadı"
fi

# 4. Package.json dosyalarını kontrol et
echo ""
echo "4️⃣ Package.json dosyaları kontrol ediliyor..."
if [ -f "SERVER/package.json" ]; then
    echo "   ✅ SERVER/package.json mevcut"
    if grep -q '"start"' SERVER/package.json; then
        echo "   ✅ Start script mevcut"
    else
        echo "   ⚠️  Start script eksik!"
    fi
else
    echo "   ❌ SERVER/package.json bulunamadı"
fi

if [ -f "CLIENT/package.json" ]; then
    echo "   ✅ CLIENT/package.json mevcut"
    if grep -q '"build"' CLIENT/package.json; then
        echo "   ✅ Build script mevcut"
    else
        echo "   ⚠️  Build script eksik!"
    fi
    if grep -q '"serve"' CLIENT/package.json; then
        echo "   ✅ Serve dependency mevcut"
    else
        echo "   ⚠️  Serve dependency eksik! (Railway için gerekli)"
    fi
else
    echo "   ❌ CLIENT/package.json bulunamadı"
fi

echo ""
echo "================================"
echo "✅ Kontrol tamamlandı!"
echo ""
echo "📝 Sonraki adımlar:"
echo "   1. Git commit yapın: git commit -m 'Fix Railway deployment'"
echo "   2. Git push yapın: git push"
echo "   3. Railway'de deploy edin"
echo ""

