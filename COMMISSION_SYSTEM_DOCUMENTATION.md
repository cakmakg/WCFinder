# Komisyon ve Ödeme Dağıtım Sistemi Dokümantasyonu

## 📋 Genel Bakış

Bu sistem, kullanıcıların yaptığı ödemeleri platform ve işletmeler arasında otomatik olarak dağıtan bir komisyon sistemidir.

### Komisyon Yapısı

- **Toplam Ödeme:** 1.50€
- **Platform Komisyonu:** 0.50€ (sabit)
- **İşletme Payı:** 1.00€ (kalan tutar)

## 🏗️ Sistem Mimarisi

### Backend Yapısı

#### 1. **Payment Model** (`SERVER/src/models/payment.js`)
- `businessId`: Hangi işletmeye ait ödeme
- `platformFee`: Platform komisyonu (0.50€)
- `businessFee`: İşletme payı (1.00€)
- `payoutStatus`: Ödeme dağıtım durumu (`pending`, `processing`, `paid`, `failed`)
- `payoutId`: Ödeme dağıtım kaydı referansı

#### 2. **Business Model** (`SERVER/src/models/business.js`)
- `pendingBalance`: Bekleyen ödeme (henüz dağıtılmamış)
- `totalEarnings`: Toplam kazanç (tüm zamanlar)
- `totalPaidOut`: Toplam dağıtılan ödeme
- `bankAccount`: Banka hesap bilgileri (manuel ödeme için)
- `stripeAccountId`: Stripe Connect hesap ID (gelecekte otomatik ödeme için)

#### 3. **Payout Model** (`SERVER/src/models/payout.js`)
- İşletmelere yapılan ödeme dağıtımlarının kaydı
- Ödeme dönemi, tutar, durum, yöntem bilgileri

#### 4. **Payment Controller** (`SERVER/src/controller/payment.js`)
- `calculateFees()`: Komisyon hesaplama fonksiyonu
- Ödeme başarılı olduğunda:
  - Komisyon hesaplanır
  - Business `pendingBalance` ve `totalEarnings` güncellenir

#### 5. **BusinessPayout Controller** (`SERVER/src/controller/businessPayout.js`)

**Owner Endpoint'leri:**
- `GET /business-payouts/my-pending`: Bekleyen ödemeleri getir
- `GET /business-payouts/my-summary`: Finansal özet
- `GET /business-payouts/my-history`: Ödeme geçmişi

**Admin Endpoint'leri:**
- `GET /business-payouts/all-pending`: Tüm işletmelerin bekleyen ödemeleri
- `GET /business-payouts/monthly-summary`: Aylık özet
- `POST /business-payouts/create`: Ödeme dağıtımı oluştur
- `PATCH /business-payouts/:payoutId/complete`: Ödeme dağıtımını tamamla

### Frontend Yapısı

#### 1. **OwnerFinancialPanel** (`CLIENT/src/components/owner/OwnerFinancialPanel.jsx`)
- Bekleyen ödeme kartı
- Toplam kazanç kartı
- Toplam dağıtılan ödeme kartı
- Toplam ödeme sayısı kartı
- Bekleyen ödemeler tablosu
- Ödeme geçmişi tablosu

#### 2. **MyBookingsPage** (`CLIENT/src/pages/MyBookingsPage.jsx`)
- Owner için 4. tab: "Finanzen"
- OwnerFinancialPanel component'i entegre edildi

## 🔄 İş Akışı

### 1. Ödeme Süreci

```
Kullanıcı Ödeme Yapar (1.50€)
    ↓
Payment Controller - calculateFees()
    ↓
Platform: 0.50€ | İşletme: 1.00€
    ↓
Ödeme Başarılı (Stripe/PayPal Webhook)
    ↓
Business.pendingBalance += 1.00€
Business.totalEarnings += 1.00€
Payment.payoutStatus = 'pending'
```

### 2. Ödeme Dağıtım Süreci

