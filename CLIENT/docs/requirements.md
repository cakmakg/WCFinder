# WCFinder - Gereksinimler Belgesi (SRS)

**Versiyon**: 1.0  
**Tarih**: Eylül 2025  
**Durum**: Onaylandı

---

## 1. Gereksinimler Özeti

Bu belge, WCFinder platformunun tüm işletme, kullanıcı ve teknik gereksinimlerini tanımlar.

---

## 2. İşletme Gereksinimleri (BR)

### BR-1: Kullanıcı Kaydı ve Kimlik Doğrulama
- **BR-1.1**: Sistem, kullanıcıların email ve şifre ile kaydolmalarını sağlamalı
- **BR-1.2**: Sistem, sosyal medya ile giriş (Google, Facebook) desteklemeli
- **BR-1.3**: Sistem, email doğrulamayı zorunlu kılmalı
- **BR-1.4**: Sistem, şifre sıfırlama fonksiyonu sağlamalı
- **BR-1.5**: Sistem, 2FA (İki Faktörlü Kimlik Doğrulama) desteklemeli

### BR-2: İşletme Yönetimi
- **BR-2.1**: İşletme sahipleri tuvaletlerini listeleyebilmeli
- **BR-2.2**: İşletme sahipleri tuvaletlerini düzenleyebilmeli
- **BR-2.3**: Sistem, yeni işletmelerin onaylanmasını gerektirmeli
- **BR-2.4**: Admin, işletmeleri onaylayabilmeli veya reddedebilmeli
- **BR-2.5**: İşletmeler, tuvaletlerinin kapanış saatlerini belirleyebilmeli

### BR-3: Tuvalet Yönetimi
- **BR-3.1**: Sistem, tuvaletlerin özelliklerini tanımlamalı (engelli erişim, bebek bakım vb.)
- **BR-3.2**: Sistem, tuvaletlerin durumunu göstermeli (müsait, kullanımda, arızalı)
- **BR-3.3**: Sistem, tuvaletlerin ücretini takip etmeli
- **BR-3.4**: Sistem, tuvaletlerin temizlik geçmişini tutabilmeli

### BR-4: Rezervasyon Sistemi
- **BR-4.1**: Kullanıcılar, tarih ve saat seçerek rezervasyon yapabilmeli
- **BR-4.2**: Sistem, aynı tuvalet için çakışan rezervasyonları önlemeli
- **BR-4.3**: Sistem, cinsiyete göre tuvalet filtrelemesine izin vermeli
- **BR-4.4**: Sistem, grup rezervasyonlarını desteklemeli (2-10 kişi)
- **BR-4.5**: Kullanıcılar, rezervasyonlarını iptal edebilmeli (minimum 24 saat öncesi)

### BR-5: Ödeme Sistemi
- **BR-5.1**: Sistem, Stripe entegrasyonu ile ödeme yapabilmeli
- **BR-5.2**: Sistem, kredi kartı, debit kartı, Apple Pay, Google Pay desteklemeli
- **BR-5.3**: Sistem, ödeme geçmişini tutabilmeli
- **BR-5.4**: Sistem, otomatik para iadesi işlemlerini desteklemeli
- **BR-5.5**: Platform, %10-15 komisyon alabilmeli

### BR-6: Değerlendirme ve Yorum
- **BR-6.1**: Kullanıcılar, tuvaletleri 1-5 yıldız ile puanlayabilmeli
- **BR-6.2**: Kullanıcılar, tuvaletler hakkında yorum yazabilmeli
- **BR-6.3**: Sistem, temizlik ve genel özellikleri ayrı ayrı puanlayabilmeli
- **BR-6.4**: Ortalama puanlar gösterilmeli
- **BR-6.5**: İşletmeler, yorumlara cevap verebilmeli

### BR-7: QR Kod ve Doğrulama
- **BR-7.1**: Her rezervasyon için benzersiz QR kod oluşturulmalı
- **BR-7.2**: QR kod üzerinden rezervasyon doğrulanabilmeli
- **BR-7.3**: QR kod 24 saat süre için geçerli olmalı
- **BR-7.4**: İşletme, QR kodları taratarak kullanımı onaylayabilmeli

---

## 3. Kullanıcı Gereksinimleri (UR)

### UR-1: Fonksiyonel Gereksinimler

#### UR-1.1 Harita & Keşfetme
| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| UR-1.1.1 | Kullanıcı, harita üzerinde yakındaki tuvaletleri görebilmeli | MUST |
| UR-1.1.2 | Sistem, konum bazlı filtreleme yapabilmeli | MUST |
| UR-1.1.3 | Sistem, mesafe bilgisini gösterebilmeli (km cinsinden) | MUST |
| UR-1.1.4 | Sistem, harita yakınlaştırma/uzaklaştırma desteklemeli | MUST |
| UR-1.1.5 | Kullanıcı, liste görünümünü tercih edebilmeli | SHOULD |

