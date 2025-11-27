# WCFinder Client - React Frontend

Modern React uygulaması - Tuvalet bulma ve rezervasyon platformu için frontend.

## 🚀 Hızlı Başlangıç

### Kurulum

```bash
npm install
```

### Development

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

### Build

```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşturulur.

### Preview

```bash
npm run preview
```

Production build'i preview eder.

## 📁 Proje Yapısı

```
src/
├── components/       # Reusable React components
│   ├── business/    # İşletme ile ilgili component'ler
│   ├── bookings/    # Rezervasyon component'leri
│   ├── layout/      # Layout component'leri (AppBar, SideBar)
│   ├── map/         # Harita component'leri
│   ├── owner/       # İşletme sahibi panel component'leri
│   └── payment/     # Ödeme component'leri
├── pages/           # Sayfa component'leri
├── services/        # API servisleri
├── features/        # Redux slices
├── hooks/           # Custom React hooks
├── router/          # Routing configuration
└── utils/           # Yardımcı fonksiyonlar
```

## 🛠️ Teknoloji Stack

- **React** 19.1.1
- **Material-UI** 7.3.1
- **Redux Toolkit** 2.8.2
- **React Router** 7.8.2
- **Leaflet** 1.9.4 - Harita
- **Axios** 1.12.2 - HTTP client
- **Formik** 2.4.6 - Form yönetimi
- **Vite** 7.1.2 - Build tool

## ⚙️ Ortam Değişkenleri

`.env.local` dosyası oluşturun:

```env
VITE_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 📝 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint kontrolü

## 🔗 İlgili Dokümantasyon

- Ana dokümantasyon için root `README.md` dosyasına bakın
- Mimari için `docs/ARCHITECTURE.md` dosyasına bakın
- Deployment için `docs/DEPLOYMENT.md` dosyasına bakın
