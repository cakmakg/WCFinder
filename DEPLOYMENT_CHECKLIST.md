# ✅ WCFinder Deployment Checklist

Bu checklist'i kullanarak deployment sürecini adım adım takip edin.

---

## 📋 Pre-Deployment (Deployment Öncesi)

### Hazırlık
- [ ] Proje kodları son versiyonda ve test edilmiş
- [ ] Git repository güncel ve commit edilmiş
- [ ] Tüm environment variables listesi hazır
- [ ] Production keys'ler (Stripe, PayPal) hazır

### Hesaplar ve Servisler
- [ ] MongoDB Atlas hesabı oluşturuldu
- [ ] Stripe hesabı (production ready)
- [ ] PayPal hesabı (production credentials)
- [ ] Hosting platform hesabı seçildi (Railway/Vercel/Heroku)
- [ ] Domain satın alındı (opsiyonel)

---

## 🗄️ MongoDB Atlas Setup

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user oluşturuldu (username/password)
- [ ] Network Access ayarlandı (IP whitelist: 0.0.0.0/0 veya hosting IP'leri)
- [ ] Connection string alındı ve güvenli yerde saklandı
- [ ] Connection string test edildi (lokal olarak)

---

## 🔧 Backend Deployment

### Environment Variables
- [ ] `MONGODB` - MongoDB connection string ayarlandı
- [ ] `PORT` - 8000 olarak ayarlandı
- [ ] `NODE_ENV` - production olarak ayarlandı
- [ ] `HOST` - 0.0.0.0 olarak ayarlandı
- [ ] `ACCESS_KEY` - Güçlü random string oluşturuldu
- [ ] `REFRESH_KEY` - Güçlü random string oluşturuldu
- [ ] `CORS_ORIGIN` - Frontend URL'leri eklendi (deploy sonrası güncellenecek)
- [ ] `STRIPE_SECRET_KEY` - Production key eklendi
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret eklendi
- [ ] `PAYPAL_CLIENT_ID` - Production client ID eklendi
- [ ] `PAYPAL_CLIENT_SECRET` - Production secret eklendi
- [ ] `TRUST_PROXY` - true olarak ayarlandı
- [ ] Rate limiting değerleri ayarlandı

### Deployment
- [ ] Backend hosting platform'una deploy edildi
- [ ] Backend URL alındı (örn: https://api.wcfinder.de)
- [ ] Backend health check başarılı (curl https://your-backend-url/)
- [ ] Swagger documentation erişilebilir (/documents/swagger)
- [ ] API endpoints test edildi

### Test
- [ ] Database bağlantısı başarılı
- [ ] Login endpoint çalışıyor
- [ ] Register endpoint çalışıyor
- [ ] JWT token oluşturuluyor

---

## 🎨 Frontend Deployment

### Build Test (Lokal)
- [ ] `npm run build` başarılı
- [ ] `dist/` klasörü oluşturuldu
- [ ] Build hatası yok

### Environment Variables
- [ ] `VITE_BASE_URL` - Backend URL'si eklendi
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Production public key eklendi
- [ ] `VITE_PAYPAL_CLIENT_ID` - Production client ID eklendi

### Deployment
- [ ] Frontend hosting platform'una deploy edildi
- [ ] Frontend URL alındı (örn: https://wcfinder.de)
- [ ] Frontend sayfası yükleniyor
- [ ] Console'da hata yok

### CORS Güncellemesi
- [ ] Backend'de `CORS_ORIGIN` frontend URL'i ile güncellendi
- [ ] Backend yeniden deploy edildi veya restart edildi
- [ ] CORS hatası çözüldü

---

## 🔗 Domain ve SSL

### Domain Ayarları
- [ ] Frontend domain bağlandı (wcfinder.de)
- [ ] Backend domain bağlandı (api.wcfinder.de)
- [ ] DNS kayıtları yapıldı (A record, CNAME)
- [ ] DNS propagasyonu tamamlandı (24 saat içinde)

### SSL Sertifikası
- [ ] SSL sertifikası otomatik oluşturuldu
- [ ] HTTPS çalışıyor (http:// yerine https://)
- [ ] SSL hatası yok (tarayıcıda)

---

## 🧪 Production Test

### Genel Testler
- [ ] Ana sayfa yükleniyor
- [ ] Backend'e bağlantı başarılı
- [ ] Console'da hata yok

### Authentication Testleri
- [ ] Kullanıcı kaydı çalışıyor
- [ ] Kullanıcı girişi çalışıyor
- [ ] Token saklama çalışıyor
- [ ] Logout çalışıyor

### Özellik Testleri
- [ ] Harita yükleniyor
- [ ] Tuvalet listesi görüntüleniyor
- [ ] Rezervasyon oluşturulabiliyor
- [ ] Ödeme sayfası açılıyor

### Ödeme Testleri
- [ ] Stripe ödeme formu yükleniyor
- [ ] PayPal ödeme butonu görünüyor
- [ ] Test ödemesi yapılabiliyor (Stripe test kartı)
- [ ] Ödeme sonrası yönlendirme çalışıyor

### Admin Testleri
- [ ] Admin panel erişilebilir
- [ ] İşletme onaylama çalışıyor
- [ ] İstatistikler görüntüleniyor

---

## 🔐 Güvenlik Kontrolleri

- [ ] Tüm environment variables güvenli şekilde saklanıyor
- [ ] JWT secrets güçlü ve unique
- [ ] Database şifreleri güçlü
- [ ] CORS sadece gerekli domain'lere izin veriyor
- [ ] Rate limiting aktif
- [ ] HTTPS/SSL aktif (hem frontend hem backend)
- [ ] Production keys kullanılıyor (test keys değil)
- [ ] Error messages production'da detaylı bilgi vermiyor
- [ ] .env dosyaları git'e commit edilmemiş

---

## 📊 Post-Deployment

### İlk Kurulum
- [ ] İlk admin kullanıcısı oluşturuldu
- [ ] Test işletme oluşturuldu (opsiyonel)
- [ ] Test rezervasyon yapıldı (opsiyonel)

### Monitoring
- [ ] Error tracking kuruldu (Sentry, vb.)
- [ ] Uptime monitoring aktif (UptimeRobot, vb.)
- [ ] Logging sistemi çalışıyor
- [ ] Backup stratejisi hazırlandı

### Dokümantasyon
- [ ] Backend URL not edildi
- [ ] Frontend URL not edildi
- [ ] Tüm environment variables güvenli yerde saklandı
- [ ] Domain bilgileri not edildi

---

## 🚨 Acil Durum Planı

- [ ] Rollback planı hazır
- [ ] Database backup alındı
- [ ] Önceki versiyon bilgisi not edildi
- [ ] Destek kişileri listesi hazır

---

## ✅ Final Onay

- [ ] Tüm testler başarılı
- [ ] Güvenlik kontrolleri tamamlandı
- [ ] Monitoring aktif
- [ ] Backup stratejisi hazır
- [ ] **PRODUCTION'A HAZIR! 🚀**

---

**Tarih**: _____________  
**Deploy eden**: _____________  
**Onaylayan**: _____________  

---

## 📝 Notlar

Deployment sırasında karşılaşılan sorunlar ve çözümleri:

```
[Buraya notlarınızı yazın]
```

---

**Son Güncelleme**: Aralık 2024

