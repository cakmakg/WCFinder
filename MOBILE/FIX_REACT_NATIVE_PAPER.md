# 🔧 React Native Paper Kurulum Düzeltmesi

## Sorun
`react-native-paper` paketi bulunamıyor hatası alındı.

## Çözüm

### 1. Paketleri Kurun
```bash
cd mobile
npm install
npx expo install react-native-paper react-native-vector-icons react-native-safe-area-context
```

### 2. Font Yapılandırması

React Native Paper, Material Design iconları için font gerektirir. `app/_layout.tsx` dosyasına font yükleme eklendi.

### 3. Metro Bundler'ı Yeniden Başlatın

Paketleri kurduktan sonra:
```bash
# Metro bundler'ı durdurun (Ctrl+C)
# Sonra tekrar başlatın
npm start -- --clear
```

### 4. Cache Temizleme

Eğer hala sorun varsa:
```bash
# Node modules ve cache temizle
rm -rf node_modules
npm install

# Expo cache temizle
npx expo start --clear
```

## Notlar

- `react-native-paper` Expo ile uyumlu versiyonu kullanılmalı
- `@expo/vector-icons` zaten projede var, ek kurulum gerekmez
- Fontlar otomatik yüklenir (`app/_layout.tsx` içinde)

## Kontrol

Paketlerin kurulduğunu kontrol edin:
```bash
npm list react-native-paper
```

Çıktı şöyle olmalı:
```
mobile@1.0.0
└── react-native-paper@5.12.3
```

