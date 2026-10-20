# Doğrulama kaydı — 20 Ekim 2026

## Başarılı kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm test` | 15 test geçti, 2 test dosyası |
| `npm run test:e2e` | 8 test geçti: masaüstü Chromium ve mobil Chromium emülasyonu |
| `npm run build` | TypeScript ve Vite production build başarılı |
| `npm run data:validate` | 10.005 IOC kaydı, 941 varlık ve 6.533 ilişkinin bütünlüğü doğrulandı |
| `npm audit` | Güncellenmiş bağımlılık ağacında 0 bulgu |
| `npm audit --omit=dev` | Production bağımlılıklarında 0 bulgu |

## Doğrulanan davranışlar

- IPv4/IPv6 doğrulaması, domain/hash normalizasyonu, URL yolunun korunması, CVE ayrıştırma, defanged değerler ve tekrar kaldırma.
- CSV/JSON yükleme, tek sütunlu CSV, yanlış başlık ve JSON şeması, geçersiz satır sayımı, yerel verinin doğrulanmış veri olarak gösterilmemesi.
- Kaynakta olmayan saat/tarih üretmeme, credential/JavaScript URLlerini reddetme ve CSV formül kaçırma.
- İptal edilmiş STIX nesnelerini ve yetim ilişkileri dışlama, IPsum eşik filtresi ve Feodo boş feed davranışı.
- Üç kaynağın tamamı erişilemezken önceki IOC, varlık, ilişki ve başarılı indirme zamanlarını aynen koruma. Test geçici bir snapshot üzerinde çalışır.
- IOC tür filtresi ve arama, CSV indirme, detay paneli ve Escape ile kapatma, teknik/aktör arama ve detayları.
- Analyzer metin analizi, kullanıcı verisi ekleme, CSV/JSON dosyası yükleme ve gerçek feed’deki bir IOC ile açık kaynak eşleşmesi.
- Cytoscape canvas oluşturma, indicator görünümü ve yakınlaştırma/sığdırma düğmeleri.
- Mobil menü açma, menüden modül değiştirme, hızlı aramanın aktör ekranına yönlendirmesi ve mobil sayfanın yatay taşmaması.
- Veri dosyası HTTP 503 olduğunda kontrollü hata gösterimi.
- GitHub Pages benzeri `/test-repo/` alt yolunda asset/JSON yüklemesi ve `#attack` hash yolunda sayfa yenileme.

## Snapshot

Resmi kaynaklardan 20 Ekim 2026 tarihinde indirildi. Tam indirme zamanları, upstream dosya SHA-256 özetleri ve kaynak bağlantıları JSON içindeki `sources` dizisinde korunur.

- MITRE ATT&CK Enterprise: **178 aktör, 706 teknik, 57 kampanya**.
- **6.533** kaynak STIX relationship kaydı; IOC feed’lerinden aktör/teknik ilişkisi türetilmedi.
- IPsum: **10.000** IOC kaydı (en az 3 kaynak listesi eşiği ve kapsam sınırı).
- Feodo Tracker: **5** IOC kaydı.

## Doğrulama sınırları

Tarayıcı kontrolleri Chromium ve mobil cihaz emülasyonunda yapıldı; fiziksel cihaz, Safari veya Firefox testi yapılmadı. GitHub Actions workflow ve Pages yapılandırması projede hazırdır; uzak bir GitHub reposuna push veya gerçek Pages yayını bu teslimatta yapılmadı. Feed erişiminin gelecekte sürmesi garanti edilmez; kesintide koruma davranışı test edildi. Testler bütün IOC’lerin zararlı olduğunu doğrulamaz.
