# 🚀 WCFinder Production Deployment Rehberi

**Adım adım Backend ve Frontend deployment talimatları**

---

## 📋 İçindekiler

1. [Ön Hazırlık](#1-ön-hazırlık)
2. [MongoDB Atlas Kurulumu](#2-mongodb-atlas-kurulumu)
3. [Backend Deployment](#3-backend-deployment)
4. [Frontend Deployment](#4-frontend-deployment)
5. [Domain ve SSL Ayarları](#5-domain-ve-ssl-ayarları)
6. [Production Testi](#6-production-testi)
7. [Sorun Giderme](#7-sorun-giderme)

---

## 1. Ön Hazırlık

### 1.1 Gerekli Hesaplar

- ✅ **MongoDB Atlas** hesabı (ücretsiz tier yeterli)
- ✅ **Stripe** hesabı (production keys)
- ✅ **PayPal** hesabı (production credentials)
- ✅ **Hosting Platform** (Heroku, DigitalOcean, AWS, Railway, vb.)
- ✅ **Domain** (isteğe bağlı ama önerilir)

### 1.2 Yerel Hazırlık

```bash
# Projeyi klonlayın (henüz yapmadıysanız)
git clone <your-repo-url>
cd WCFinder

# Son değişiklikleri çekin
git pull origin main
```

---

## 2. MongoDB Atlas Kurulumu

### 2.1 MongoDB Atlas Cluster Oluşturma

1. **MongoDB Atlas'a giriş yapın**: https://www.mongodb.com/cloud/atlas
2. **"Create" > "Database"** tıklayın
3. **Cluster seçin**: 
   - Free tier (M0) yeterli (başlangıç için)
   - Region: Europe (Frankfurt) önerilir
4. **Cluster adı**: `wcfinder-prod`
5. **"Create"** tıklayın

### 2.2 Database Access (Kullanıcı Oluşturma)

1. **Security** > **Database Access** tıklayın
2. **"Add New Database User"** tıklayın
3. Ayarlar:
   - **Authentication Method**: Password
   - **Username**: `wcfinder-admin` (veya istediğiniz)
   - **Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Database User Privileges**: Atlas admin (veya Read and write to any database)
4. **"Add User"** tıklayın

### 2.3 Network Access (IP Whitelist)

1. **Security** > **Network Access** tıklayın
2. **"Add IP Address"** tıklayın
3. Production için:
   - **"Allow Access from Anywhere"** seçin: `0.0.0.0/0`
   - VEYA sadece hosting IP'lerini ekleyin (daha güvenli)
4. **"Confirm"** tıklayın

### 2.4 Connection String Alma

1. **Clusters** sayfasına dönün
2. **"Connect"** butonuna tıklayın
3. **"Connect your application"** seçin
4. **Driver**: Node.js, **Version**: 5.5 veya üzeri
5. Connection string'i kopyalayın:
   ```
   mongodb+srv://wcfinder-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<password>` kısmını gerçek şifrenizle değiştirin
7. Database adını ekleyin:
   ```
   mongodb+srv://wcfinder-admin:GERÇEK_ŞİFRE@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority
   ```

**ÖNEMLİ**: Bu connection string'i güvenli bir yerde saklayın! Backend deployment'ta kullanacağız.

---

## 3. Backend Deployment

### 3.1 Hosting Platform Seçimi

Bu rehber **Railway** ve **Heroku** seçeneklerini gösterir. Diğer platformlar için benzer adımlar geçerlidir.

#### Seçenek A: Railway (Önerilen - Kolay ve Ücretsiz)

Railway: https://railway.app (GitHub ile giriş yapabilirsiniz)

**Adımlar:**

1. **Railway'a giriş yapın** ve **"New Project"** tıklayın
2. **"Deploy from GitHub repo"** seçin
3. Repository'nizi seçin
4. **"Add Service"** > **"Empty Service"** seçin
5. **Settings** > **Source**:
   - **Root Directory**: `SERVER`
   - **Start Command**: `npm start`
6. **Variables** sekmesine gidin ve aşağıdaki environment variables'ları ekleyin:

```bash
# Database
MONGODB=mongodb+srv://wcfinder-admin:ŞİFRENİZ@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority

# Server
PORT=8000
NODE_ENV=production
HOST=0.0.0.0

# JWT Secrets (GÜVENLİ RANDOM STRINGLER OLUŞTURUN!)
ACCESS_KEY=$(openssl rand -base64 32)
REFRESH_KEY=$(openssl rand -base64 32)

# CORS (Frontend URL'nizi buraya ekleyin - deploy sonrası güncelleyin)
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_xxxxx  # Stripe Dashboard'dan alın
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Webhook oluşturduktan sonra

# PayPal (Production Keys)
PAYPAL_CLIENT_ID=xxxxx  # PayPal Developer Dashboard'dan
PAYPAL_CLIENT_SECRET=xxxxx

# Email (Nodemailer için - opsiyonel)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Trust Proxy (Production için true olmalı)
TRUST_PROXY=true

# Rate Limiting (Production için)
RATE_LIMIT_WINDOW_MS=900000  # 15 dakika
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000  # 15 dakika
AUTH_RATE_LIMIT_MAX_REQUESTS=5
PAYMENT_RATE_LIMIT_WINDOW_MS=60000  # 1 dakika
PAYMENT_RATE_LIMIT_MAX_REQUESTS=5
```

**ÖNEMLİ**: 
- `ACCESS_KEY` ve `REFRESH_KEY` için güvenli random stringler oluşturun
- Windows'ta: PowerShell'de `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
- Linux/Mac'te: `openssl rand -base64 32`

7. **"Deploy"** butonuna tıklayın
8. Deploy tamamlandıktan sonra **Settings** > **Generate Domain** ile bir domain alın
9. Bu domain'i not edin: `https://your-backend-name.up.railway.app`

**Backend URL'niz hazır!** Şimdi bu URL'yi frontend deployment'ta kullanacağız.

#### Seçenek B: Heroku

1. **Heroku CLI'yı yükleyin**: https://devcenter.heroku.com/articles/heroku-cli
2. Terminal'de:

```bash
# Heroku'ya giriş yapın
heroku login

# Backend için yeni bir app oluşturun
cd SERVER
heroku create wcfinder-api-prod

# Environment variables ekleyin (yukarıdaki aynı değişkenler)
heroku config:set MONGODB="mongodb+srv://..."
heroku config:set PORT=8000
heroku config:set NODE_ENV=production
# ... diğer değişkenler

# Deploy edin
git push heroku main

# Domain'i kontrol edin
heroku domains
```

### 3.2 Backend Environment Variables Template

Backend için gerekli tüm environment variables'ları içeren bir template dosyası oluşturalım:

**SERVER/.env.production.example** dosyası oluşturun (gitignore'da olmalı):

```env
# Server Configuration
PORT=8000
HOST=0.0.0.0
NODE_ENV=production

# Database
MONGODB=mongodb+srv://username:password@cluster.mongodb.net/wcfinder?retryWrites=true&w=majority

# JWT Secrets (GÜVENLİ RANDOM STRINGLER OLUŞTURUN!)
ACCESS_KEY=your_access_secret_key_here_minimum_32_chars
REFRESH_KEY=your_refresh_secret_key_here_minimum_32_chars

# CORS (Frontend URL'leri - virgülle ayırın)
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PayPal (Production Keys)
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx

# Email Configuration (Opsiyonel - Nodemailer için)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Proxy Trust (Production için true)
TRUST_PROXY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5
PAYMENT_RATE_LIMIT_WINDOW_MS=60000
PAYMENT_RATE_LIMIT_MAX_REQUESTS=5

# Body Size Limit
MAX_BODY_SIZE=10mb
```

### 3.3 Backend Test

Backend deploy edildikten sonra test edin:

```bash
# Health check
curl https://your-backend-url.up.railway.app/

# Swagger documentation
# Tarayıcıda açın: https://your-backend-url.up.railway.app/documents/swagger
```

---

## 4. Frontend Deployment

### 4.1 Environment Variables Hazırlama

Frontend için gerekli environment variables:

**CLIENT/.env.production** dosyası oluşturun:

```env
# Backend API URL (Backend deployment'tan aldığınız URL)
VITE_BASE_URL=https://your-backend-url.up.railway.app

# Stripe Public Key (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# PayPal Client ID (Production)
VITE_PAYPAL_CLIENT_ID=xxxxx
```

**ÖNEMLİ**: Vite'da environment variable'lar `VITE_` ile başlamalı!

### 4.2 Frontend Build

Önce lokal olarak production build test edin:

```bash
cd CLIENT

# Production build oluştur
npm run build

# Build başarılı mı kontrol edin
# dist/ klasörü oluşmalı

# Preview ile test edin (opsiyonel)
npm run preview
```

### 4.3 Frontend Deployment Seçenekleri

#### Seçenek A: Vercel (Önerilen - En Kolay)

1. **Vercel'e giriş yapın**: https://vercel.com (GitHub ile)
2. **"Add New Project"** tıklayın
3. Repository'nizi seçin
4. **Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `CLIENT`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** ekleyin:
   - `VITE_BASE_URL` = Backend URL'niz
   - `VITE_STRIPE_PUBLISHABLE_KEY` = Stripe public key
   - `VITE_PAYPAL_CLIENT_ID` = PayPal client ID
6. **"Deploy"** tıklayın
7. Deploy tamamlandıktan sonra URL alacaksınız: `https://wcfinder.vercel.app`

#### Seçenek B: Netlify

1. **Netlify'e giriş yapın**: https://netlify.com
2. **"Add new site"** > **"Import an existing project"**
3. GitHub repository'nizi seçin
4. **Build settings**:
   - **Base directory**: `CLIENT`
   - **Build command**: `npm run build`
   - **Publish directory**: `CLIENT/dist`
5. **Environment variables** ekleyin (yukarıdaki gibi)
6. **"Deploy site"** tıklayın

#### Seçenek C: Railway (Backend ile Aynı Platform)

1. Railway'da yeni bir service ekleyin
2. **Source**: GitHub repo
3. **Root Directory**: `CLIENT`
4. **Build Command**: `npm run build`
5. **Start Command**: `npx serve -s dist -l 3000`
6. Environment variables ekleyin
7. Deploy edin

**NOT**: Railway'da static site için `serve` paketini yüklemek gerekebilir:

```bash
# CLIENT/package.json'a ekleyin:
"serve": "^14.2.1"
```

### 4.4 Frontend URL'yi Backend'e Ekleme

Frontend deploy edildikten sonra, backend'in CORS ayarlarını güncellemeniz gerekiyor:

1. Backend hosting platformunuzda (Railway/Heroku)
2. **Environment Variables** bölümüne gidin
3. `CORS_ORIGIN` değerini güncelleyin:
   ```
   https://your-frontend-domain.vercel.app,https://your-frontend-domain.com
   ```
4. Backend'i yeniden deploy edin (veya restart edin)

---

## 5. Domain ve SSL Ayarları

### 5.1 Domain Bağlama (Vercel/Netlify)

1. **Vercel Dashboard** > Projeniz > **Settings** > **Domains**
2. Custom domain'inizi ekleyin: `wcfinder.de`
3. DNS ayarlarını domain sağlayıcınızda yapın:
   - **A Record**: `@` → `76.76.21.21` (Vercel IP)
   - **CNAME**: `www` → `cname.vercel-dns.com`

### 5.2 Backend Domain (Railway)

1. Railway'da **Settings** > **Domains**
2. Custom domain ekleyin: `api.wcfinder.de`
3. DNS ayarları:
   - **CNAME**: `api` → `your-app.up.railway.app`

### 5.3 SSL Sertifikası

- **Vercel/Netlify**: Otomatik SSL (Let's Encrypt)
- **Railway**: Otomatik SSL
- **Heroku**: `heroku certs:auto:enable`

SSL genellikle otomatik olarak aktif olur. 24 saat içinde geçerli hale gelir.

---

## 6. Production Testi

### 6.1 Backend Testleri

```bash
# 1. Health Check
curl https://api.wcfinder.de/

# 2. API Documentation
# Tarayıcıda: https://api.wcfinder.de/documents/swagger

# 3. Login Test
curl -X POST https://api.wcfinder.de/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### 6.2 Frontend Testleri

1. ✅ **Ana sayfa yükleniyor mu?**
   - Tarayıcıda: `https://wcfinder.de`
   
2. ✅ **Backend'e bağlanıyor mu?**
   - Browser Console açın (F12)
   - Network tab'ında API isteklerini kontrol edin
   
3. ✅ **Login/Register çalışıyor mu?**
   - Test kullanıcısı ile giriş yapın
   
4. ✅ **Ödeme sistemi çalışıyor mu?**
   - Stripe test kartı ile test edin
   - PayPal sandbox ile test edin

### 6.3 Production Checklist

- [ ] Backend deploy edildi ve çalışıyor
- [ ] Frontend deploy edildi ve çalışıyor
- [ ] MongoDB bağlantısı başarılı
- [ ] CORS ayarları doğru
- [ ] Environment variables doğru ayarlandı
- [ ] SSL sertifikası aktif
- [ ] Domain'ler doğru çalışıyor
- [ ] Login/Register test edildi
- [ ] Ödeme sistemi test edildi
- [ ] Admin panel erişilebilir
- [ ] Error logging çalışıyor

---

## 7. Sorun Giderme

### 7.1 Backend Başlamıyor

**Sorun**: Backend deploy olmuyor veya crash ediyor

**Çözümler**:
```bash
# 1. Logları kontrol edin
# Railway: Dashboard > Deployments > Logs
# Heroku: heroku logs --tail

# 2. Environment variables eksik mi?
# Tüm gerekli değişkenlerin eklendiğinden emin olun

# 3. MongoDB bağlantısı başarısız mı?
# - IP whitelist kontrol edin
# - Connection string doğru mu?
# - Şifre doğru mu?

# 4. Port hatası?
# PORT=8000 environment variable'ı ekleyin
```

### 7.2 Frontend Backend'e Bağlanamıyor

**Sorun**: CORS hatası veya API istekleri başarısız

**Çözümler**:
1. **CORS_ORIGIN kontrolü**:
   - Backend'de `CORS_ORIGIN` environment variable'ı frontend URL'nizi içermeli
   - Virgülle ayırın: `https://wcfinder.de,https://www.wcfinder.de`

2. **VITE_BASE_URL kontrolü**:
   - Frontend'de `VITE_BASE_URL` backend URL'nizi içermeli
   - `https://api.wcfinder.de` gibi

3. **Browser Console kontrolü**:
   - Network tab'ında hata mesajlarını inceleyin

### 7.3 MongoDB Bağlantı Hatası

**Sorun**: Database connection timeout

**Çözümler**:
1. **IP Whitelist**: MongoDB Atlas'ta `0.0.0.0/0` ekleyin
2. **Connection String**: Şifre ve database adını kontrol edin
3. **Network Access**: Database user'ın doğru izinleri var mı?

### 7.4 Stripe/PayPal Ödeme Hatası

**Sorun**: Ödeme işlemleri çalışmıyor

**Çözümler**:
1. **Production Keys**: Test keys değil, live keys kullandığınızdan emin olun
2. **Webhook URL**: Stripe webhook URL'ini backend URL'nize ayarlayın
3. **CORS**: Payment callback URL'leri CORS_ORIGIN'de olmalı

---

## 8. Post-Deployment

### 8.1 İlk Admin Kullanıcısı Oluşturma

Production'da ilk admin kullanıcısını oluşturun:

```bash
# Backend'de script çalıştırın
cd SERVER
node createAdmin.js

# VEYA API üzerinden:
# CREATE_ADMIN_USER.md dosyasına bakın
```

### 8.2 Monitoring Kurulumu

1. **Error Tracking**: Sentry ekleyin
2. **Uptime Monitoring**: UptimeRobot veya Pingdom
3. **Logs**: Railway/Heroku built-in logging kullanın

### 8.3 Backup Stratejisi

1. **MongoDB Atlas**: Otomatik backup'ı etkinleştirin
2. **Database Backup**: Haftalık manuel backup alın
3. **Environment Variables**: Güvenli bir yerde saklayın

---

## 9. Hızlı Referans

### Backend URL
```
https://api.wcfinder.de
```

### Frontend URL
```
https://wcfinder.de
```

### API Documentation
```
https://api.wcfinder.de/documents/swagger
```

### Önemli Komutlar

```bash
# Backend logs (Railway)
railway logs

# Backend logs (Heroku)
heroku logs --tail -a wcfinder-api-prod

# Frontend rebuild (Vercel)
# Otomatik - her push'ta deploy olur

# Database backup
mongodump --uri "mongodb+srv://..." --out backup/
```

---

## 10. Güvenlik Kontrol Listesi

Production'a almadan önce:

- [ ] Tüm environment variables güvenli şekilde saklanıyor
- [ ] JWT secrets güçlü ve unique
- [ ] Database şifreleri güçlü
- [ ] CORS sadece gerekli domain'lere izin veriyor
- [ ] Rate limiting aktif
- [ ] HTTPS/SSL aktif
- [ ] Production keys kullanılıyor (test keys değil)
- [ ] Error messages production'da detaylı bilgi vermiyor
- [ ] Loglarda hassas bilgiler yok

---

**Son Güncelleme**: Aralık 2024  
**Versiyon**: 1.0

Sorularınız için: info@wcfinder.de

