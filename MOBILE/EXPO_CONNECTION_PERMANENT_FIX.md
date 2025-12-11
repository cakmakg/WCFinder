# 🔧 Expo Go Bağlantı Hatası - Kalıcı Çözüm

## ❌ Sürekli Olan Hata
```
"there was a problem running the requested app."
"unknown error: the internet connection appears to be offline."
exp://192.168.178.23:8081
```

## 🔍 Neden Oluyor?

Bu hata şu sebeplerden olur:
1. **Firewall engelliyor** - Windows Firewall 8081 portunu engelliyor
2. **Farklı ağlar** - Telefon ve bilgisayar farklı WiFi ağlarında
3. **IP değişti** - Bilgisayarın IP adresi değişmiş
4. **Metro bundler durdu** - Metro bundler çalışmıyor
5. **Antivirus engelliyor** - Antivirus yazılımı engelliyor

## ✅ Kalıcı Çözüm: Tunnel Modu (Önerilen)

Tunnel modu her zaman çalışır, aynı ağda olmanız gerekmez:

### Adım 1: Metro Bundler'ı Durdurun
Terminal'de `Ctrl+C` ile durdurun

### Adım 2: Tunnel Modu ile Başlatın
```bash
cd mobile
npx expo start --tunnel
```

Bu komut:
- ✅ Her zaman çalışır (aynı ağ gerekmez)
- ✅ Firewall sorunlarını aşar
- ✅ Yeni bir QR kod oluşturur
- ⚠️ Biraz daha yavaş olabilir (ama çalışır!)

### Adım 3: Yeni QR Kodu Tarayın
Terminal'de yeni bir QR kod görünecek, onu tarayın.

## ✅ Alternatif Çözüm: Firewall Ayarları

Eğer tunnel modu kullanmak istemiyorsanız:

### Windows Firewall'u Ayarlayın

1. **Windows Settings** → **Update & Security** → **Windows Security**
2. **Firewall & network protection** tıklayın
3. **Allow an app through firewall** tıklayın
4. **Change settings** butonuna tıklayın (yönetici izni gerekir)
5. **Node.js** veya **npm** bulun
6. **Private** ve **Public** kutularını işaretleyin
7. **OK** tıklayın

### Port 8081'i Manuel Açın

1. **Windows Settings** → **Update & Security** → **Windows Security**
2. **Firewall & network protection** → **Advanced settings**
3. **Inbound Rules** → **New Rule**
4. **Port** seçin → **Next**
5. **TCP** seçin → **Specific local ports**: `8081` → **Next**
6. **Allow the connection** → **Next**
7. Tüm profilleri seçin → **Next**
8. İsim: "Expo Metro Bundler" → **Finish**

## ✅ Alternatif Çözüm: Aynı WiFi Ağı

1. **Bilgisayarınızın WiFi'sini kontrol edin:**
   - Hangi ağa bağlı? (örn: "Home-WiFi")

2. **Telefonunuzun WiFi'sini kontrol edin:**
   - Aynı ağa bağlı mı? (örn: "Home-WiFi")

3. **Farklıysa:**
   - Telefonu bilgisayarla aynı WiFi'ye bağlayın

## 🚀 Hızlı Çözüm (En Kolay)

**Tunnel modunu kullanın - her zaman çalışır:**

```bash
cd mobile
npx expo start --tunnel
```

## 📱 Test

1. Tunnel modunu başlatın
2. Yeni QR kodu görünecek
3. Expo Go ile QR kodu tarayın
4. Uygulama yüklenecek ✅

## ⚠️ Önemli Notlar

- **Tunnel modu:** En güvenilir, her zaman çalışır
- **LAN modu:** Daha hızlı ama aynı WiFi gerekir
- **Firewall:** Her zaman kontrol edin
- **Antivirus:** Bazen engelleyebilir, geçici olarak kapatmayı deneyin

## 🔄 Sürekli Oluyorsa

Eğer sürekli bu hatayı alıyorsanız:

1. **Tunnel modunu varsayılan yapın:**
   ```bash
   # package.json'a script ekleyin
   "start": "expo start --tunnel"
   ```

2. **Veya .env dosyası oluşturun:**
   ```bash
   # mobile/.env
   EXPO_USE_TUNNEL=true
   ```

## 💡 İpucu

Tunnel modu biraz yavaş olabilir ama **her zaman çalışır**. Development için ideal!

