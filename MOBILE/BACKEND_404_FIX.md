# 🔧 Backend 404 Hatası - Çözüm

## ❌ Hata
```
Request failed with status code 404
fullURL: "https://wcfinder-backend.railway.app/api/auth/login"
```

## 🔍 Sorun

Backend'e bağlanıyor ama endpoint bulunamıyor. İki olasılık:

1. **Backend çalışmıyor** - Railway'de backend servisi durmuş olabilir
2. **Route yapısı farklı** - Backend'de route farklı mount edilmiş olabilir

## ✅ Çözüm 1: Backend'i Kontrol Edin

### Railway Dashboard'da Kontrol:

1. Railway.app → Projenize gidin
2. Backend servisinize tıklayın
3. **"Deployments"** sekmesine bakın
4. Son deployment başarılı mı? (Yeşil tick ✅)
5. **"Logs"** sekmesine bakın
6. Backend çalışıyor mu? (Server started mesajı var mı?)

### Backend URL'ini Test Edin:

Terminal'de test edin:
```bash
# Health check
curl https://wcfinder-backend.railway.app/

# API endpoint test
curl https://wcfinder-backend.railway.app/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'
```

**Beklenen:**
- Health check: HTML veya JSON response
- Login: 400 (Bad Request - validation error) veya 401 (Unauthorized) - **AMA 404 DEĞİL!**

Eğer 404 alıyorsanız, backend route'ları mount edilmemiş demektir.

## ✅ Çözüm 2: Backend Route'larını Kontrol Edin

Backend'de route'lar şöyle olmalı:

```javascript
// SERVER/index.js
app.use('/api', routes);  // ✅ Bu satır var mı?

// SERVER/src/routes/index.js
router.use('/auth', require('./auth'));  // ✅ Bu satır var mı?

// SERVER/src/routes/auth.js
router.post('/login', login);  // ✅ Bu satır var mı?
```

## ✅ Çözüm 3: CORS Kontrolü

Backend'de CORS ayarları mobil uygulama için açık mı?

Railway'de backend servisinizin **Variables** sekmesinde:
- `CORS_ORIGIN` değişkeni var mı?
- Değeri `*` veya mobil uygulama için uygun mu?

**Not:** CORS sorunu genelde 404 değil, CORS error verir. Ama kontrol edin.

## ✅ Çözüm 4: Backend'i Yeniden Deploy Edin

Eğer backend çalışmıyorsa:

1. Railway Dashboard → Backend Service
2. **"Deployments"** → **"Redeploy"** tıklayın
3. Veya GitHub'a push yapın (otomatik deploy)

## 🔍 Debug Adımları

### 1. Backend Logs'u Kontrol Edin

Railway Dashboard → Backend Service → Logs

Arayın:
- "Server started successfully" ✅
- "API routes mounted successfully" ✅
- "Environment validation passed" ✅

Eğer hata varsa:
- "Environment validation failed" ❌
- "Failed to mount API routes" ❌

### 2. Backend URL'ini Manuel Test Edin

Browser'da açın:
```
https://wcfinder-backend.railway.app/
```

Eğer sayfa açılıyorsa backend çalışıyor ✅

### 3. API Endpoint'ini Test Edin

Terminal'de:
```bash
curl -X POST https://wcfinder-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Beklenen Response:**
- 400: Validation error (normal - test data)
- 401: Unauthorized (normal - yanlış credentials)
- **404: Route not found (SORUN VAR!)**

## 🚀 Hızlı Test

1. **Backend çalışıyor mu?**
   ```bash
   curl https://wcfinder-backend.railway.app/
   ```

2. **API endpoint çalışıyor mu?**
   ```bash
   curl https://wcfinder-backend.railway.app/api/auth/login -X POST
   ```

3. **Railway Logs'u kontrol edin**
   - Backend Service → Logs
   - Son log'ları kontrol edin

## 💡 İpucu

404 hatası genelde şu sebeplerden olur:
- Backend çalışmıyor
- Route'lar mount edilmemiş
- URL yanlış (ama bizimki doğru görünüyor)

En olası sebep: **Backend çalışmıyor veya route'lar mount edilmemiş**

