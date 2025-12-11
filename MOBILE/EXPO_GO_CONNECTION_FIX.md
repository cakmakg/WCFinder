# 🔧 Expo Go Bağlantı Hatası - Çözüm

## ❌ Hata
```
"there was a problem running the requested app."
"unknown error: the internet connection appears to be offline."
exp://192.168.178.23:8081
```

## ✅ Çözümler

### Yöntem 1: Tunnel Modu (Önerilen - En Kolay)

Tunnel modu, telefon ve bilgisayarın aynı WiFi'de olmasını gerektirmez:

```bash
cd mobile
npx expo start --tunnel
```

Bu komut:
- ngrok benzeri bir tunnel oluşturur
- Telefon ve bilgisayar farklı ağlarda olsa bile çalışır
- Yeni bir QR kod oluşturur
- Biraz daha yavaş olabilir ama her zaman çalışır

### Yöntem 2: Aynı WiFi Ağında Olun

1. **Bilgisayarınızın WiFi'sini kontrol edin:**
   - Windows: Settings → Network & Internet → WiFi
   - Hangi ağa bağlı olduğunu not edin

2. **Telefonunuzun WiFi'sini kontrol edin:**
   - Settings → WiFi
   - Bilgisayarla aynı ağa bağlı olduğundan emin olun

3. **Metro bundler'ı yeniden başlatın:**
   ```bash
   cd mobile
   npm start -- --clear
   ```

### Yöntem 3: Firewall Ayarları

Windows Firewall 8081 portunu engelliyor olabilir:

1. **Windows Defender Firewall'u kontrol edin:**
   - Windows Settings → Update & Security → Windows Security
   - Firewall & network protection
   - "Allow an app through firewall" tıklayın
   - Node.js veya npm'i bulun ve "Private" ve "Public" işaretleyin

2. **Veya geçici olarak firewall'u kapatın (sadece test için):**
   - Windows Settings → Update & Security → Windows Security
   - Firewall & network protection
   - "Private network" → Firewall'u kapat

### Yöntem 4: IP Adresini Manuel Kontrol

1. **Bilgisayarınızın IP adresini bulun:**
   ```bash
   ipconfig
   ```
   - "IPv4 Address" satırını bulun (örn: 192.168.1.100)

2. **Metro bundler'ı bu IP ile başlatın:**
   ```bash
   cd mobile
   EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start
   ```

### Yöntem 5: USB ile Bağlantı (Android)

Android telefonunuz varsa USB ile bağlayabilirsiniz:

1. **USB Debugging'i açın:**
   - Settings → About phone → Build number'a 7 kez tıklayın
   - Settings → Developer options → USB debugging açın

2. **USB ile bağlayın:**
   ```bash
   cd mobile
   npx expo start --android
   ```

## 🚀 Hızlı Çözüm (En Kolay)

**Tunnel modunu kullanın:**

```bash
cd mobile
npx expo start --tunnel
```

Bu her zaman çalışır! ✅

## 📱 Test

1. Tunnel modunu başlatın
2. Yeni QR kodu görünecek
3. Expo Go ile QR kodu tarayın
4. Uygulama yüklenecek

## ⚠️ Notlar

- **Tunnel modu:** Biraz daha yavaş ama her zaman çalışır
- **LAN modu:** Daha hızlı ama aynı WiFi gerekir
- **USB:** En hızlı ama sadece Android için

## 🔍 Sorun Devam Ederse

1. Metro bundler'ı durdurun (Ctrl+C)
2. Cache'i temizleyin: `npm start -- --clear`
3. Tunnel modunu kullanın: `npx expo start --tunnel`

