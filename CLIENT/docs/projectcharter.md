# WCFinder Proje Sözleşmesi (Project Charter)

**Versiyon**: 1.0  
**Tarih**: Eylül 2025  
**Durum**: Aktif  
**Son Güncelleme**: Eylül 2025

---

## 1. Proje Tanımı

### 1.1 Proje Adı
**WCFinder** - Tuvaletler Bulma ve Rezervasyon Platformu

### 1.2 Proje Açıklaması
WCFinder, modern mobil-first web uygulaması olarak kullanıcıların yakındaki tuvaletleri bulmasını, değerlendirmesini ve önceden rezervasyon yapmasını sağlayan entegre bir platform. Platform, işletme sahiplerine tuvaletlerini listelemek ve yönetmek için araçlar sunarken, son kullanıcılara kolay erişilebilir tuvaletler bulma imkanı tanır.

### 1.3 Proje Kapsamı
- **Coğrafi Alan**: Başlangıç olarak Bonn, Almanya (pilot bölge)
- **Hedef Kullanıcı**: Şehirde çalışanlar, turist, seyahat edenler
- **Hedef İşletmeler**: Kafeler, restoranlar, otelller, alışveriş merkezleri

---

## 2. Proje Hedefleri

### 2.1 Stratejik Hedefler

| Hedef | Açıklama | Başarı Ölçütü |
|-------|----------|-----------------|
| **Erişim Kolaylığı** | Kullanıcılar 2 dakikada tuvaletleri bulabilir | Ortalama arama süresi < 2 dakika |
| **İşletme Katılımı** | 50+ işletmeyi platform'a katmak | İlk 3 ayda 50 işletme kaydı |
| **Ödeme Sistemi** | Güvenli ve hızlı ödeme | Ödeme başarı oranı > 95% |
| **Kullanıcı Memnuniyeti** | Yüksek kullanıcı deneyimi | Net Promoter Score (NPS) > 50 |
| **Veri Güvenliği** | Kullanıcı verilerini koruma | %100 GDPR uyumluluğu |

### 2.2 İşletme Hedefleri

1. **Gelir Yaratma**: Ödeme işlem ücretlerinden %10-15% komisyon
2. **Pazara Giriş**: Aylık 10,000+ aktif kullanıcıya ulaşmak
3. **Marka Oluşturma**: Bonn'da "tuvalet bulma" konusunda lider konuma gelmek
4. **Ölçeklenebilirlik**: Platform'u diğer şehirlere genişleme imkanı

### 2.3 Teknik Hedefler

1. **Performans**: Sayfa yükleme süresi < 2 saniye
2. **Kullanılabilirlik**: Mobile-first responsive design
3. **Skalabilite**: 100,000+ eşzamanlı kullanıcı desteklemek
4. **Güvenlik**: SSL/TLS şifreleme, JWT token doğrulama

---

## 3. Proje Paydaşları (Stakeholders)

### 3.1 Birincil Paydaşlar

| Paydaş | Rol | Beklentiler |
|--------|-----|-------------|
| **Son Kullanıcılar** | Platform kullanıcıları | Kolay tuvaletler bulma, güvenli rezervasyon, temiz tuvaletler |
| **İşletme Sahipleri** | Tuvaletlerini listeleyenler | Gelir, müşteri trafiği, yönetim araçları |
| **Proje Müdürü** | Koordinasyon ve denetim | Zamanında teslim, bütçe kontrolü |
| **Geliştirici Takımı** | Teknik implementasyon | Açık gereksinimler, kaynak desteği |

### 3.2 İkincil Paydaşlar

- Stripe (Ödeme sağlayıcı)
- MongoDB Atlas (Veritabanı)
- AWS/Heroku (Hosting)
- Yasal danışmanlar (GDPR uyumluluğu)
- Pazarlama takımı

---

## 4. Proje Bütçesi

### 4.1 Toplam Bütçe
**Tahmini Toplam Proje Maliyeti: €45,000**

### 4.2 Bütçe Dağılımı

