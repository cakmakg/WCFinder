# Stripe Test Kartları

## Mastercard Test Kartları

### ✅ Başarılı Ödemeler

1. **Mastercard - Başarılı**
   - Kart Numarası: `5555 5555 5555 4444`
   - CVC: Herhangi bir 3 haneli sayı (örn: `123`)
   - Son Kullanma: Gelecek bir tarih (örn: `12/25`)
   - Kart Sahibi: Herhangi bir isim

2. **Mastercard - Başarılı (Debit)**
   - Kart Numarası: `5200 8282 8282 8210`
   - CVC: Herhangi bir 3 haneli sayı (örn: `123`)
   - Son Kullanma: Gelecek bir tarih (örn: `12/25`)
   - Kart Sahibi: Herhangi bir isim

### 🔐 3D Secure Gerektiren Kartlar

3. **Mastercard - 3D Secure Authentication Required**
   - Kart Numarası: `4000 0025 0000 3155`
   - CVC: Herhangi bir 3 haneli sayı (örn: `123`)
   - Son Kullanma: Gelecek bir tarih (örn: `12/25`)
   - Kart Sahibi: Herhangi bir isim
   - **Not**: Bu kart kullanıldığında Stripe otomatik olarak 3D Secure modal'ı açacaktır.

### ❌ Hata Senaryoları (Her Zaman Reddedilir)

4. **Mastercard - Generic Decline**
   - Kart Numarası: `4000 0000 0000 0002`
   - **Sonuç**: Her zaman reddedilir

5. **Mastercard - Insufficient Funds**
   - Kart Numarası: `4000 0000 0000 9995`
   - **Sonuç**: Yetersiz bakiye hatası

6. **Mastercard - Expired Card**
   - Kart Numarası: `4000 0000 0000 0069`
   - **Sonuç**: Kartın süresi dolmuş hatası

## Visa Test Kartları

### ✅ Başarılı Ödemeler

1. **Visa - Başarılı**
   - Kart Numarası: `4242 4242 4242 4242`
   - CVC: Herhangi bir 3 haneli sayı (örn: `123`)
   - Son Kullanma: Gelecek bir tarih (örn: `12/25`)
   - Kart Sahibi: Herhangi bir isim

2. **Visa - Başarılı (Debit)**
   - Kart Numarası: `4000 0566 5566 5556`
   - CVC: Herhangi bir 3 haneli sayı (örn: `123`)
   - Son Kullanma: Gelecek bir tarih (örn: `12/25`)
   - Kart Sahibi: Herhangi bir isim

## Test Senaryoları

### Senaryo 1: Başarılı Ödeme
- **Kart**: `5555 5555 5555 4444` (Mastercard) veya `4242 4242 4242 4242` (Visa)
- **Beklenen Sonuç**: Ödeme başarılı, kullanıcı success sayfasına yönlendirilir

### Senaryo 2: 3D Secure Authentication
- **Kart**: `4000 0025 0000 3155`
- **Beklenen Sonuç**: 3D Secure modal açılır, kullanıcı authentication yapar, ödeme başarılı

### Senaryo 3: Kart Reddedildi
- **Kart**: `4000 0000 0000 0002`
- **Beklenen Sonuç**: "Ihre Karte wurde abgelehnt" hatası gösterilir

### Senaryo 4: Yetersiz Bakiye
- **Kart**: `4000 0000 0000 9995`
- **Beklenen Sonuç**: "Unzureichende Mittel auf Ihrer Karte" hatası gösterilir

## Önemli Notlar

1. **Test Modu**: Tüm bu kartlar sadece Stripe test modunda çalışır (`pk_test_...` ve `sk_test_...`)

2. **Gerçek Para**: Test kartları ile gerçek para çekilmez, sadece test işlemi yapılır

3. **3D Secure**: 3D Secure gerektiren kartlar için Stripe otomatik olarak authentication modal'ı açar

4. **CVC ve Son Kullanma**: Test kartları için herhangi bir geçerli CVC ve gelecek bir tarih kullanılabilir

5. **Kart Sahibi**: Test kartları için herhangi bir isim kullanılabilir

## Güvenlik

- ✅ Test kartları sadece test modunda çalışır
- ✅ Production'da gerçek kartlar kullanılır
- ✅ Test kartları ile gerçek para çekilmez
- ✅ Tüm ödeme işlemleri Stripe tarafından şifrelenir (HTTPS)

