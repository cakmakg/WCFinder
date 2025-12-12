# 🇩🇪 German Invoice System (Rechnung)

**Alman Fatura Sistemi - §14 UStG (2025), EN 16931, XRechnung 3.0 Uyumlu**

Modern, yasal gerekliliklere tam uyumlu bir fatura sistemi. React frontend ve Node.js/Express backend ile geliştirilmiştir.

---

## ✅ Yasal Uyumluluk (Gesetzliche Konformität)

### §14 UStG - Pflichtangaben (Zorunlu Bilgiler)

| Alan | Açıklama | Durum |
|------|----------|-------|
| Satıcı adı ve adresi | Vollständiger Name und Anschrift des leistenden Unternehmers | ✅ |
| Alıcı adı ve adresi | Vollständiger Name und Anschrift des Leistungsempfängers | ✅ |
| Vergi numarası veya USt-IdNr | Steuernummer oder USt-IdNr. des leistenden Unternehmers | ✅ |
| Fatura numarası | Fortlaufende, einmalige Rechnungsnummer | ✅ |
| Fatura tarihi | Ausstellungsdatum der Rechnung | ✅ |
| Hizmet tarihi | Zeitpunkt der Lieferung oder Leistung | ✅ |
| Ürün/hizmet açıklaması | Menge und Art der gelieferten Gegenstände | ✅ |
| Net tutar | Nettobetrag | ✅ |
| Vergi oranı ve tutarı | Steuersatz und Steuerbetrag | ✅ |
| §19 UStG referansı | Hinweis bei Kleinunternehmerregelung | ✅ |

### EN 16931 / XRechnung 3.0

- ✅ Cross-Industry Invoice (CII) XML formatı
- ✅ Tüm zorunlu BT (Business Term) alanları
- ✅ SEPA ödeme bilgileri
- ✅ UN/ECE Recommendation 20 birim kodları
- ✅ B2G Leitweg-ID desteği
- ✅ XRechnung XML export
- ✅ Temel validasyon

### GoBD Uyumluluğu

- ✅ Değiştirilemez audit log
- ✅ Fatura silme yasağı (sadece entwurf silinebilir, diğerleri storniert)
- ✅ 10 yıl arşivleme desteği
- ✅ Zaman damgalı tüm işlemler
- ✅ SHA-256 hash ile bütünlük kontrolü

---

## 🗂 Proje Yapısı

```
WCFinder/
├── SERVER/
│   ├── src/
│   │   ├── models/
│   │   │   └── rechnung.js         # Alman yasalarına uygun Rechnung modeli
│   │   ├── services/
│   │   │   ├── rechnungService.js  # Fatura oluşturma, PDF, Email
│   │   │   └── xrechnungService.js # XRechnung XML generator (EN 16931)
│   │   ├── controller/
│   │   │   └── rechnung.js         # API endpoint'leri
│   │   └── routes/
│   │       └── rechnung.js         # Route tanımları
│   └── public/
│       └── rechnungen/
│           └── xrechnung/          # XRechnung XML dosyaları
├── CLIENT/
│   └── src/
│       └── features/
│           └── admin/
│               ├── components/
│               │   └── invoices/
│               │       ├── InvoicesPage.jsx
│               │       ├── InvoiceCreateDialog.jsx
│               │       └── InvoiceDetailDialog.jsx
│               └── services/
│                   └── invoiceService.js
└── RECHNUNG_SYSTEM_COMPLETE.md
```

---

## 🔌 API Endpoints

### Base URL: `/rechnungen`

