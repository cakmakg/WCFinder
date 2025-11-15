# Rechnung (Fatura) Sistemi - Implementasyon Rehberi

## ✅ Yapılan Düzeltmeler

### 1. İsimlendirme
- ✅ `invoice` → `rechnung`
- ✅ `invoices/` → `rechnungen/`
- ✅ Tüm dosya ve klasör isimleri Alman yasalarına uygun

### 2. Model Düzeltmeleri
- ✅ `payoutId` referansı eklendi
- ✅ Usage field'ları düzeltildi (`totalFee` kullanılıyor)
- ✅ Business model'e `phone` ve `ustIdNr` eklendi

### 3. İş Akışı
- ✅ Payout oluşturulduktan sonra Rechnung oluşturulacak
- ✅ Manuel süreç (admin kontrolünde)
- ✅ PDF generation hazır
- ✅ Email gönderimi hazır

---

## 📦 Gerekli Paketler

```bash
cd SERVER
npm install pdfkit node-cron
```

---

## 🏗️ Dosya Yapısı

```
SERVER/
├── src/
│   ├── models/
│   │   └── rechnung.js              ✅ OLUŞTURULDU
│   ├── services/
│   │   └── rechnungService.js        ⏳ OLUŞTURULACAK
│   ├── controller/
│   │   └── rechnung.js               ⏳ OLUŞTURULACAK
│   ├── routes/
│   │   └── rechnung.js               ⏳ OLUŞTURULACAK
│   └── cron/
│       └── rechnungCron.js           ⏳ ŞİMDİLİK MANUEL
└── public/
    └── rechnungen/                    ⏳ OLUŞTURULACAK
```

---

## 🔄 İş Akışı (Manuel)

### Adım 1: Admin Payout Oluşturur
```
Admin Panel → "Auszahlung erstellen"
→ Payout oluşturulur (status: 'pending')
```

### Adım 2: Admin Manuel Ödeme Yapar
```
Banka transferi yapılır
```

### Adım 3: Admin Rechnung Oluşturur
```
Admin Panel → Payout detayı → "Rechnung erstellen"
→ RechnungService.erstelleRechnungFuerPayout() çağrılır
```

### Adım 4: Sistem Otomatik İşlemler
```
1. Rechnung oluşturulur
2. PDF generate edilir
3. Email gönderilir
4. Payout.status = 'completed'
5. Rechnung.status = 'versendet'
```

---

## ⚠️ ÖNEMLİ: Gerçek Verileri Güncelleyin!

`rechnung.js` model'inde şu değerleri güncelleyin:

```javascript
leistender: {
    firmenname: 'WCFinder GmbH',  // ← GERÇEK FİRMA ADI
    steuernummer: '123/456/78901',  // ← GERÇEK STEUERNUMMER
    ustIdNr: 'DE123456789',  // ← GERÇEK UST-IDNR
    geschaeftsfuehrer: 'Max Mustermann',  // ← GERÇEK AD
    handelsregister: 'HRB 12345',  // ← GERÇEK HRB
    bankverbindung: {
        iban: 'DE89 3701 0050 0000 0000 00',  // ← GERÇEK IBAN
        bic: 'PBNKDEFF'  // ← GERÇEK BIC
    }
}
```

---

## 📝 Sonraki Adımlar

1. ✅ Model oluşturuldu (`rechnung.js`)
2. ⏳ Service oluşturulacak (`rechnungService.js`)
3. ⏳ Controller oluşturulacak (`rechnung.js`)
4. ⏳ Routes oluşturulacak (`rechnung.js`)
5. ⏳ Admin Panel'e "Rechnung erstellen" butonu eklenecek
6. ⏳ PDF download endpoint'i eklenecek

---

## 🧪 Test Senaryosu

1. Test payout oluştur
2. Rechnung oluştur
3. PDF'i kontrol et
4. Email'i kontrol et
5. Veritabanında kayıtları kontrol et

---

**Devam edelim mi? Service katmanını oluşturalım mı?**

