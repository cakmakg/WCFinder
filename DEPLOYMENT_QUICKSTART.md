# ⚡ WCFinder Hızlı Deployment Rehberi

**En hızlı şekilde production'a almak için kısa rehber**

> 📖 Detaylı rehber için: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

---

## 🎯 Hızlı Adımlar (5 Dakika Özet)

### 1️⃣ MongoDB Atlas (2 dakika)

```bash
1. https://www.mongodb.com/cloud/atlas → Giriş yap
2. "Create" > "Database" → Free tier seç (M0)
3. "Database Access" → User oluştur (username/password kaydet!)
4. "Network Access" → "Allow Access from Anywhere" (0.0.0.0/0)
5. "Connect" → "Connect your application" → Connection string'i kopyala
6. Connection string'de <password> ve database adını düzenle
```

**Örnek Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority
```

---

### 2️⃣ Backend Deployment (Railway - 3 dakika) ⭐ ÖNERİLEN

> 💡 **Neden Railway?** Projenizde dosya uploads ve PDF storage var. Railway'da dosyalar kalıcı, Render'da restart'ta silinir. 
> Detaylı karşılaştırma: [DEPLOYMENT_PLATFORM_COMPARISON.md](DEPLOYMENT_PLATFORM_COMPARISON.md)

1. **Railway'a giriş**: https://railway.app (GitHub ile)

2. **Yeni proje oluştur**:
   - "New Project" → "Deploy from GitHub repo"
   - Repository'nizi seçin

3. **Service ayarları**:
   - Settings → Source:
     - Root Directory: `SERVER`
     - Start Command: `npm start`

4. **Environment Variables ekle** (Variables sekmesi):

```env
MONGODB=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wcfinder?retryWrites=true&w=majority
PORT=8000
NODE_ENV=production
HOST=0.0.0.0

# JWT Secrets (random string oluştur)
ACCESS_KEY=buraya_32_karakter_random_string
REFRESH_KEY=buraya_32_karakter_random_string

# CORS (Frontend URL'ini deploy sonrası ekleyeceğiz)
CORS_ORIGIN=https://your-frontend.vercel.app

# Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PayPal (Production keys)
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx

TRUST_PROXY=true
```

5. **Deploy** → Backend URL'ini kaydedin: `https://xxxxx.up.railway.app`

---

### 3️⃣ Frontend Deployment (Vercel - 2 dakika)

1. **Vercel'e giriş**: https://vercel.com (GitHub ile)

2. **Yeni proje**:
   - "Add New Project" → Repository seçin
   - Framework Preset: **Vite**
   - Root Directory: `CLIENT`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**:

```env
VITE_BASE_URL=https://xxxxx.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_PAYPAL_CLIENT_ID=xxxxx
```

4. **Deploy** → Frontend URL'ini kaydedin: `https://xxxxx.vercel.app`

---

### 4️⃣ CORS Güncelleme (1 dakika)

1. Railway'da backend'inize gidin
2. **Variables** sekmesi → `CORS_ORIGIN` değerini güncelleyin:
   ```
   https://xxxxx.vercel.app
   ```
3. Backend otomatik olarak yeniden deploy olacak

---

## ✅ Test

```bash
# Backend test
curl https://your-backend.up.railway.app/

# Frontend test
# Tarayıcıda aç: https://your-frontend.vercel.app
```

---

## 🔑 Önemli Notlar

### JWT Secret Oluşturma

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

### Environment Variables Şablonları

- Backend: `SERVER/env.production.template`
- Frontend: `CLIENT/env.production.template`

### Checklist

Detaylı kontrol listesi için: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🆘 Sorun mu Var?

### Backend başlamıyor
- ✅ Tüm environment variables eklendi mi?
- ✅ MongoDB connection string doğru mu?
- ✅ Logları kontrol edin (Railway Dashboard → Deployments → Logs)

### Frontend backend'e bağlanamıyor
- ✅ `VITE_BASE_URL` backend URL'sini içeriyor mu?
- ✅ Backend'de `CORS_ORIGIN` frontend URL'sini içeriyor mu?
- ✅ Browser Console'da hata var mı? (F12 → Console)

### MongoDB bağlantı hatası
- ✅ Network Access'te IP whitelist var mı? (0.0.0.0/0)
- ✅ Connection string'de şifre doğru mu?
- ✅ Database user oluşturuldu mu?

---

## 📚 Detaylı Dokümantasyon

- **Tam Rehber**: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Platform Karşılaştırması**: [DEPLOYMENT_PLATFORM_COMPARISON.md](DEPLOYMENT_PLATFORM_COMPARISON.md)

---

**Başarılar! 🚀**

Sorularınız için: info@wcfinder.de