| Method | Endpoint | Açıklama | Yetki |
|--------|----------|----------|-------|
| GET | `/` | Rechnung listesi | Admin, Owner |
| GET | `/statistics` | İstatistikler | Admin |
| GET | `/unit-codes` | UN/ECE Rec 20 birim kodları | Login |
| POST | `/create-for-payout` | Payout için Rechnung oluştur | Admin |
| GET | `/:id` | Rechnung detayı | Admin, Owner |
| GET | `/:id/download` | PDF indir | Admin, Owner |
| GET | `/:id/xrechnung` | XRechnung XML indir (EN 16931) | Admin, Owner |
| GET | `/:id/validate` | XRechnung validasyonu | Admin |
| GET | `/:id/audit-log` | GoBD Audit Log | Admin |
| PATCH | `/:id/status` | Durum güncelle | Admin |
| POST | `/:id/storno` | Storno (Gutschrift) oluştur | Admin |
| POST | `/:id/resend-email` | Email yeniden gönder | Admin |
| POST | `/:id/regenerate-pdf` | PDF yeniden oluştur | Admin |
| POST | `/:id/regenerate-xrechnung` | XRechnung XML yeniden oluştur | Admin |
| DELETE | `/:id` | Sil (sadece entwurf) | Admin |

---

## 📝 Kullanım Örnekleri

### 1. Payout için Rechnung Oluştur

```bash
POST /rechnungen/create-for-payout
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "payoutId": "6915098dbbfa1f78d71d217a",
  "kleinunternehmer": false
}
```

**Response:**
```json
{
  "error": false,
  "result": {
    "_id": "...",
    "rechnungsnummer": "RE-2025-01-00001",
    "rechnungsdatum": "2025-01-15T10:00:00Z",
    "summen": {
      "nettobetrag": 100.00,
      "mehrwertsteuer": {
        "satz": 19,
        "betrag": 19.00
      },
      "bruttobetrag": 119.00
    },
    "pdfPfad": "/rechnungen/RE-2025-01-00001.pdf",
    "xrechnungPfad": "/rechnungen/xrechnung/RE-2025-01-00001_xrechnung.xml",
    "status": "versendet"
  },
  "message": "Rechnung erfolgreich erstellt und versendet"
}
```

### 2. XRechnung XML İndir

```bash
GET /rechnungen/{rechnungId}/xrechnung
Authorization: Bearer {token}
```

### 3. Storno (Gutschrift) Oluştur

```bash
POST /rechnungen/{rechnungId}/storno
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "grund": "Fehlerhafte Rechnungsstellung"
}
```

### 4. Audit Log Getir (GoBD)

```bash
GET /rechnungen/{rechnungId}/audit-log
Authorization: Bearer {admin_token}
```

---

## 🔧 Birim Kodları (UN/ECE Rec 20)

| Kod | Almanca | İngilizce |
|-----|---------|-----------|
| H87 | Stück | Piece |
| HUR | Stunde | Hour |
| DAY | Tag | Day |
| MON | Monat | Month |
| KGM | Kilogramm | Kilogram |
| MTR | Meter | Metre |
| LTR | Liter | Litre |
| C62 | Einheit | Unit |

---

## 📄 XRechnung XML Örneği

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice 
  xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  
  <rsm:ExchangedDocument>
    <ram:ID>RE-2025-01-00001</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">20250115</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  
  <!-- ... SupplyChainTradeTransaction ... -->
</rsm:CrossIndustryInvoice>
```

---

## 📋 E-Rechnung Zaman Çizelgesi (2025-2028)

| Tarih | Gereklilik |
|-------|------------|
| **01.01.2025** | Tüm firmalar e-fatura **alabilmeli** |
| **31.12.2026** | Kağıt/PDF fatura geçiş süresi sonu |
| **01.01.2027** | >€800.000 ciro için e-fatura **zorunlu** |
| **01.01.2028** | **Tüm B2B** işlemler için e-fatura zorunlu |

---

## 🔄 İş Akışı

```
1. Admin → Payout oluştur (status: 'pending')
   ↓
2. Admin → Manuel banka transferi yapar
   ↓
3. Admin → Payout'u 'completed' yapar
   ↓
4. Admin → POST /rechnungen/create-for-payout
   ↓
5. Sistem:
   - Rechnung oluşturur (Audit Log)
   - PDF generate eder (§14 UStG konform)
   - XRechnung XML oluşturur (EN 16931)
   - Email gönderir
   - Payout ile ilişkilendirir
   ↓
6. Owner → Dashboard'da Rechnung'ı görür
   ↓
