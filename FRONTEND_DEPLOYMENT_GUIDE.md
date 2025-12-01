# Frontend Deployment Rehberi - WCFinder

## 📍 Nerede Deploy Edilecek?

**Railway.app** - Backend ile aynı platform (önerilen)

Alternatifler:
- Vercel (ücretsiz, kolay)
- Netlify (ücretsiz, kolay)
- Render (ücretsiz tier var)

---

## 🚀 Railway'de Frontend Deployment

### Adım 1: Railway Dashboard'a Gidin

1. [Railway.app](https://railway.app) hesabınıza girin
2. Backend service'inizin olduğu **aynı project**'i açın
3. **"New Service"** butonuna tıklayın

### Adım 2: GitHub Repository Bağlayın

1. **"GitHub Repo"** seçeneğini seçin
2. WCFinder repository'nizi seçin
3. **"Deploy"** butonuna tıklayın

### Adım 3: Root Directory Ayarlayın ⚠️ KRİTİK

1. Service oluşturulduktan sonra **"Settings"** sekmesine gidin
2. **"Root Directory"** bölümünü bulun
3. **`CLIENT`** yazın (büyük harf, tam olarak)
4. **"Save"** butonuna tıklayın

**ÖNEMLİ:** Root directory yanlış olursa build başarısız olur!

### Adım 4: Build ve Start Command Kontrolü

Settings'te şunları kontrol edin:

- **Build Command:** `npm install && npm run build` (otomatik algılanır)
- **Start Command:** `npm start` (otomatik algılanır veya manuel ekleyin)

**Not:** `CLIENT/package.json`'da `start` script'i zaten var:
```json
{
  "scripts": {
    "start": "serve -s dist -l ${PORT:-3000}"
  }
}
```

### Adım 5: Environment Variables Ekle

**"Variables"** sekmesine gidin ve ekleyin:

```env
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_KEY
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

**⚠️ ÖNEMLİ:**
- `VITE_` prefix'i olan variable'lar **build zamanında** inject edilir
- Değişiklik yaparsanız **yeniden build** gerekir
- Backend URL'ini doğru yazın (sonunda `/api` olmalı)

### Adım 6: Deploy

1. **"Deployments"** sekmesine gidin
2. **"Redeploy"** butonuna tıklayın
3. Build loglarını takip edin

**Build süreci:**
```
1. npm install (paketleri yükler)
2. npm run build (dist/ klasörü oluşturur)
3. npm start (serve komutu çalışır)
```

### Adım 7: URL'i Not Edin

Deployment başarılı olunca:
- Railway otomatik bir URL verir: `https://wcfinder-production-xxxx.up.railway.app`
- Bu URL'i not edin

### Adım 8: CORS Güncellemesi

Frontend URL'i hazır olduktan sonra:

1. **Backend service**'e gidin
2. **"Variables"** sekmesine gidin
3. `CORS_ORIGIN` variable'ını güncelleyin:
   ```
   CORS_ORIGIN=https://your-frontend-url.railway.app
   ```
4. Backend'i **restart** edin (veya otomatik restart olur)

---

## ✅ Deployment Kontrol Listesi

### Ön Hazırlık
- [ ] Backend deploy edildi ve çalışıyor
- [ ] Backend URL'i not edildi
- [ ] Stripe production key'leri hazır
- [ ] PayPal production credentials hazır

### Railway Ayarları
- [ ] Frontend service oluşturuldu
- [ ] Root Directory: `CLIENT` ayarlandı
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

### Environment Variables
- [ ] `VITE_API_BASE_URL` eklendi (Backend URL + `/api`)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` eklendi
- [ ] `VITE_PAYPAL_CLIENT_ID` eklendi

### Deployment
- [ ] Build başarılı (logs'da görünüyor)
- [ ] Service çalışıyor (logs'da "Serving!" görünüyor)
- [ ] Frontend URL alındı
- [ ] Site açılıyor (502 hatası yok)

### CORS
- [ ] Backend'de `CORS_ORIGIN` güncellendi
- [ ] Backend restart edildi
- [ ] CORS hatası yok

---

## 🔍 Debug: Railway Logs

### Build Logs Kontrolü

**Başarılı build:**
```
✓ built in X.XXs
dist/index.html
dist/assets/...
```

**Hata varsa:**
- Build hatalarını kontrol edin
- Environment variable'ları kontrol edin

### Start Logs Kontrolü

**Service çalışıyorsa:**
```
Serving!
  - Local:    http://localhost:XXXX
  - Network:  http://0.0.0.0:XXXX
```

**Hata varsa:**
- `serve` paketi yüklü mü?
- `dist/` klasörü var mı?
- PORT environment variable doğru mu?

---

## 🐛 Yaygın Hatalar

### Hata 1: "Cannot find module 'serve'"

**Çözüm:**
- `CLIENT/package.json`'da `serve` paketi `dependencies`'de olmalı
- Yeniden deploy edin

### Hata 2: "ENOENT: no such file or directory, stat 'dist'"

**Çözüm:**
- Build başarısız olmuş
- Build logs'u kontrol edin
- Build hatalarını düzeltin

### Hata 3: 502 Bad Gateway

**Çözüm:**
- Start command doğru mu? (`npm start`)
- Service çalışıyor mu? (logs kontrol)
- `RAILWAY_502_FIX.md` dosyasına bakın

### Hata 4: CORS Error

**Çözüm:**
- Backend'de `CORS_ORIGIN` frontend URL'i ile eşleşiyor mu?
- Backend restart edildi mi?

---

## 🌐 Custom Domain (Opsiyonel)

### Domain Bağlama

1. Railway Dashboard → Frontend Service → Settings
2. **"Networking"** sekmesine gidin
3. **"Custom Domain"** ekleyin
4. DNS kayıtlarını yapın (CNAME veya A record)

**Örnek:**
- Domain: `wcfinder.com`
- CNAME: `wcfinder.com` → `wcfinder-production.up.railway.app`

---

## 📊 Alternatif Platformlar

### Vercel (Önerilen Alternatif)

**Avantajlar:**
- Ücretsiz tier çok iyi
- Otomatik SSL
- Kolay deployment
- CDN dahil

**Deployment:**
1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub repo'yu bağlayın
3. Root Directory: `CLIENT`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy!

### Netlify

**Avantajlar:**
- Ücretsiz tier
- Kolay deployment
- Form handling

**Deployment:**
1. [Netlify](https://netlify.com) hesabı oluşturun
2. GitHub repo'yu bağlayın
3. Build settings:
   - Base directory: `CLIENT`
   - Build command: `npm run build`
   - Publish directory: `CLIENT/dist`

---

## 📝 Özet

**Frontend Deployment Nerede?**
- ✅ **Railway.app** (Backend ile aynı platform - önerilen)

**Nasıl Deploy Edilir?**
1. Railway'de yeni service oluştur
2. Root Directory: `CLIENT`
3. Environment variables ekle
4. Deploy et
5. CORS güncelle

**Hazır Dosyalar:**
- ✅ `CLIENT/package.json` - start script var
- ✅ `CLIENT/railway.json` - Railway config var
- ✅ `serve` paketi dependencies'de

---

**Son Güncelleme**: Aralık 2024

