# WCFinder - Komutlar Referans Rehberi

Bu dosya, WCFinder projesinde kullanılan tüm komutları içerir.

---

## 🧰 Backend (SERVER) Komutları

### Lokal Geliştirme

```bash
cd SERVER
npm install          # İlk kurulum (dependencies yükler)
npm run dev          # Swagger generate + nodemon ile geliştirme
```

**Not:** `npm run dev` komutu:
1. `swaggerAutogen.js` çalıştırır (Swagger docs oluşturur)
2. `nodemon index.js` ile server'ı başlatır (değişikliklerde otomatik restart)

### Lokal Production Testi

```bash
cd SERVER
npm start            # node index.js (production mode)
```

### Diğer Backend Script'leri

```bash
cd SERVER
npm run debug        # DEBUG=* nodemon (tüm debug logları)
npm run fix-indexes  # Payment index'lerini düzeltir
```

---

## 🎨 Frontend (CLIENT) Komutları

### Lokal Geliştirme

```bash
cd CLIENT
npm install          # İlk kurulum (dependencies yükler)
npm run dev          # Vite dev server başlatır (http://localhost:5173)
```

**Not:** Dev server otomatik olarak browser'ı açar ve hot-reload yapar.

### Production Build

```bash
cd CLIENT
npm run build        # dist/ klasörü oluşturur (production build)
```

**Build Çıktısı:**
- `dist/index.html` - Ana HTML dosyası
- `dist/assets/` - JavaScript, CSS ve diğer asset'ler
- Minified ve optimized dosyalar

### Production Preview (Lokal Test)

```bash
cd CLIENT
npm run build        # Önce build et
npm run preview      # Build edilmiş halini test et (http://localhost:4173)
```

### Linting

```bash
cd CLIENT
npm run lint         # ESLint ile kod kontrolü
```

---

## 🚀 Railway Deployment Komutları

### Backend Service (Railway Settings)

**Root Directory:**
```
SERVER
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

### Frontend Service (Railway Settings)

**Root Directory:**
```
CLIENT
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Not:** `npm start` komutu `serve -s dist -l ${PORT:-3000}` çalıştırır.

---

## 📦 Package.json Script'leri

### Backend (SERVER/package.json)

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node swaggerAutogen.js && nodemon index.js",
    "debug": "DEBUG=* nodemon",
    "fix-indexes": "node scripts/fix-payment-indexes.js"
  }
}
```

### Frontend (CLIENT/package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "start": "serve -s dist -l ${PORT:-3000}"
  }
}
```

---

## 🔧 Utility Komutları

### Git Komutları

```bash
# Tüm değişiklikleri commit et
git add .
git commit -m "Your commit message"
git push

# WCFinder-clean.git'i git'ten kaldır (Railway deployment öncesi)
git rm -r --cached WCFinder-clean.git
git commit -m "Remove WCFinder-clean.git from git tracking"
git push
```

### Node Modules Temizleme

```bash
# Backend
cd SERVER
rm -rf node_modules package-lock.json
npm install

# Frontend
cd CLIENT
rm -rf node_modules package-lock.json
npm install
```

### Build Temizleme

```bash
# Frontend dist klasörünü temizle
cd CLIENT
rm -rf dist
npm run build
```

---

## 🧪 Test Komutları

### Backend Test

```bash
cd SERVER
node index.js
# Server çalışıyorsa: http://127.0.0.1:8000
# Swagger: http://127.0.0.1:8000/documents/swagger
```

### Frontend Test

```bash
cd CLIENT
npm run dev
# Dev server: http://localhost:5173

# Veya production build test
npm run build
npm run preview
# Preview: http://localhost:4173
```

### MongoDB Connection Test

```bash
cd SERVER
node -e "require('dotenv').config(); console.log('MONGODB:', process.env.MONGODB?.trim());"
```

---

## 📝 Railway Deployment Checklist

### Backend Deployment

```bash
# 1. Local test
cd SERVER
npm install
npm start

# 2. Railway'de:
# - Root Directory: SERVER
# - Build Command: npm install
# - Start Command: npm start
# - Environment Variables ekle (MONGODB, PORT, vb.)
```

### Frontend Deployment

```bash
# 1. Local build test
cd CLIENT
npm install
npm run build

# 2. Railway'de:
# - Root Directory: CLIENT
# - Build Command: npm install && npm run build
# - Start Command: npm start
# - Environment Variables ekle (VITE_API_BASE_URL, vb.)
```

---

## 🐛 Troubleshooting Komutları

### Build Hatalarını Kontrol Et

```bash
# Frontend
cd CLIENT
npm run build

# Hata varsa:
npm install --save-dev terser  # Terser eksikse
npm install                     # Dependencies eksikse
```

### Port Kullanımını Kontrol Et

```bash
# Windows
netstat -ano | findstr :8000   # Backend port
netstat -ano | findstr :5173   # Frontend dev port

# Linux/Mac
lsof -i :8000
lsof -i :5173
```

### Environment Variables Kontrolü

```bash
# Backend
cd SERVER
node -e "require('dotenv').config(); console.log(process.env.MONGODB);"

# Frontend
cd CLIENT
node -e "console.log(process.env.VITE_API_BASE_URL);"
```

---

## 📊 Hızlı Referans Tablosu

| İşlem | Backend | Frontend |
|-------|---------|----------|
| **Geliştirme** | `npm run dev` | `npm run dev` |
| **Production Test** | `npm start` | `npm run build && npm run preview` |
| **Build** | - | `npm run build` |
| **Lint** | - | `npm run lint` |
| **Railway Build** | `npm install` | `npm install && npm run build` |
| **Railway Start** | `npm start` | `npm start` |
| **Port** | 8000 | 5173 (dev), 4173 (preview) |

---

## 🎯 Yaygın Senaryolar

### Senaryo 1: İlk Kurulum

```bash
# Backend
cd SERVER
npm install
cp env.production.template .env
# .env dosyasını düzenle
npm run dev

# Frontend
cd CLIENT
npm install
npm run dev
```

### Senaryo 2: Production Build (Lokal)

```bash
# Backend
cd SERVER
npm install
npm start

# Frontend
cd CLIENT
npm install
npm run build
npm run preview
```

### Senaryo 3: Railway Deployment

```bash
# 1. Git commit
git add .
git commit -m "Deploy to Railway"
git push

# 2. Railway'de:
# Backend Service → Settings → Root Directory: SERVER
# Frontend Service → Settings → Root Directory: CLIENT
# Her ikisinde de Variables ekle
# Deploy!
```

### Senaryo 4: Build Hatası Düzeltme

```bash
# Terser hatası
cd CLIENT
npm install --save-dev terser
npm run build

# Diğer hatalar
cd CLIENT
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## ⚠️ Önemli Notlar

1. **Backend:** `npm run dev` komutu Swagger docs'u otomatik generate eder
2. **Frontend:** `npm run build` komutu `dist/` klasörü oluşturur
3. **Railway:** Root Directory mutlaka `SERVER` veya `CLIENT` olmalı (büyük harf)
4. **Environment Variables:** `VITE_` prefix'i olanlar build zamanında inject edilir
5. **Terser:** Vite 3+ için optional dependency, manuel yüklenmeli

---

**Son Güncelleme**: Aralık 2024