7. Owner → PDF veya XRechnung XML indirebilir
```

---

## 🔒 Güvenlik ve Uyumluluk

### Güvenlik
- Helmet.js ile HTTP güvenlik başlıkları
- Rate limiting (15 dakikada 100 istek)
- CORS yapılandırması
- Input validasyonu
- Yetkilendirme kontrolleri (Admin, Owner)

### GoBD Uyumluluğu
- **Audit Log**: Tüm değişiklikler kaydedilir
- **Unveränderbarkeit**: Gönderilen faturalar silinemez
- **Storno**: Faturalar sadece iptal edilebilir (Gutschrift)
- **Hash**: SHA-256 ile bütünlük kontrolü
- **Archivierung**: 10 yıllık saklama süresi

---

## ⚠️ ÖNEMLİ: Gerçek Verileri Güncelleyin!

`SERVER/src/models/rechnung.js` dosyasında şu değerleri güncelleyin:

```javascript
leistender: {
    firmenname: 'WCFinder GmbH',        // ← GERÇEK FİRMA ADI
    strasse: 'Musterstraße 123',        // ← GERÇEK ADRES
    plz: '53111',                       // ← GERÇEK PLZ
    ort: 'Bonn',                        // ← GERÇEK ŞEHİR
    steuernummer: '123/456/78901',      // ← GERÇEK STEUERNUMMER
    ustIdNr: 'DE123456789',             // ← GERÇEK UST-IDNR
    geschaeftsfuehrer: 'Max Mustermann', // ← GERÇEK AD
    registergericht: 'Amtsgericht Bonn',
    handelsregister: 'HRB 12345',       // ← GERÇEK HRB
}

zahlungsbedingungen: {
    bankverbindung: {
        bankname: 'Sparkasse Bonn',
        iban: 'DE89 3701 0050 0000 0000 00',  // ← GERÇEK IBAN
        bic: 'PBNKDEFF',                       // ← GERÇEK BIC
        kontoinhaber: 'WCFinder GmbH'
    }
}
```

---

## 📦 Paket Kurulumu

```bash
cd SERVER
npm install pdfkit express-validator
```

---

## ✅ Test Checklist

- [x] Paketler yüklendi mi? (`pdfkit`)
- [x] `public/rechnungen/` klasörü oluşturuldu mu?
- [x] `public/rechnungen/xrechnung/` klasörü oluşturuldu mu?
- [x] Route'lar çalışıyor mu? (`/rechnungen`)
- [x] Model doğru mu? (`rechnung.js`)
- [x] Service çalışıyor mu? (`rechnungService.js`)
- [x] XRechnung Service çalışıyor mu? (`xrechnungService.js`)
- [x] PDF oluşturuluyor mu?
- [x] XRechnung XML oluşturuluyor mu?
- [x] Email gönderiliyor mu?
- [ ] Gerçek firma verileri güncellendi mi?
- [ ] KOSIT Validator ile XRechnung doğrulandı mı?

---

## 📚 Kaynaklar

- [§14 UStG - Ausstellung von Rechnungen](https://www.gesetze-im-internet.de/ustg_1980/__14.html)
- [§19 UStG - Kleinunternehmerregelung](https://www.gesetze-im-internet.de/ustg_1980/__19.html)
- [XRechnung Standard](https://xeinkauf.de/xrechnung/)
- [EN 16931 European e-Invoice Standard](https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/EN+16931)
- [ZUGFeRD](https://www.ferd-net.de/)
- [GoBD](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Weitere_Steuerthemen/Abgabenordnung/2019-11-28-GoBD.html)
- [KOSIT XRechnung Validator](https://github.com/itplr-kosit/validator)
- [UN/ECE Recommendation 20](https://unece.org/trade/documents/2021/06/uncefact-rec20-0)

---

## 📝 Lisans

MIT License

---

**Not:** Bu yazılım bilgilendirme amaçlıdır ve yasal danışmanlık yerine geçmez. Vergi ve hukuki konularda bir uzmanla görüşmenizi öneririz.

**Sistem hazır! 🎉**
