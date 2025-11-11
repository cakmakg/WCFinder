# Payment Sistemi - Test ve Güvenlik Dokümantasyonu

## 📋 İçindekiler
1. [Test Senaryoları](#test-senaryoları)
2. [Güvenlik Kontrolleri](#güvenlik-kontrolleri)
3. [Veri Gizliliği (GDPR/PCI-DSS)](#veri-gizliliği)
4. [Edge Cases ve Hata Senaryoları](#edge-cases)
5. [Yapılması Gerekenler](#yapılması-gerekenler)

---

## 🧪 Test Senaryoları

### 1. Stripe Payment Testleri

#### ✅ Başarılı Ödeme Senaryoları
- [ ] **Test Kartı ile Başarılı Ödeme**
  - Kart: `4242 4242 4242 4242`
  - CVV: Herhangi bir 3 haneli sayı
  - Tarih: Gelecek bir tarih
  - Beklenen: Payment success sayfasına yönlendirme

- [ ] **3D Secure Testi (3DS)**
  - Kart: `4000 0025 0000 3155` (3DS gerektirir)
  - Beklenen: 3DS authentication modal'ı açılmalı

- [ ] **Farklı Kart Tipleri**
  - Visa: `4242 4242 4242 4242`
  - Mastercard: `5555 5555 5555 4444`
  - American Express: `3782 822463 10005`

#### ❌ Başarısız Ödeme Senaryoları
- [ ] **Yetersiz Bakiye**
  - Kart: `4000 0000 0000 9995`
  - Beklenen: "Insufficient funds" hatası

- [ ] **Geçersiz Kart Numarası**
  - Kart: `4000 0000 0000 0002`
  - Beklenen: "Your card number is incorrect" hatası

- [ ] **Süresi Dolmuş Kart**
  - Kart: `4000 0000 0000 0069`
  - Beklenen: "Your card has expired" hatası

- [ ] **CVC Hatalı**
  - Kart: `4000 0000 0000 0127`
  - Beklenen: "Your card's security code is incorrect" hatası

- [ ] **Kart Reddedildi**
  - Kart: `4000 0000 0000 0002`
  - Beklenen: "Your card was declined" hatası

### 2. PayPal Payment Testleri

#### ✅ Başarılı Senaryolar
- [ ] **PayPal Sandbox Hesabı ile Ödeme**
  - Test hesabı ile giriş yap
  - Ödeme onayla
  - Beklenen: Payment success sayfası

- [ ] **PayPal Guest Checkout**
  - PayPal hesabı olmadan ödeme
  - Kredi kartı ile ödeme
  - Beklenen: Başarılı ödeme

#### ❌ Başarısız Senaryolar
- [ ] **PayPal Hesabı Yetersiz Bakiye**
  - Test hesabı: `sb-xxx@personal.example.com`
  - Beklenen: Hata mesajı

- [ ] **PayPal İptal**
  - Ödeme sırasında iptal et
  - Beklenen: Payment failed sayfası

### 3. Frontend Testleri

#### ✅ UI/UX Testleri
- [ ] **Payment Method Değiştirme**
  - Stripe'dan PayPal'a geçiş
  - PayPal'dan Stripe'a geçiş
  - Beklenen: Form düzgün değişmeli

- [ ] **Loading States**
  - Payment Intent oluşturulurken loading gösterilmeli
  - Ödeme işlenirken buton disabled olmalı
  - Beklenen: Kullanıcı çift tıklayamamalı

- [ ] **Form Validasyonu**
  - Boş kart bilgileri ile submit
  - Geçersiz email formatı
  - Beklenen: Hata mesajları gösterilmeli

- [ ] **Responsive Design**
  - Mobile'da payment form düzgün görünmeli
  - Tablet'te layout bozulmamalı

#### ✅ Navigation Testleri
- [ ] **Geri Butonu**
  - Payment sayfasından geri git
  - Beklenen: Booking bilgileri korunmalı

- [ ] **Direct URL Erişimi**
  - `/payment` sayfasına direkt git (state olmadan)
  - Beklenen: Hata mesajı ve yönlendirme

### 4. Backend Testleri

#### ✅ API Endpoint Testleri
- [ ] **createStripePayment**
  - Geçerli usageId ile test
  - Geçersiz usageId ile test
  - Başka kullanıcının usageId'si ile test
  - Beklenen: 403 Unauthorized

- [ ] **createPayPalOrder**
  - Geçerli usageId ile test
  - Zaten ödenmiş usageId ile test
  - Beklenen: 400 Bad Request

- [ ] **capturePayPalOrder**
  - Geçerli orderId ile test
  - Geçersiz orderId ile test
  - Beklenen: 404 Not Found

#### ✅ Webhook Testleri
- [ ] **Stripe Webhook - payment_intent.succeeded**
  - Webhook gönder
  - Beklenen: Payment status 'succeeded' olmalı
  - Usage paymentStatus 'paid' olmalı

- [ ] **Stripe Webhook - payment_intent.payment_failed**
  - Webhook gönder
  - Beklenen: Payment status 'failed' olmalı

- [ ] **Webhook Signature Doğrulama**
  - Geçersiz signature ile test
  - Beklenen: 400 Bad Request

### 5. Edge Cases

#### ⚠️ Kritik Senaryolar
- [ ] **Çift Ödeme Önleme**
  - Aynı usageId ile iki kez ödeme yapılmaya çalışılırsa
  - Beklenen: İkinci ödeme reddedilmeli

- [ ] **Network Timeout**
  - Ödeme sırasında internet kesilirse
  - Beklenen: Hata mesajı ve retry seçeneği

- [ ] **Session Timeout**
  - Uzun süre bekleyip ödeme yapılırsa
  - Beklenen: Session yenileme veya hata

- [ ] **Concurrent Payments**
  - Aynı anda iki farklı sekmede ödeme
  - Beklenen: İlk ödeme başarılı, ikincisi reddedilmeli

- [ ] **Amount Manipulation**
  - Frontend'de amount değiştirilirse
  - Beklenen: Backend'de doğrulama yapılmalı

---

## 🔒 Güvenlik Kontrolleri

### 1. Backend Güvenlik

#### ✅ Yapılması Gerekenler

- [ ] **Amount Validation**
  ```javascript
  // Backend'de amount kontrolü
  if (paymentIntent.amount !== usage.totalFee * 100) {
    throw new Error("Amount mismatch");
  }
  ```

- [ ] **User Authorization**
  ```javascript
  // Sadece kendi usage'ı için ödeme
  if (usage.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  ```

- [ ] **Rate Limiting**
  ```javascript
  // Payment endpoint'lerine rate limit ekle
  const rateLimit = require('express-rate-limit');
  const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5 // 5 istek
  });
  ```

- [ ] **CSRF Protection**
  ```javascript
  // CSRF token kontrolü
  // Payment form'larında CSRF token kullan
  ```

- [ ] **Input Sanitization**
  ```javascript
  // XSS saldırılarına karşı
  const validator = require('validator');
  if (!validator.isMongoId(usageId)) {
    throw new Error("Invalid usageId");
  }
  ```

- [ ] **SQL/NoSQL Injection Prevention**
  ```javascript
  // Mongoose zaten koruyor ama ekstra kontrol
  const usage = await Usage.findById(usageId); // Doğrudan ID kullan
  // Kullanıcı input'unu direkt query'de kullanma
  ```

### 2. Frontend Güvenlik

#### ✅ Yapılması Gerekenler

- [ ] **Sensitive Data Logging**
  ```javascript
  // ❌ YAPMA
  console.log('Card number:', cardNumber);
  console.log('Client secret:', clientSecret);
  
  // ✅ YAP
  console.log('Payment initiated');
  ```

- [ ] **Environment Variables**
  ```javascript
  // Stripe key'leri environment variable'da tut
  // .env dosyasını .gitignore'a ekle
  ```

- [ ] **HTTPS Enforcement**
  ```javascript
  // Production'da HTTPS zorunlu
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  ```

- [ ] **Content Security Policy (CSP)**
  ```html
  <meta http-equiv="Content-Security-Policy" 
    content="default-src 'self'; script-src 'self' https://js.stripe.com https://www.paypal.com;">
  ```

### 3. Payment Gateway Güvenlik

#### ✅ Stripe Güvenlik
- [ ] **Webhook Signature Verification**
  ```javascript
  // ✅ YAPILIYOR - Kontrol et
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  ```

- [ ] **PCI Compliance**
  - ✅ Kart bilgileri direkt backend'e gitmiyor (Stripe Elements kullanılıyor)
  - ✅ PCI-DSS Level 1 compliance Stripe tarafından sağlanıyor

#### ✅ PayPal Güvenlik
- [ ] **Order Verification**
  ```javascript
  // PayPal order'ı capture etmeden önce doğrula
  const order = await paypalClient.execute(request);
  if (order.result.status !== 'APPROVED') {
    throw new Error("Order not approved");
  }
  ```

---

## 🔐 Veri Gizliliği (GDPR/PCI-DSS)

### 1. GDPR Uyumluluğu

#### ✅ Yapılması Gerekenler

- [ ] **Privacy Policy**
  - Payment verilerinin nasıl kullanıldığını açıkla
  - Veri saklama sürelerini belirt
  - Kullanıcı haklarını (silme, erişim) belirt

- [ ] **Data Minimization**
  ```javascript
  // Sadece gerekli verileri sakla
  // Kart bilgilerini saklama (Stripe'da)
  // Sadece transaction ID ve amount sakla
  ```

- [ ] **Right to Erasure**
  ```javascript
  // Kullanıcı hesabını silerse payment verilerini de sil
  // Ancak yasal zorunluluklar için belirli süre sakla
  ```

- [ ] **Data Encryption**
  ```javascript
  // Hassas verileri encrypt et
  // Database'de encryption at rest
  // Transmission'da HTTPS/TLS
  ```

- [ ] **Audit Logging**
  ```javascript
  // Tüm payment işlemlerini logla
  // Kim, ne zaman, ne yaptı
  // Log'ları güvenli sakla
  ```

### 2. PCI-DSS Uyumluluğu

#### ✅ Mevcut Durum
- ✅ Kart bilgileri direkt backend'e gitmiyor
- ✅ Stripe Elements kullanılıyor (PCI-DSS Level 1)
- ✅ Kart bilgileri frontend'de işlenmiyor

#### ⚠️ Yapılması Gerekenler

- [ ] **Card Data Storage**
  ```javascript
  // ❌ YAPMA - Kart bilgilerini saklama
  // ✅ YAP - Sadece payment method ID sakla
  ```

- [ ] **Network Security**
  - Firewall kuralları
  - Intrusion detection
  - Regular security scans

- [ ] **Access Control**
  ```javascript
  // Payment verilerine sadece yetkili kişiler erişebilmeli
  // Role-based access control
  ```

### 3. Veri Saklama Politikası

#### ✅ Önerilen Saklama Süreleri
- **Payment Records**: 7 yıl (yasal zorunluluk)
- **Transaction Logs**: 2 yıl
- **Failed Payment Attempts**: 90 gün
- **User Payment Preferences**: Hesap silinene kadar

---

## ⚠️ Edge Cases ve Hata Senaryoları

### 1. Payment Flow Hataları

#### ✅ Yapılması Gerekenler

- [ ] **Partial Payment**
  ```javascript
  // Ödeme yarıda kesilirse ne olacak?
  // Payment Intent'i cancel et
  // Usage'ı pending'de bırak
  ```

- [ ] **Webhook Gecikmesi**
  ```javascript
  // Webhook gelmezse?
  // Polling mekanizması ekle
  // Veya manual reconciliation
  ```

- [ ] **Double Capture Prevention**
  ```javascript
  // PayPal'da aynı order iki kez capture edilmemeli
  if (payment.status === 'succeeded') {
    throw new Error("Payment already captured");
  }
  ```

- [ ] **Refund Handling**
  ```javascript
  // İade işlemi sonrası usage durumu
  // QR kod geçersiz olmalı
  // Kullanıcıya bildirim gönder
  ```

### 2. Error Handling

#### ✅ Yapılması Gerekenler

- [ ] **User-Friendly Error Messages**
  ```javascript
  // Teknik hataları kullanıcı dostu mesajlara çevir
  const errorMessages = {
    'card_declined': 'Ihre Karte wurde abgelehnt. Bitte versuchen Sie es mit einer anderen Karte.',
    'insufficient_funds': 'Unzureichende Mittel. Bitte überprüfen Sie Ihr Konto.',
    'expired_card': 'Ihre Karte ist abgelaufen. Bitte verwenden Sie eine andere Karte.',
  };
  ```

- [ ] **Error Logging**
  ```javascript
  // Tüm hataları logla (sensitive data olmadan)
  logger.error('Payment failed', {
    userId: req.user._id,
    usageId: usageId,
    error: error.message, // Kart bilgisi YOK
  });
  ```

- [ ] **Retry Mechanism**
  ```javascript
  // Network hatalarında retry
  // Exponential backoff
  // Max 3 retry
  ```

---

## 📝 Yapılması Gerekenler (Öncelik Sırasına Göre)

### 🔴 Yüksek Öncelik (Kritik)

1. **Amount Validation Backend'de**
   ```javascript
   // SERVER/src/controller/payment.js
   // createStripePayment ve createPayPalOrder'da
   // Frontend'den gelen amount'u kullanma, usage.totalFee kullan
   ```

2. **Rate Limiting**
   ```javascript
   // Payment endpoint'lerine rate limit ekle
   // DDoS ve brute force saldırılarına karşı
   ```

3. **Webhook Signature Verification**
   ```javascript
   // ✅ Yapılıyor ama test et
   // Geçersiz signature ile test et
   ```

4. **Error Handling İyileştirme**
   ```javascript
   // Kullanıcı dostu hata mesajları
   // Teknik detayları gizle
   ```

5. **Double Payment Prevention**
   ```javascript
   // Aynı usageId için çift ödeme kontrolü
   // ✅ Yapılıyor ama test et
   ```

### 🟡 Orta Öncelik

6. **Audit Logging**
   ```javascript
   // Tüm payment işlemlerini logla
   // Kim, ne zaman, ne yaptı
   ```

7. **Session Timeout Handling**
   ```javascript
   // Uzun süre bekleyen payment'ları iptal et
   // Kullanıcıyı bilgilendir
   ```

8. **Retry Mechanism**
   ```javascript
   // Network hatalarında retry
   // Exponential backoff
   ```

9. **Payment Status Reconciliation**
   ```javascript
   // Webhook gelmezse manuel kontrol
   // Cron job ile periyodik kontrol
   ```

### 🟢 Düşük Öncelik (İyileştirme)

10. **Email Notifications**
    ```javascript
    // Ödeme başarılı/başarısız email gönder
    // Receipt email
    ```

11. **Payment History**
    ```javascript
    // Kullanıcı ödeme geçmişini görebilmeli
    // ✅ myPayments endpoint var, frontend'e ekle
    ```

12. **Refund UI**
    ```javascript
    // Admin için refund interface
    // Kullanıcı için refund request
    ```

---

## 🧪 Test Checklist

### Stripe Test Kartları
- ✅ Başarılı: `4242 4242 4242 4242`
- ❌ Yetersiz bakiye: `4000 0000 0000 9995`
- ❌ Geçersiz numara: `4000 0000 0000 0002`
- ❌ Süresi dolmuş: `4000 0000 0000 0069`
- ❌ CVC hatalı: `4000 0000 0000 0127`
- 🔐 3DS gerektirir: `4000 0025 0000 3155`

### Test Senaryoları
- [ ] Stripe başarılı ödeme
- [ ] Stripe başarısız ödeme
- [ ] PayPal başarılı ödeme
- [ ] PayPal başarısız ödeme
- [ ] Payment method değiştirme
- [ ] Çift ödeme önleme
- [ ] Webhook testleri
- [ ] Error handling
- [ ] Mobile responsive
- [ ] Network timeout
- [ ] Session timeout

---

## 📚 Kaynaklar

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [PayPal Sandbox](https://developer.paypal.com/docs/api-basics/sandbox/)
- [PCI-DSS Compliance](https://www.pcisecuritystandards.org/)
- [GDPR Guidelines](https://gdpr.eu/)

---

## ✅ Sonuç

Payment sisteminiz temel güvenlik önlemlerini içeriyor ancak yukarıdaki testler ve iyileştirmeler yapılmalı. Özellikle:

1. **Amount validation** backend'de yapılmalı
2. **Rate limiting** eklenmeli
3. **Error handling** iyileştirilmeli
4. **Test senaryoları** tamamlanmalı
5. **GDPR uyumluluğu** için privacy policy eklenmeli

Bu dokümantasyonu takip ederek payment sisteminizi production'a hazır hale getirebilirsiniz.