#### UR-1.2 Tuvaletleri Arama
| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| UR-1.2.1 | Kullanıcı, tuvaletleri adına göre arayabilmeli | MUST |
| UR-1.2.2 | Sistem, tuvaletleri puanlamaya göre sıralayabilmeli | MUST |
| UR-1.2.3 | Sistem, tuvaletleri mesafeye göre sıralayabilmeli | MUST |
| UR-1.2.4 | Sistem, tuvaletleri ücrete göre filtreleyebilmeli | SHOULD |
| UR-1.2.5 | Sistem, engelli erişim özelliğine göre filtreleyebilmeli | SHOULD |

#### UR-1.3 Tuvalet Detayları
| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| UR-1.3.1 | Tuvalet detay sayfasında fotoğraflar gösterilmeli | MUST |
| UR-1.3.2 | Tuvalet detay sayfasında açılış saatleri gösterilmeli | MUST |
| UR-1.3.3 | Tuvalet detay sayfasında ücret bilgisi gösterilmeli | MUST |
| UR-1.3.4 | Tuvalet detay sayfasında özellikler gösterilmeli | MUST |
| UR-1.3.5 | Tuvalet detay sayfasında son yorumlar gösterilmeli | SHOULD |

#### UR-1.4 Rezervasyon
| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| UR-1.4.1 | Kullanıcı, tarih seçerek rezervasyon yapabilmeli | MUST |
| UR-1.4.2 | Kullanıcı, saat seçerek rezervasyon yapabilmeli | MUST |
| UR-1.4.3 | Kullanıcı, kişi sayısı belirtebilmeli | MUST |
| UR-1.4.4 | Sistem, ücret hesaplayıp gösterebilmeli | MUST |
| UR-1.4.5 | Sistem, cinsiyet tercihini kaydetmeli | SHOULD |

#### UR-1.5 Ödeme
| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| UR-1.5.1 | Ödeme sayfası güvenli olmalı (HTTPS) | MUST |
| UR-1.5.2 | Kullanıcı, kredi kartı bilgisini girebilmeli | MUST |
| UR-1.5.3 | Sistem, ödeme onayını gösterebilmeli | MUST |
| UR-1.5.4 | Sistem, hata durumunda mesaj gösterebilmeli | MUST |
| UR-1.5.5 | Kullanıcı, farklı ödeme yöntemlerini tercih edebilmeli | SHOULD |

#### UR-1.6 Profil Yönetimi
| ID | Gereksinim | Öncelik |
|----|-----------|---------|
| UR-1.6.1 | Kullanıcı, profilini düzenleyebilmeli | MUST |
| UR-1.6.2 | Kullanıcı, şifresini değiştirebilmeli | MUST |
| UR-1.6.3 | Kullanıcı, geçmiş rezervasyonlarını görebilmeli | MUST |
| UR-1.6.4 | Kullanıcı, hesabını silebilmeli | SHOULD |
| UR-1.6.5 | Kullanıcı, bildirim tercihlerini ayarlayabilmeli | SHOULD |

### UR-2: Kullanıcı Deneyimi Gereksinimleri
- UR-2.1: Arayüz sezgisel ve kullanıcı dostu olmalı
- UR-2.2: Mobil uyumlu tasarım (responsive) olmalı
- UR-2.3: Sayfalar hızlı yüklenmelie (< 2 saniye)
- UR-2.4: Renk kontrastı WCAG AA standardında olmalı
- UR-2.5: Yazı tipi minimum 14px olmalı

---

## 4. Sistem Gereksinimleri (SR)

### SR-1: Fonksiyonel Sistem Gereksinimleri

#### SR-1.1 Kimlik Doğrulama & Yetkilendirme
- SR-1.1.1: JWT token tabanlı kimlik doğrulama
- SR-1.1.2: Token 24 saat geçerli olmalı
- SR-1.1.3: Refresh token mekanizması
- SR-1.1.4: Role-based access control (RBAC)
- SR-1.1.5: Şifreler bcrypt ile hashlenmeli (salt rounds ≥ 10)

#### SR-1.2 Veri Tabanı
- SR-1.2.1: MongoDB 4.4+ kullanılmalı
- SR-1.2.2: Tüm dış anahtarlar indexed olmalı
- SR-1.2.3: Coğrafi sorgulamalar için geospatial index
- SR-1.2.4: Veri yedekleme günlük yapılmalı
- SR-1.2.5: Veri replication 3+ nodes olmalı

#### SR-1.3 API Gereksinimleri
- SR-1.3.1: REST API kullanılmalı
- SR-1.3.2: JSON format'ında veri iletişimi
- SR-1.3.3: Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- SR-1.3.4: Rate limiting: 100 requests/minute/user
- SR-1.3.5: API versioning (v1, v2, etc.)

#### SR-1.4 Ödeme Entegrasyonu
- SR-1.4.1: Stripe API v3
- SR-1.4.2: Payment intent flow
- SR-1.4.3: Webhook handling
- SR-1.4.4: PCI DSS uyumluluğu
- SR-1.4.5: 3D Secure 2.0 desteği

### SR-2: Fonksiyonel Olmayan Gereksinimler

