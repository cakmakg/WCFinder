# Gerekli Paketlerin Kurulumu

## 📦 Yüklenecek Paketler

```bash
cd SERVER
npm install pdfkit node-cron
```

## ✅ Kurulum Sonrası

1. Paketler yüklendikten sonra server'ı yeniden başlatın
2. `public/rechnungen/` klasörü oluşturuldu (PDF'ler burada saklanacak)
3. Route'lar hazır: `/rechnungen`

## 🧪 Test

1. Admin olarak login olun
2. Bir payout oluşturun
3. Payout'u "completed" yapın
4. `POST /rechnungen/create-for-payout` endpoint'ini çağırın
5. PDF oluşturulacak ve email gönderilecek

## 📝 Notlar

- PDF'ler `SERVER/public/rechnungen/` klasöründe saklanır
- Static file serving: `/public/rechnungen/RE-2024-11-00001.pdf`
- Email gönderimi için `sendMail.js` helper'ını yapılandırın

