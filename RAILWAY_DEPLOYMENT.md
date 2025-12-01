# Railway Deployment Rehberi - WCFinder

Bu rehber, WCFinder projesini Railway'de deploy etmek için adım adım talimatlar içerir.

---

## 🚨 Önemli: Git Repository Temizliği

Railway deployment öncesi, `WCFinder-clean.git` klasörünü git'ten tamamen kaldırın:

```bash
# Git'ten kaldır (dosya sisteminden değil, sadece git tracking'den)
git rm -r --cached WCFinder-clean.git

# Commit
git commit -m "Remove WCFinder-clean.git from git tracking"

# Push
git push
```

---

## 📋 Ön Hazırlık

### 1. Railway Hesabı
- [Railway.app](https://railway.app) hesabı oluşturun
- GitHub hesabınızı bağlayın

### 2. MongoDB Atlas
- MongoDB Atlas cluster oluşturun
- Connection string'i hazırlayın
- Network Access: `0.0.0.0/0` (tüm IP'lere izin ver)

### 3. Environment Variables Hazırlığı
Aşağıdaki environment variable'ları hazırlayın (deployment sırasında kullanılacak):

**Backend için:**
- `MONGODB` - MongoDB connection string
- `PORT` - 8000 (Railway otomatik atar, ama belirtmek iyi)
- `NODE_ENV` - production
- `HOST` - 0.0.0.0
- `ACCESS_KEY` - JWT access token secret
- `REFRESH_KEY` - JWT refresh token secret
- `CORS_ORIGIN` - Frontend URL (deploy sonrası güncellenecek)
- `STRIPE_SECRET_KEY` - Stripe production secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `PAYPAL_CLIENT_ID` - PayPal production client ID
- `PAYPAL_CLIENT_SECRET` - PayPal production secret
- `TRUST_PROXY` - true

**Frontend için:**
- `VITE_API_BASE_URL` - Backend URL (deploy sonrası güncellenecek)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe production publishable key
- `VITE_PAYPAL_CLIENT_ID` - PayPal production client ID

---

## 🚀 Backend Deployment

### Adım 1: Railway'de Yeni Proje Oluştur

1. Railway dashboard'a gidin
2. "New Project" tıklayın
3. "Deploy from GitHub repo" seçin
4. WCFinder repository'sini seçin

### Adım 2: Backend Service Oluştur

1. "New Service" tıklayın
2. "GitHub Repo" seçin
3. Repository'yi seçin
4. **ÖNEMLİ**: Root directory olarak `SERVER` klasörünü seçin

**Railway Settings:**
- **Root Directory**: `SERVER`
- **Build Command**: `npm install` (otomatik algılanır)
- **Start Command**: `npm start` (otomatik algılanır)

### Adım 3: Environment Variables Ekle

Railway dashboard'da Backend service'in "Variables" sekmesine gidin ve ekleyin:

**🔴 KRİTİK: MONGODB Connection String**

1. MongoDB Atlas'tan connection string alın:
   - MongoDB Atlas → Connect → Connect your application
   - Connection string'i kopyalayın
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - `<username>`, `<password>`, `<database>` kısımlarını gerçek değerlerle değiştirin

2. Railway'de "New Variable" tıklayın:
   - **Name**: `MONGODB`
   - **Value**: `mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority`
   - **ÖNEMLİ**: Tırnak işareti (`"`) kullanmayın!

3. Diğer environment variables:

```env
PORT=8000
NODE_ENV=production
HOST=0.0.0.0
ACCESS_KEY=your-super-secret-access-key-min-32-chars
REFRESH_KEY=your-super-secret-refresh-key-min-32-chars
CORS_ORIGIN=https://your-frontend-url.railway.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
TRUST_PROXY=true
```

**⚠️ MongoDB Connection String Hataları İçin:** `RAILWAY_MONGODB_SETUP.md` dosyasına bakın.

### Adım 4: Deploy

1. "Deploy" butonuna tıklayın
2. Build loglarını takip edin
3. Deployment başarılı olunca, Backend URL'ini not edin (örn: `https://wcfinder-backend.railway.app`)

### Adım 5: Test

```bash
# Health check
curl https://your-backend-url.railway.app/

# Swagger docs
curl https://your-backend-url.railway.app/documents/swagger
```

---

## 🎨 Frontend Deployment

### Adım 1: Frontend Service Oluştur

1. Aynı Railway project'te "New Service" tıklayın
2. "GitHub Repo" seçin
3. Aynı repository'yi seçin
4. **ÖNEMLİ**: Root directory olarak `CLIENT` klasörünü seçin

**Railway Settings:**
- **Root Directory**: `CLIENT`
- **Build Command**: `npm install && npm run build` (otomatik algılanır)
- **Start Command**: `npm start` (güncellenmiş - `CLIENT/package.json`'da start script var)

### Adım 2: Frontend Start Script Kontrolü

`CLIENT/package.json`'da `start` script'i olmalı (zaten eklenmiş):

```json
{
  "scripts": {
    "start": "serve -s dist -l ${PORT:-3000}"
  },
  "dependencies": {
    "serve": "^14.2.1"
  }
}
```

✅ Bu dosyalar zaten güncellenmiş durumda.

### Adım 3: Environment Variables Ekle

Railway dashboard'da Frontend service'in "Variables" sekmesine gidin:

```env
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

**ÖNEMLİ**: `VITE_` prefix'i olan variable'lar build zamanında inject edilir. Değişiklik yaparsanız yeniden build gerekir.

### Adım 4: Deploy

1. "Deploy" butonuna tıklayın
2. Build loglarını takip edin
3. Deployment başarılı olunca, Frontend URL'ini not edin

### Adım 5: CORS Güncellemesi

Frontend URL'i hazır olduktan sonra:

1. Backend service'in Variables sekmesine gidin
2. `CORS_ORIGIN` variable'ını güncelleyin:
   ```
   CORS_ORIGIN=https://your-frontend-url.railway.app
   ```
3. Backend'i yeniden deploy edin (veya restart edin)

---

## 🔧 Railway.json Dosyaları

Projeye `railway.json` dosyaları eklendi:

- `SERVER/railway.json` - Backend için
- `CLIENT/railway.json` - Frontend için

Bu dosyalar Railway'in otomatik algılamasını iyileştirir.

---

## 🌐 Custom Domain (Opsiyonel)

### Backend Domain

1. Backend service'te "Settings" > "Networking"
2. "Generate Domain" veya "Custom Domain" ekleyin
3. DNS kayıtlarını yapın (CNAME veya A record)

### Frontend Domain

1. Frontend service'te "Settings" > "Networking"
2. "Generate Domain" veya "Custom Domain" ekleyin
3. DNS kayıtlarını yapın

---

## 🐛 Sorun Giderme

### Build Hatası

**Sorun**: "Cannot find module" hatası
**Çözüm**: 
- Root directory doğru mu kontrol edin (`SERVER` veya `CLIENT`)
- `package.json` dosyası doğru yerde mi?

**Sorun**: "Command failed" hatası
**Çözüm**:
- Build loglarını kontrol edin
- Environment variables eksik olabilir

### Runtime Hatası

**Sorun**: "Port already in use"
**Çözüm**: 
- Railway otomatik PORT atar, `$PORT` environment variable'ını kullanın
- Backend'de `process.env.PORT || 8000` kullanın

**Sorun**: "MongoDB connection failed"
**Çözüm**:
- MongoDB Atlas Network Access'te `0.0.0.0/0` var mı?
- Connection string doğru mu?
- Username/password doğru mu?

**Sorun**: "CORS error"
**Çözüm**:
- Backend'de `CORS_ORIGIN` frontend URL'i ile eşleşiyor mu?
- Frontend URL'inde trailing slash var mı kontrol edin

### WCFinder-clean.git Hatası

**Sorun**: Railway deployment sırasında `WCFinder-clean.git` hatası
**Çözüm**:

```bash
# Git'ten kaldır
git rm -r --cached WCFinder-clean.git

# .gitignore'da zaten var, ama git cache'den kaldırılmalı
git commit -m "Remove WCFinder-clean.git from git tracking"
git push
```

---

## 📊 Monitoring

### Railway Dashboard

- **Metrics**: CPU, Memory, Network kullanımı
- **Logs**: Real-time log görüntüleme
- **Deployments**: Deployment geçmişi

### Health Checks

Backend health check endpoint:
```
GET https://your-backend-url.railway.app/
```

---

## ✅ Deployment Checklist

- [ ] Git repository temiz (WCFinder-clean.git kaldırıldı)
- [ ] MongoDB Atlas hazır
- [ ] Railway hesabı oluşturuldu
- [ ] Backend service oluşturuldu (Root: `SERVER`)
- [ ] Backend environment variables eklendi
- [ ] Backend deploy edildi ve çalışıyor
- [ ] Frontend service oluşturuldu (Root: `CLIENT`)
- [ ] Frontend environment variables eklendi
- [ ] Frontend deploy edildi ve çalışıyor
- [ ] CORS güncellendi
- [ ] Test edildi (login, register, vb.)

---

## 🚀 Sonraki Adımlar

1. **Google Search Console**: Sitemap'i gönderin
2. **Monitoring**: Error tracking (Sentry) ekleyin
3. **Backup**: MongoDB backup stratejisi
4. **SSL**: Custom domain için SSL otomatik (Railway)

---

**Son Güncelleme**: Aralık 2024

