# WCFinder Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** Aralık 2024  
**Status:** Production Ready  
**Owner:** Product Team (WCFinder)

---

## 1. Executive Summary

WCFinder, şehirde veya seyahat sırasında kamusal tuvalete erişim ihtiyacı duyan kullanıcıları, anlaşmalı işletmeler (restoran, kafe, otel vb.) ile anlık olarak buluşturan bir platformdur. Kullanıcılar, bulundukları konuma yakın tuvaletleri harita üzerinden keşfeder, uygun zaman dilimi için rezervasyon yapar, Stripe veya PayPal ile ücretini öder ve işletmeye varışta QR kodu göstererek hizmeti alır. Pilot bölge Bonn (Almanya) olup ürün production'a hazırdır.

---

## 2. Product Vision & Goals

### 2.1 Product Vision
```
"Şehir içinde tuvalet erişimini zahmetsiz, güvenli ve hijyenik hâle getirerek hem kullanıcıların konforunu artırmak hem de işletmelere ek gelir kanalı sağlamak."
```

### 2.2 Primary Goals (2025 Pilot)
- **Erişim Kolaylığı:** Kullanıcıların 2 dakikadan kısa sürede uygun tuvalet bulması.
- **İşletme Katılımı:** 3 ay içinde 50+ işletmenin sisteme katılması.
- **Ödeme Güvenilirliği:** Ödeme işlem başarı oranının ≥ %95 olması.
- **Kullanıcı Memnuniyeti:** NPS skorunun ≥ 50 seviyesinde tutulması.

### 2.3 Secondary Goals
- Mobil uygulama (React Native) ile kullanım oranını artırmak.
- Çoklu dil desteğiyle yeni şehirlere ölçeklenmek.

---

## 3. Target Users & Personas

### 3.1 Kullanıcı Segmentleri
- **Şehir Sakinleri / Çalışanlar:** Gün içinde hızlı çözüm arayan, abonelik potansiyeli olan kullanıcılar.
- **Turistler:** Harita ve rezervasyon akışına hızlı adapte olan, çoklu dil desteğine ihtiyaç duyan ziyaretçiler.
- **İşletme Sahipleri:** Tuvaletlerini listeleyerek ek gelir edinmek isteyen restoran, kafe, otel vb. işletmeler.
- **Platform Yöneticileri / Admin:** İçerik ve kullanıcı yönetimi, gelir analizi, onay süreçleri.

### 3.2 Örnek Persona
| Persona | Özellikler | İhtiyaçlar |
|---------|------------|------------|
| **Anna (26)** | Bonn’da çalışan pazarlama uzmanı | 5 dakikada yakın tuvalet bulmak, güvenli ödeme, hijyen yorumları |
| **Lukas (34)** | Kafe sahibi | Boş kapasiteyi değerlendirmek, rezervasyonları takip etmek, hızlı ödeme | 

---

## 4. Problem Statement

Şehir içinde hijyenik tuvalet bulmak zor; mevcut kamu seçenekleri kısıtlı ve güvenilir değil. İşletmelerin atıl tuvalet kapasitesi gelir getirmiyor. Kullanıcıların zaman kaybetmeden, güvenli ödeme ile hizmet alabileceği, işletmelerin de kontrollü şekilde erişim sağlayabileceği bir çözüm eksikliği var.

---

## 5. Scope

### 5.1 In Scope (MVP / Pilot)
- Lokasyon tabanlı tuvalet listeleme (harita + liste görünümü).
- Kullanıcı hesabı oluşturma, giriş, profil yönetimi.
- Stripe ve PayPal ile ödeme akışı.
- Rezervasyon oluşturma, QR kod üretimi ve doğrulama.
- İşletme paneli: tuvalet ekleme/düzenleme, rezervasyon listeleme.
- Admin onay akışı (işletme ve içerik doğrulama).

### 5.2 Out of Scope (Future)
- Anlık chat veya müşteri destek entegrasyonu.
- Sadakat/puan sistemi.
- Çok şehre yayılmış çoklu dil desteği (pilot sonrası).
- Üçüncü parti kamu tuvalet verisi entegrasyonu.
- İşletme tarafında fiyatlandırma (fiyatı platform belirler).
- Rezervasyon iptal/iade politikası (şimdilik uygulanmayacak).
- Abonelik/paket modelleri.

---

## 6. User Journeys & Use Cases

### 6.1 User Journey (End User)
1. Kullanıcı uygulamayı açar, harita üzerinde konumunu paylaşır.
2. Yakın işletmeleri (tuvaletleri) filtreleyerek inceler (ücret, erişilebilirlik, yorum).
3. Uygun zaman dilimini seçer, rezervasyonu başlatır.
4. Stripe/PayPal ile ödeme yapar.
5. QR kod ve erişim kodu oluşturulur; kullanıcı işletmeye giderek kodu gösterir.
6. Kullanım sonrası değerlendirme bırakır.