```
Admin - Aylık Ödeme Dağıtımı
    ↓
GET /business-payouts/all-pending
    ↓
Her işletme için bekleyen ödemeleri görüntüle
    ↓
POST /business-payouts/create
    ↓
Payout kaydı oluştur
Payment.payoutStatus = 'processing'
Business.pendingBalance -= amount
Business.totalPaidOut += amount
    ↓
Manuel banka transferi yapılır
    ↓
PATCH /business-payouts/:payoutId/complete
    ↓
Payment.payoutStatus = 'paid'
Payout.status = 'completed'
```

## 📊 Veri Yapısı

### Payment Örneği
```json
{
  "_id": "...",
  "usageId": "...",
  "userId": "...",
  "businessId": "...",
  "amount": 1.50,
  "platformFee": 0.50,
  "businessFee": 1.00,
  "status": "succeeded",
  "payoutStatus": "pending",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Business Finansal Bilgileri
```json
{
  "_id": "...",
  "businessName": "City Park Hotel",
  "pendingBalance": 150.00,
  "totalEarnings": 500.00,
  "totalPaidOut": 350.00,
  "bankAccount": {
    "accountHolder": "City Park Hotel",
    "iban": "DE89370400440532013000",
    "bankName": "Deutsche Bank",
    "bic": "DEUTDEFF"
  }
}
```

### Payout Örneği
```json
{
  "_id": "...",
  "businessId": "...",
  "amount": 150.00,
  "currency": "EUR",
  "status": "completed",
  "paymentMethod": "bank_transfer",
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z"
  },
  "paymentCount": 150,
  "transactionReference": "TRX-2025-01-001",
  "completedAt": "2025-02-05T10:00:00Z"
}
```

## 🎯 Kullanım Senaryoları

### Senaryo 1: Kullanıcı Ödeme Yapar
1. Kullanıcı tuvalet rezervasyonu yapar
2. Ödeme sayfasında 1.50€ öder
3. Sistem otomatik olarak:
   - 0.50€ platform hesabına
   - 1.00€ işletmenin `pendingBalance`'ına eklenir

### Senaryo 2: Owner Finansal Bilgileri Görüntüler
1. Owner login olur
2. "My Bookings" → "Finanzen" tab'ına gider
3. Görüntülenen bilgiler:
   - Bekleyen ödeme: €150.00
   - Toplam kazanç: €500.00
   - Toplam dağıtılan: €350.00
   - Bekleyen ödemeler listesi
   - Ödeme geçmişi

### Senaryo 3: Admin Aylık Ödeme Dağıtımı
1. Admin login olur
2. `/business-payouts/all-pending` endpoint'ini çağırır
3. Tüm işletmelerin bekleyen ödemelerini görüntüler
4. Her işletme için ödeme dağıtımı oluşturur
5. Manuel banka transferi yapar
6. Ödeme dağıtımını "completed" olarak işaretler

## 🔐 Güvenlik

- Sadece owner kendi işletmesinin finansal bilgilerini görebilir
- Sadece admin ödeme dağıtımı yapabilir
- Tüm finansal işlemler loglanır
- Ödeme dağıtımı onay mekanizması (gelecekte)

## 🚀 Gelecek Geliştirmeler

1. **Stripe Connect Entegrasyonu**
   - Otomatik ödeme dağıtımı
   - İşletmelerin Stripe hesabına direkt ödeme

2. **Otomatik Aylık Ödeme**
   - Cron job ile otomatik ödeme dağıtımı
   - Email bildirimleri

3. **Gelişmiş Raporlama**
   - PDF rapor oluşturma
   - Excel export
   - Grafik ve analizler

4. **Çoklu Para Birimi Desteği**
   - EUR, USD, GBP vb.

5. **Komisyon Oranı Yönetimi**
   - Dinamik komisyon oranları
   - İşletme bazında özel oranlar

## 📝 Notlar

- Platform komisyonu şu anda sabit 0.50€
- Ödeme dağıtımı manuel yapılıyor (banka transferi)
- Tüm tutarlar EUR cinsinden
- Ödeme geçmişi sınırsız saklanıyor