#### SR-2.1 Performans
| Metrik | Target | Ölçü |
|--------|--------|------|
| Sayfa Yükleme Süresi | < 2 saniye | Desktop & Mobile |
| API Response Süresi | < 500 ms | 95th percentile |
| Veritabanı Query Süresi | < 100 ms | 99th percentile |
| Concurrent Users | 10,000+ | Peak hours |
| Throughput | 1,000 req/sec | Sustained |

#### SR-2.2 Güvenlik
- SR-2.2.1: SSL/TLS 1.2+
- SR-2.2.2: OWASP Top 10 uyumluluğu
- SR-2.2.3: GDPR uyumluluğu
- SR-2.2.4: SQL Injection koruması
- SR-2.2.5: XSS koruması
- SR-2.2.6: CSRF token koruması
- SR-2.2.7: Rate limiting
- SR-2.2.8: Input validation ve sanitization
- SR-2.2.9: Şifre minimum 8 karakter, kompleks olmalı
- SR-2.2.10: PCI DSS level 1 uyumluluğu (ödeme için)

#### SR-2.3 Kullanılabilirlik
- SR-2.3.1: Mobile-first responsive design
- SR-2.3.2: WCAG 2.1 AA standartlarına uyumlu
- SR-2.3.3: Keyboard navigation desteklemesi
- SR-2.3.4: Screen reader uyumluluğu
- SR-2.3.5: Multi-language support (EN, DE, başlangıçta)

#### SR-2.4 Güvenilirlik & Availability
- SR-2.4.1: 99.5% uptime SLA
- SR-2.4.2: Graceful degradation
- SR-2.4.3: Error handling ve logging
- SR-2.4.4: Automatic failover
- SR-2.4.5: Database backup (günlük)

#### SR-2.5 Ölçeklenebilirlik
- SR-2.5.1: Horizontal scaling desteklemesi
- SR-2.5.2: Load balancing
- SR-2.5.3: Caching strategy (Redis)
- SR-2.5.4: CDN entegrasyonu
- SR-2.5.5: Microservices ready architecture

### SR-3: Teknik Stack Gereksinimleri

#### Frontend
- Node.js 16+
- React 18+
- Material-UI v5+
- Leaflet.js
- Axios
- Redux

#### Backend
- Node.js 16+
- Express.js 4.18+
- MongoDB 4.4+
- Mongoose 6+
- JWT (jsonwebtoken)
- Stripe SDK

#### DevOps
- Docker
- Docker Compose
- GitHub Actions (CI/CD)
- AWS/Heroku (deployment)

---

## 5. Kısıtlamalar (Constraints)

### C-1: Zaman Kısıtlaması
- Proje bitiş tarihi: 30 Kasım 2025 (12 hafta)
- MVP (Minimum Viable Product) için 8 hafta

### C-2: Bütçe Kısıtlaması
- Toplam bütçe: €45,000
- Geliştirme: €24,000

### C-3: Yasal Kısıtlamalar
- GDPR uyumluluğu zorunlu
- PSD2 uyumluluğu zorunlu
- Yerel vergi kanunlarına uyma

### C-4: Teknik Kısıtlamalar
- Sadece cloud-based solutions (kurumsal sunucu yok)
- Open-source teknolojiler tercih edilmeli
- Third-party API'lere bağımlılık minimalize edilmeli

---

## 6. Varsayımlar (Assumptions)

- AS-1: Kullanıcıların çoğu mobil cihazdan erişecek
- AS-2: Ödeme başarı oranı %95+ olacak
- AS-3: İşletmeler aktif olarak platform'u yönetecek
- AS-4: Stripe API stabil ve güvenilir kalacak
- AS-5: MongoDB Atlas yeterli performans sağlayacak

---

## 7. Dışlanan Gereksinimler (Out of Scope)

- OOS-1: Video chat aracılığı ile müşteri hizmeti (Phase 2)
- OOS-2: AI tabanlı tuvaletler tavsiyesi (Phase 2)
- OOS-3: Multilingual support (EN, DE haricinde) (Phase 2)
- OOS-4: Sosyal ağ özelliği (arkadaş ekleme, paylaşım) (Phase 2)
- OOS-5: Mobil app (iOS, Android) (Phase 2)

---

## 8. Gereksinim Trace Matrix

| BR ID | UR ID | SR ID | Test Case |
|-------|-------|-------|-----------|
| BR-4 | UR-1.4 | SR-1.4 | TC-REZ-001 |
| BR-5 | UR-1.5 | SR-1.4 | TC-PAY-001 |
| BR-6 | UR-1.3 | SR-1.2 | TC-REV-001 |
| BR-1 | UR-1.6 | SR-1.1 | TC-AUTH-001 |

---

## 9. Onay

| Ad | Rol | Tarih | İmza |
|----|-----|-------|------|
| [İsim] | Product Owner | [Tarih] | _____ |
| [İsim] | Technical Lead | [Tarih] | _____ |
| [İsim] | QA Lead | [Tarih] | _____ |