### 6.2 Use Case Tablosu
| ID | Use Case | Aktör | Açıklama | Öncelik |
|----|----------|-------|----------|---------|
| UC-01 | Harita üzerinden tuvalet bulma | Kullanıcı | Coğrafi konuma göre filtreleme | P1 |
| UC-02 | Rezervasyon oluşturma | Kullanıcı | Tarih, kişi sayısı, tercihler | P1 |
| UC-03 | Ödeme tamamlama | Kullanıcı | Stripe veya PayPal ile ödeme | P1 |
| UC-04 | QR kod ile doğrulama | Kullanıcı/İşletme | Check-in ve doğrulama | P1 |
| UC-05 | Tuvalet yönetimi | İşletme Sahibi | Tuvalet ekle/düzenle/sil | P1 |
| UC-06 | Rezervasyonları görüntüleme | İşletme Sahibi | Gelen rezervasyonları görüntüleme | P2 |
| UC-07 | İşletme onayı | Admin | Yeni işletmeleri inceleme ve onay | P1 |
| UC-08 | Gelir raporları | Admin | Ödeme ve kullanım raporları | P3 |

---

## 7. Functional Requirements

### 7.1 Kullanıcı Yönetimi
- FR-01: Kullanıcılar e-posta ve şifre (veya kullanıcı adı) ile kayıt olabilmeli.
- FR-02: JWT tabanlı kimlik doğrulama, refresh token kullanımı.
- FR-03: Kullanıcı profili (ad, iletişim bilgisi) düzenlenebilir olmalı.
- FR-04: Şifre reset/forgot password akışı (ileriki faz).

### 7.2 Tuvalet Arama & Rezervasyon
- FR-05: Kullanıcı konum paylaşımı ile en yakın işletmeleri listeleyebilir.
- FR-06: Filtreleme: ücret, erişilebilirlik, cinsiyet tercihi, yorum puanı.
- FR-07: Rezervasyon girişi: tarih-saat, kişi sayısı, cinsiyet tercihi.
- FR-08: Rezervasyon oluşturulduktan sonra ödeme yapılana kadar durum “pending” olmalı.
  
  Not: Rezervasyon iptal/iade politikası şimdilik uygulanmayacaktır.

### 7.3 Ödeme Akışı
- FR-09: Stripe Payment Intent oluşturulmalı, client secret frontend’e dönmeli.
- FR-10: PayPal Order oluşturma ve capture akışı desteklenmeli.
- FR-11: Başarılı ödeme sonrası Usage kaydı “paid/confirmed” durumuna geçmeli, QR kod üretimi tetiklenmeli.
- FR-12: Ödeme başarısız olduğunda Usage kaydı “failed” olarak işaretlenmeli.
- FR-13: Admin kullanıcıları ödeme iadesi (refund) başlatabilmeli.

  Not: Ödeme testleri henüz tamamlanmamıştır; "Ödeme Test Planı" bölümü zorunludur.

### 7.4 İşletme Yönetimi
- FR-14: İşletme sahipleri tuvalet listesini yönetebilmeli (CRUD). Fiyat belirleme yetkisi yoktur.
- FR-15: İşletme profili onay mekanizmasına tabi olmalı (pending → approved/rejected).
- FR-16: İşletme paneli, rezervasyon listesini gösterebilmeli (onay/iptal yetkisi şimdilik yoktur).

### 7.5 Admin Paneli
- FR-17: Admin, kullanıcı ve işletme rolleri üzerinde yetki kontrolü yapabilmeli.
- FR-18: Yeni işletme başvurularını onaylayabilmeli.
- FR-19: Şüpheli rezervasyon ödemelerini inceleyip iptal edebilmeli.

### 7.6 Bildirimler & İletişim (Future)
- FR-20: Kullanıcılara rezervasyon hatırlatma e-postası gönderilecek (sendMail helper hazır).
- FR-21: İleri fazda push notification / SMS entegrasyonu değerlendirilecek.

---

## 8. Non-Functional Requirements (NFR)

| ID | Kategori | Requirement | Hedef |
|----|----------|-------------|-------|
| NFR-01 | Performans | API response süresi | < 500 ms |
| NFR-02 | Performans | Sayfa yüklenme süresi (LCP) | < 2 sn |
| NFR-03 | Güvenlik | JWT, HTTPS, CORS, rate limiting | Production’da aktif |
| NFR-04 | Güvenlik | GDPR uyumu | Kaydedilen tüm kişisel veriler için |
| NFR-05 | Güvenlik | Ödeme PCI-DSS uyumluluğu | Stripe & PayPal standartlarına uyum |
| NFR-06 | Uptime | Sistem kullanılabilirlik | ≥ %99 (launch sonrası) |
| NFR-07 | Skalabilite | Ölçekleme planı | 100K eşzamanlı kullanıcı |
| NFR-08 | Observability | Log ve hata takip | Sentry / eşdeğer | 
| NFR-09 | Localization | Çoklu dil desteği | Faz 2 (EN/DE/TR) |

