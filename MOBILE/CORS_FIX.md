# 🔧 CORS Hatası - Çözüm

## ❌ Sorun
```
❌ CORS BLOCKED
origin: 'http://192.168.178.23:3000'
isAllowed: false
```

Backend çalışıyor ama mobil uygulama için CORS engellenmiş.

## ✅ Çözüm: Railway'de CORS_ORIGIN Güncelle

### Adım 1: Railway Dashboard'a Gidin

1. Railway.app → Projenize gidin
2. **Backend servisinize** tıklayın
3. **"Variables"** sekmesine gidin

### Adım 2: CORS_ORIGIN Değişkenini Güncelle

**Mevcut değer:**
```
https://wcfinder-client-production-0b4a.up.railway.app,http://localhost:5173
```

**Yeni değer (mobil uygulama için):**
```
https://wcfinder-client-production-0b4a.up.railway.app,http://localhost:5173,exp://192.168.178.23:8081,exp://*
```

**VEYA daha basit (tüm origin'lere izin ver - development için):**
```
*
```

**VEYA production için güvenli (sadece gerekli origin'ler):**
```
https://wcfinder-client-production-0b4a.up.railway.app,http://localhost:5173,exp://*,http://192.168.178.23:*
```

### Adım 3: Değişiklik Sonrası

Railway otomatik olarak yeniden deploy eder. Log'ları kontrol edin.

## 🔍 Mobil Uygulama Origin'leri

Expo Go ve tunnel modu için origin'ler:
- `exp://192.168.178.23:8081` - LAN modu
- `exp://*.exp.direct` - Tunnel modu
- `http://192.168.178.23:3000` - Development server

## ✅ Önerilen CORS_ORIGIN Değeri

### Development için:
```
*
```
(Tüm origin'lere izin ver - sadece development için!)

### Production için:
```
https://wcfinder-client-production-0b4a.up.railway.app,exp://*,http://localhost:5173
```

## 📝 Notlar

1. **Wildcard (`*`):** Development için kullanılabilir, production'da güvenlik riski
2. **Expo origin'ler:** `exp://*` pattern'i tüm Expo origin'lerini kapsar
3. **Değişiklik sonrası:** Backend otomatik yeniden deploy edilir

## 🚀 Hızlı Çözüm

Railway'de `CORS_ORIGIN` değişkenini şu şekilde güncelleyin:

```
https://wcfinder-client-production-0b4a.up.railway.app,http://localhost:5173,exp://*
```

Veya development için:
```
*
```

## ⚠️ Önemli Not

Backend **port 8080**'de çalışıyor ama biz **8000** bekliyorduk. Bu da bir sorun olabilir. Kontrol edin:
- Railway'de `PORT` variable'ı ne?
- Backend URL'iniz doğru mu?