| Kategori | Tutar | Yüzde | Açıklama |
|----------|-------|-------|----------|
| **Geliştirme (3 developer)** | €24,000 | 53% | 3 ay, tam zamanlı |
| **UI/UX Tasarım** | €6,000 | 13% | Wireframes, mockups, prototipler |
| **Testing & QA** | €4,000 | 9% | Otomatik ve manuel testler |
| **Infrastructure** | €3,000 | 7% | Hosting, domain, SSL sertifikaları |
| **Pazarlama & Yasal** | €5,000 | 11% | GDPR uyumluluğu, pilot pazarlama |
| **Buffer (10%)** | €3,000 | 7% | Beklenmeyen maliyetler |

### 4.3 Finansman Kaynakları
- Şirket sermayesi: €45,000

---

## 5. Proje Zaman Çizelgesi

### 5.1 Proje Aşamaları

```
Başlangıç: 1 Eylül 2025
Bitiş: 30 Kasım 2025 (12 hafta)
```

### 5.2 Temel Taşlar (Milestones)

| Dönem | Açıklama | Hedef Tarih | Açıklama |
|-------|----------|-------------|----------|
| **Faz 1** | Gereksinimler & Tasarım | 15 Eylül 2025 | Detaylı gereksinimler, UI tasarımı tamamlanır |
| **Faz 2** | Backend Geliştirme | 30 Eylül 2025 | API endpoints, veritabanı, kimlik doğrulama |
| **Faz 3** | Frontend Geliştirme | 31 Ekim 2025 | React UI, harita, rezervasyon sistemi |
| **Faz 4** | Entegrasyon & Testing | 15 Kasım 2025 | Sistem testi, entegrasyon testi, bug fix |
| **Faz 5** | Pilot & Launch | 30 Kasım 2025 | Beta testi, 50 işletmeyle pilot, resmi açılış |

### 5.3 Sprint Planlaması
- **Sprint Süresi**: 2 hafta
- **Sprint Sayısı**: 6 sprint
- **Daily Standup**: Her gün 10:00 CET
- **Sprint Review**: Her 2 haftanın sonunda

---

## 6. Riskler ve Azaltma Stratejileri

### 6.1 Risk Matrisi

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|-------------------|
| **Scope Creep** | Yüksek | Yüksek | Gereksinimler freeze, change control prosesi |
| **İşletme Katılım Eksikliği** | Orta | Yüksek | Pilot işletmeler ile early engagement |
| **Teknik Zorluklar (Harita API)** | Orta | Orta | PoC (Proof of Concept) hazırlama |
| **Ödeme Entegrasyonu Sorunları** | Düşük | Yüksek | Stripe sandbox testing, early testing |
| **Veri Tabanı Performansı** | Düşük | Orta | Load testing, database optimization |
| **Personel Devir** | Düşük | Orta | Dokümantasyon, bilgi paylaşımı |

### 6.2 Risk Yönetimi Planı
- Haftada bir risk review toplantısı
- Risk log takip ve güncelleme
- Eğer bir risk gerçekleşirse, acil kontrol mekanizmaları

---

## 7. Başarı Kriterleri

### 7.1 Fonksiyonel Başarı

- [ ] Tüm MUST-HAVE özellikleri uygulanmış ve test edilmiş
- [ ] API endpoints %100 çalışıyor
- [ ] Ödeme sistemi sağlam ve test edilmiş
- [ ] Harita entegrasyonu çalışır
- [ ] QR kod sistemi çalışır

### 7.2 Performans Başarı

- [ ] Sayfa yükleme süresi < 2 saniye (desktop ve mobile)
- [ ] API response süresi < 500ms
- [ ] %99,5 sistem uptime
- [ ] Ödeme başarı oranı > 95%

### 7.3 Kalite Başarı

- [ ] Code review: %100 coverage
- [ ] Unit test coverage: > 80%
- [ ] Bug count (critical): 0, (high): < 5
- [ ] User acceptance test: Geçti

### 7.4 İşletme Başarı

- [ ] 50+ işletme platform'a katıldı
- [ ] 10,000+ aktif kullanıcı
- [ ] NPS puanı > 50
- [ ] İlk ödeme işlemleri başarıyla tamamlandı

---

## 8. Dış Bağımlılıklar

### 8.1 Teknolojik Bağımlılıklar

- **Stripe API** - Ödeme işlemleri için
- **OpenStreetMap/Mapbox** - Harita servisleri
- **MongoDB Atlas** - Veritabanı servisi
- **AWS/Heroku** - Hosting