---

## 9. Success Metrics

### 9.1 Product KPIs
- **Aktif Kullanıcı** (MAU): İlk 3 ayda 10.000.
- **Rezervasyon Tamamlama Oranı:** ≥ %80 (rezervasyon → check-in).
- **İptal Oranı:** ≤ %15 (kullanıcı iptali + no-show).
- **İşletme Memnuniyeti:** Aylık anketler, memnuniyet ≥ 4/5.

### 9.2 Business KPIs
- **Gelir Paylaşımı:** İşletmelerden komisyon gelirleri ≥ %10 marj.
- **İşletme Bağlama Hızı:** Haftada 4+ yeni işletme.
- **Net Gelir:** Pilot sonunda pozitif katkı.

### 9.3 Technical KPIs
- **Hata Oranı:** Sentry üzerinden kritik hata sayısı ≤ 5/ay.
- **CI Başarı Oranı:** ≥ %95 build/test başarı.
- **Test Coverage:** Backend ≥ %70, Frontend ≥ %60 (faz 2 hedefi).

---

## 10. Dependencies & Risks

### 10.1 Bağımlılıklar
- **Stripe & PayPal**: Ödeme kurulumu, test ortamı yönetimi.
- **MongoDB Atlas**: Production veritabanı altyapısı.
- **Vercel/Netlify + Render/Heroku**: Olası hosting seçenekleri.
- **Yerel Regulasyonlar**: Bonn yerel yönetmelikleri, GDPR.

### 10.2 Riskler & Mitigasyon
| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| İşletme katılımının düşük olması | Orta | Yüksek | Pilot süresince lokasyon bazlı teşvikler |
| Ödeme entegrasyon hataları (testler tamamlanmadı) | Orta | Yüksek | Aşağıdaki Ödeme Test Planı'nın tamamı |
| Kullanıcı güvenlik endişeleri | Orta | Orta | Hijyen standartları, puan/yorum sistemi |
| Teknik borç (TypeScript, test eksikliği) | Orta | Orta | Faz 2’de teknik iyileştirme sprint’i |
| Rate limiting & güvenlik açıkları | Orta | Yüksek | Production’da rate limit, WAF |

---

## 11. Release Plan & Milestones

### 11.1 Development Status
- Durum: **Production Ready** - Tüm temel özellikler tamamlandı ve test edildi.
- Production ortamı için deployment hazır.

### 11.2 Milestones
| Tarih | Aşama | Deliverable |
|-------|-------|-------------|
| Aralık 2024 | Feature Complete | MVP kapsamındaki tüm özellikler tamamlandı |
| Aralık 2024 | QA & UAT | Kullanıcı testleri tamamlandı, bug fixing yapıldı |
| Ocak 2025 | Production Launch | Bonn'daki işletmelerle canlıya çıkış (planlandı) |
| 2025 Q1 | Iteration 1 | Feedback toplama, küçük iyileştirmeler |

### 11.3 Kaynak Durumu
- Frontend ve Backend geliştirme tamamlandı
- Temel testler yapıldı
- Production deployment için hazır

---

## 12. Assumptions & Open Questions

- Kullanıcıların akıllı telefon sahibi olduğu ve QR kod gösterebildiği varsayılıyor.
- İşletmelerin tuvaletlerini ücretli paylaşmaya gönüllü olduğu varsayılıyor.
- Şu an sadece Almanca/İngilizce dil desteği planlanıyor; Türkçe talebe bağlı.
- Kullanıcı testleri tamamlandı; sonuçlar MVP gereksinimlerini doğruladı.
- Production altyapısı henüz devreye alınmadı, deployment pipeline planlanmalı.
- Fiyatlandırma, işletmeler tarafından değil platform tarafından merkezi olarak belirlenecektir.

**Açık Sorular**
1. Platform tarafından belirlenecek fiyatların yapısı nedir? (tek fiyat / şehir-bazlı tablo / tuvalet türüne göre)
2. Rezervasyon iptal/iade politikası ileride eklenecekse hangi fazda ve hangi kurallarla ele alınacak?
3. Çoklu dil desteği için öncelikli diller ve lansman şehirleri hangileri olacak?

---

## 13. Appendix

