# 🔗 Backend URL vs Frontend URL - Açıklama

## ❓ Soru: Backend URL mi, Frontend URL mi?

**Cevap: BACKEND URL kullanılmalı! ✅**

## 📱 Mobil Uygulama Akışı

```
Mobil Uygulama (React Native)
    ↓
Backend API (Node.js/Express)
    ↓
MongoDB Database
```

Mobil uygulama **direkt backend API'ye** istek yapar, frontend'e değil!

## 🔧 app.config.js Yapılandırması

`mobile/app.config.js` dosyasında:

```javascript
const apiUrls = {
  development: 'http://localhost:8000',  // ← Backend URL (local)
  production: 'https://your-backend.railway.app',  // ← Backend URL (Railway)
};
```

## 📍 URL Örnekleri

### ✅ DOĞRU (Backend URL)
```javascript
production: 'https://wcfinder-backend.railway.app'  // ← Backend
```

### ❌ YANLIŞ (Frontend URL)
```javascript
production: 'https://wcfinder-frontend.railway.app'  // ← Frontend (YANLIŞ!)
```

## 🔍 Nasıl Anlarsınız?

### Backend URL:
- `/api/business` endpoint'i çalışır
- `/api/auth/login` endpoint'i çalışır
- Swagger docs: `/documents/swagger`

### Frontend URL:
- Sadece HTML/CSS/JS dosyaları
- API endpoint'leri yok

## ✅ Test

Backend URL'inizi test edin:

```bash
# Backend URL (DOĞRU)
curl https://your-backend.railway.app/api/business
# ✅ Response alırsanız bu backend URL'dir

# Frontend URL (YANLIŞ)
curl https://your-frontend.railway.app/api/business
# ❌ 404 veya HTML döner (bu frontend URL'dir)
```

## 📝 Özet

- **app.config.js** → **BACKEND URL** kullanın
- Mobil uygulama → Backend API'ye istek yapar
- Frontend URL → Sadece web uygulaması için