### 8.2 Yasal/Düzenleyici Bağımlılıklar

- **GDPR** - Avrupa veri koruma düzenlemesi
- **PSD2** - Ödeme Hizmeti Direktifi
- **Yerel Vergi Kanunları** - Bonn/Almanya

### 8.3 Dış Kaynak Gereksinimleri

- GDPR avukatı (1 kişi, part-time)
- Ödeme sistem uzmanı (danışman)
- Pazarlama ajanı (3 işletme başına 1 saat)

---

## 9. Proje Yönetim Yaklaşımı

### 9.1 Metodoloji
**Agile Scrum**
- 2 haftalık sprint döngüsü
- Daily standup
- Sprint planning, review, retrospective

### 9.2 İletişim Planı

| Paydaş | Sıklık | Format | Sorumlu |
|--------|--------|--------|----------|
| Geliştirici Takımı | Günlük | Standup | Scrum Master |
| Proje Sponsor | Haftalık | Report | Proje Müdürü |
| İşletme Paydaşları | Bi-haftalık | Sprint Review | Product Owner |
| Müşteriler | Aylık | Newsletter | Pazarlama |

### 9.3 Kalite Güvence

- **Code Review**: Her PR için 2 reviewer
- **Testing**: Unit, Integration, E2E tests
- **Security**: OWASP Top 10 uyumluluğu
- **Performance**: Regular load testing

---

## 10. Otorite ve Karar Alma

### 10.1 Proje Yönetim Hiyerarşisi

```
Proje Sponsor (Üst Yönetim)
    ↓
Proje Müdürü
    ├── Product Owner
    ├── Scrum Master
    ├── Technical Lead (Backend)
    ├── Technical Lead (Frontend)
    └── QA Lead
```

### 10.2 Karar Alma Otoritesi

| Konu | Otorite | Dönem |
|------|---------|-------|
| Scope değişiklikleri | Proje Müdürü + Sponsor | 24 saat |
| Budget sapması (> 10%) | Sponsor | İlk fırsat |
| Timeline değişiklikleri | Proje Müdürü | 48 saat |
| Teknik kararlar | Technical Lead | 4 saat |
| Bug priority | QA Lead + Product Owner | 2 saat |

---

## 11. Proje Sonlandırma Kriterleri

### 11.1 Başarılı Sonlandırma Koşulları

- [ ] Tüm MUST-HAVE özellikler tamamlandı
- [ ] Tüm kritik/yüksek öncelikli hatalar çözüldü
- [ ] Tüm testler geçti
- [ ] Kullanıcı kabul testi (UAT) tamamlandı
- [ ] Dokümantasyon tamamlandı
- [ ] Üretim ortamı hazırlandı ve test edildi
- [ ] Kullanıcı eğitimi tamamlandı

### 11.2 Proje Kapatma Prosesi

1. **Sonlandırma Raporu**: Başarı kriterleri vs. gerçek sonuçlar
2. **Öğrenilecek Dersler**: Neler iyi gitti, neler geliştirilebilir
3. **Arşivleme**: Tüm belgeler ve kodlar saklanır
4. **Kaynakların Serbest Bırakılması**: Takım üyeleri yeni görevlere atanır
5. **Post-Launch Review**: 1 ay sonra sistem performansı değerlendirilir

---

## 12. Hazırlanması ve Onay

### 12.1 Proje Sözleşmesi Hazırlaması

| Ad | Rol | Tarih | İmza |
|----|-----|-------|------|
| [İsim] | Proje Müdürü | [Tarih] | _____ |
| [İsim] | Proje Sponsor | [Tarih] | _____ |
| [İsim] | Product Owner | [Tarih] | _____ |
| [İsim] | Technical Lead | [Tarih] | _____ |

---

## 13. Ekler

- **A**: Detaylı Gereksinimler Belgesi (SRS)
- **B**: Risk Kaydı (Risk Log)
- **C**: Paydaş Analizi (Stakeholder Analysis)
- **D**: İletişim Planı (Communication Plan)
- **E**: Kalite Güvence Planı (QA Plan)
- **F**: Proje Takvimi (Gantt Chart)

---

**Proje Sözleşmesi Onaylandı**

Tarih: ___________  
Proje Müdürü: ___________ İmza: ___________  
Proje Sponsor: ___________ İmza: ___________