- **Ana Dokümantasyon:** `README.md` - Proje genel bakış ve kurulum
- **Teknik Dokümantasyon:** `CLIENT/docs/ARCHITECTURE.md`, `SERVER/src` controller ve model dosyaları
- **Dağıtım Rehberi:** `PRODUCTION_DEPLOYMENT.md` - Production deployment rehberi
- **Komisyon Sistemi:** `COMMISSION_SYSTEM_DOCUMENTATION.md` - Ödeme ve komisyon yapısı
- **Admin Oluşturma:** `CREATE_ADMIN_USER.md` - İlk admin kullanıcısı oluşturma

---

**Hazırlayan:** GPT-5 Codex (Cursor AI Asistanı)

---

## 14. Ödeme Test Planı (Stripe & PayPal)

Not: Ödeme testleri henüz tamamlanmadığı için aşağıdaki senaryolar production öncesi zorunludur. Tüm testler sandbox ortamlarında ve test kartlarıyla yapılmalıdır.

### 14.1 Ortam ve Hazırlık
- Stripe: `STRIPE_SECRET_KEY` (test), `VITE_STRIPE_PUBLISHABLE_KEY` (test), `STRIPE_WEBHOOK_SECRET` ayarlı.
- PayPal: Sandbox `PAYPAL_CLIENT_ID` ve `PAYPAL_CLIENT_SECRET` ayarlı.
- Webhook endpoint’leri erişilebilir (ngrok/Cloud) ve doğrulama aktif.
- Test kullanıcıları ve en az 1 “pending” Usage kaydı mevcut.

### 14.2 Stripe Testleri
- S-01 Happy Path: PaymentIntent oluşturulur, `client_secret` döner, kartla ödeme başarılı → Payment.status = `succeeded`, Usage.paymentStatus = `paid`, Usage.accessCode oluşur.
- S-02 Kart Reddedildi: 4000 0000 0000 9995 test kartı ile ödeme başarısız → Payment.status = `failed`, Usage.paymentStatus = `failed`.
- S-03 Yetersiz Bakiye: İlgili test kartı ile reddedilme akışı doğrulanır.
- S-04 3D Secure Gereken Kart: 3DS akışının kullanıcı tarafında tamamlandığı doğrulanır.
- S-05 Webhook Doğrulama: `payment_intent.succeeded/failed` event’leri signature ile doğrulanır, idempotent güncelleme yapılır (tekrar çağrıda veri tutarlılığı bozulmaz).
- S-06 Yetkisiz Kullanıcı: Başka bir kullanıcının `usageId`’si ile ödeme denemesinde 403 döner.
- S-07 Çift Ödeme Engeli: Aynı `usageId` için tekrar ödeme girişiminde uygun hata mesajı döner (zaten ödenmiş).
- S-08 Refund (Admin): Başarılı ödeme için refund başlatılır → Payment.status = `refunded`, Usage.paymentStatus etkilenmez (iş kuralına göre değerlendirilecek).

### 14.3 PayPal Testleri
- P-01 Happy Path: Order create → capture başarılı → Payment.status = `succeeded`, Usage.paymentStatus = `paid`.
- P-02 Kullanıcı İptali: PayPal ekranından iptal → Payment.status değişmez veya `failed`, frontend uygun mesaj gösterir.
- P-03 Capture Hatası: Geçersiz `orderId` ile capture denemesi 404 döner.
- P-04 Yetkisiz Kullanıcı: Başka bir kullanıcının `usageId`’si ile create denemesi 403 döner.
- P-05 Çift Ödeme Engeli: Aynı `usageId` için ikinci create denemesinde uygun hata döner.
- P-06 Refund (Admin): Başarılı capture için refund talebi → Payment.status = `refunded` ve refund alanları dolar.

### 14.4 Güvenlik ve Dayanıklılık
- G-01 Authorization Header: Tüm ödeme endpoint’lerinde JWT zorunlu (webhook hariç).
- G-02 Input Validation: `usageId/orderId` format ve varlık kontrolü.
- G-03 Rate Limiting: Ödeme oluşturma/capture endpoint’lerinde temel limit (production’da).
- G-04 Loglama: Hata ve başarısız ödeme denemeleri merkezi log’a yazılır (PII sızdırmadan).
- G-05 Idempotency: Webhook ve tekrarlı isteklerde (yeniden deneme) veri tutarlılığı.

### 14.5 UAT Akışı (Özet)
1. Kullanıcı giriş yapar → Usage oluşturur (pending).
2. Stripe ile ödeme tamamlar → başarı.
3. QR kod üretimi ve erişim kodu doğrulanır (UI akışı).
4. PayPal ile ödeme tamamlar → başarı.
5. Hatalı kart senaryosu denenir → uygun hata mesajları görülür.
6. Admin panelinden refund işlemi test edilir.


