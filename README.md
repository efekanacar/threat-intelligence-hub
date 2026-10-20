# Threat Intelligence Hub

## Bu sistem ne işe yarar?

Threat Intelligence Hub, siber tehditlerle ilgili açık kaynak bilgileri tek bir Türkçe arayüzde incelemenizi sağlar. Şüpheli bir IP adresini, alan adını, bağlantıyı veya dosya özetini araştırabilir; bilinen tehdit gruplarını ve kullandıkları saldırı tekniklerini görebilirsiniz.

Uygulamayı kullanmak için hesap açmanız, API anahtarı almanız veya sunucu kurmanız gerekmez. Web sitesini açmanız yeterlidir. Telefon ve bilgisayarda kullanılabilir.

### Neler yapabilirsiniz?

- **Genel durumu görün:** Kaç gösterge, tehdit aktörü ve saldırı tekniği bulunduğunu grafiklerle inceleyin.
- **Gösterge arayın:** IP, domain, URL ve hash değerlerini arayın; türüne ve kaynağına göre filtreleyin, sonuçları CSV veya JSON olarak indirin.
- **Saldırı tekniklerini öğrenin:** MITRE ATT&CK tekniklerini isim veya teknik numarasıyla bulun; açıklamalarını ve kaynak bağlantılarını okuyun.
- **Tehdit gruplarını araştırın:** Grupların açıklamalarını, bilinen takma adlarını ve kaynaklarda belirtilen tekniklerini inceleyin.
- **Bağlantıları keşfedin:** İlişki grafiğinde aktör, teknik ve kampanya bağlantılarına tıklayarak ayrıntılarına ulaşın. Grafik yalnızca kaynakta bulunan ilişkileri gösterir.
- **Kendi verinizi analiz edin:** Metin yapıştırın veya CSV/JSON yükleyin. Sistem göstergeleri ayrıştırıp sitede yüklü verilerle karşılaştırır. Dosyanız dışarıya gönderilmez.
- **Kaynağı kontrol edin:** Bilginin nereden geldiğini, ne zaman indirildiğini ve güncellemede sorun olup olmadığını görün.

### Nasıl çalışır?

GitHub Actions her gün açık veri kaynaklarını indirir ve web sitesinin okuyabileceği küçük dosyalara dönüştürür. Site bu hazırlanmış dosyaları tarayıcınızda açar. Bir kaynak erişilemez olursa önceki başarılı veriler korunur.

**Bu bir canlı sorgu servisi değildir.** Analizler sitede yüklü veriyle yapılır. Bir eşleşmenin bulunmaması, göstergenin güvenli olduğu anlamına gelmez. Yüklediğiniz kullanıcı verisi doğrulanmış tehdit olarak işaretlenmez ve sayfa yenilenince silinir. CVE ifadeleri ayrıştırılır; bu sürümde CVE veri kaynağı bulunmadığı açıkça gösterilir.

---

## Teknik bilgiler

Türkçe, backend ve veritabanı gerektirmeyen siber tehdit istihbaratı çalışma alanı. React + TypeScript + Vite, Tailwind CSS, Cytoscape.js ve Recharts ile geliştirilmiştir. Uygulama GitHub Pages proje alt yollarında çalışır (`base: './'`, hash tabanlı navigasyon).

## Yerelde çalıştırma

Node.js **24 LTS** kullanın.

```sh
npm ci
npm run dev
```

Depoda gerçek kaynaklardan üretilmiş `public/data/intelligence.json` bulunur; uygulama ilk açılışta ağdan IOC feed’i indirmez. Geliştirme sunucusunun gösterdiği adresi açın.

```sh
npm run data:update      # Resmi verileri indir ve normalize et
npm run data:validate    # Kimlik, kaynak ve ilişki bütünlüğü
npm test                # Ayrıştırma, normalizasyon, fallback testleri
npm run build           # TypeScript kontrolü ve production build
npx playwright install chromium
npm run test:e2e         # Masaüstü ve mobil Chromium testleri
npm run preview         # dist/ production önizlemesi
```

Testler için internet sorgusu yapılmaz. Veri güncellemesi internet gerektirir. Çevrimdışı fallback davranışı `DATA_OFFLINE=1` ortam değişkeniyle de denenebilir; başarılı indirme zamanları ve önceki kayıtlar korunur.

## Modüller

- **Genel Bakış:** IOC kaynak kaydı ve benzersiz gösterge sayısı, aktör/teknik sayıları, IOC tür dağılımı, taktik kapsamı, kaynak sağlığı ve etkileşimli ilişki haritası. Grafikler yalnızca gerçekten yüklü veriden hesaplanır.
- **IOC Explorer:** Değer arama, tür/kaynak ve son görülme tarihi filtreleri, sayfalama, detay paneli ve filtrelenmiş tüm sonuçları CSV/JSON dışa aktarma. Aynı IP farklı feed’lerde bulunursa her kaynağın kaydı ayrı gösterilir; kaynak bilgisi kaybolmaz.
- **MITRE ATT&CK:** Teknik ID/ad araması, taktik seçimi, alt teknikler, kaynak açıklamaları ve kaynakta tanımlanan aktör ilişkileri.
- **Tehdit Aktörleri:** Ad, ATT&CK grup ID’si ve takma adla arama; açıklama, ilişkili teknikler ve referanslar.
- **İlişki Grafiği:** Aktör odağı, tür seçimi, pan, wheel/pinch zoom, yakınlaştırma, uzaklaştırma, sığdırma, düğüm ve kenar detayları. Ok yönü STIX source_ref → target_ref yönüdür. Büyük graflarda okunabilirlik için odak başına ilk 60 kaynak ilişkisi gösterilir (dashboard: 12). Indicator görünümü ilk 40 IOC’yi bağımsız gösterir. Kaynak ilişki sunmadığından bunlara kenar eklenmez.
- **IOC Analyzer:** Metin ve CSV/JSON’dan IPv4/IPv6, domain, HTTP(S) URL, MD5/SHA-1/SHA-256 ve CVE ayrıştırma; yüklü veriyle tam değer eşleştirme, çoklu kaynak sonuçları ve JSON analiz raporu. Domain/hash küçük harfe çevrilir, IPv6 canonical olur. URL yolunun harf büyüklüğü korunur. `hxxp(s)` ve `[.]` girdileri desteklenir. CVE kaynağı olmadığından CVE sorgularında bu açıkça belirtilir.
- **Veri Kaynakları:** Son başarılı indirme/deneme zamanları, kaynak Last-Modified değeri varsa, tam dosyanın SHA-256 özeti, kapsam, lisans ve hata durumları.

Üstteki arama mevcut IOC/teknik/aktör ekranında sonuçları filtreler. Genel Bakış, Analyzer, Kaynaklar veya Grafikte Enter ile sorguya uygun ekrana geçilir: tam aktör adı/takma adı aktörlere, teknik ID/adı ATT&CK ekranına, diğer değerler IOC aramasına yönlendirilir. “Veriyi yeniden oku”, yayınlanan statik dosyayı yeniden yükler; canlı istihbarat güncellemesi yapmaz. Kaynak yalnızca gün belirtmişse ekranda saat üretilmez.

## Veri kaynakları ve kullanım koşulları

| Kaynak | Kapsam | Lisans / koşul |
| --- | --- | --- |
| [MITRE ATT&CK STIX 2.1](https://github.com/mitre-attack/attack-stix-data) | Enterprise teknik, aktör, kampanya, taktik ve doğrudan STIX ilişkileri | [MITRE kullanım lisansı](https://github.com/mitre-attack/attack-stix-data/blob/master/LICENSE.txt); yerel kopyası `public/licenses/MITRE.txt` |
| [IPsum](https://github.com/stamparm/ipsum) | En az 3 listede görülen IP’lerin kaynak sırasındaki ilk 10.000 kaydı | [Unlicense](https://github.com/stamparm/ipsum/blob/master/LICENSE); yerel kopyası `public/licenses/IPsum.txt` |
| [Feodo Tracker](https://feodotracker.abuse.ch/blocklist/) | Kamuya açık JSON feed’indeki botnet C2 IP gözlemleri | [CC0 ve kaynak koşulları](https://feodotracker.abuse.ch/blocklist/#tos) |

Feed’lerin hiçbiri API anahtarı gerektirmez. Sınıflandırma kaynağın beyanıdır; uygulama bağımsız zararlılık hükmü veya yeni aktör atfı üretmez. IPsum tarayıcı adresleri de içerebilir. Feed kaydı bloklama kararı için tek başına yeterli değildir. Feodo verisinin günlük görüntüsü canlı engelleme listesi değildir.

MITRE ATT&CK® ve ATT&CK® MITRE Corporation tescilli markalarıdır. Bu proje MITRE tarafından desteklenmiş veya onaylanmış değildir. Kaynak metinleri kaynak dilinde korunur. Üçüncü taraf veri koşulları uygulama kodunun MIT lisansından ayrıdır.

## Veri işleme ve kesintide çalışma

`scripts/update-data.mjs` yalnızca sabit, güvenilen HTTPS kaynaklarını indirir; kullanıcı girdisinden URL üretmez. Tam STIX tarayıcıya gönderilmez. Etkin `attack-pattern`, `intrusion-set`, `campaign`, `x-mitre-tactic` ve seçilen varlıklar arasındaki `relationship` nesneleri normalize edilir. `revoked`/`x_mitre_deprecated` nesneler dışlanır. Nesne ID’leri, orijinal kaynak referansları ve ilişki kanıt metinleri korunur. Feed’den aktör veya teknik bağı türetilmez.

Kaynaklar bağımsız işlenir. Ağ/HTTP/JSON/şema hatasında sadece ilgili kaynağın önceki kayıtları korunur; durum `stale` olur, `fetchedAt` değişmez, `attemptedAt` ve hata güncellenir. Hiç geçmiş veri yoksa `unavailable` olur. Feodo’nun boş dizisi geçerli, boş veya beklenmedik MITRE/IPsum yanıtı hatadır. Nihai dosya doğrulamadan sonra atomik geçici dosya/rename ile yazılır. İlk çalıştırmada hiç veri üretilemezse işlem hata verir ve var olan dosya ezilmez.

Actions cache son başarılı snapshot’ı sonraki günlük çalışmaya taşır. Cache yoksa veya GitHub cache süresi dolmuşsa repodaki snapshot kullanılır. Böylece bütün kaynaklar kesilse de sayfa mevcut verilerle yeniden dağıtılabilir. Cache’deki dosya yalnızca testler ve build başarılıysa kaydedilir. Üretilen veri commit edilmez; Actions artifact’ı ve cache içinde kalır. Repo kopyasını yenilemek isterseniz `npm run data:update` sonrası JSON’u ayrıca commit edin.

## Yerel dosya formatı

CSV UTF-8 olmalı, `value`, `ioc` veya `indicator` başlığı içermeli. JSON string/nesne dizisi veya `{ "indicators": [...] }` biçiminde olmalı. Nesnelerde yalnızca `value`, `ioc` veya `indicator` değeri alınır. Kaynak adı/tarih/ilişki gibi yüklenen metadata güvenilen istihbarat olarak kabul edilmez. Dosya üst sınırı 5 MB, 50.000 satır; metin sınırı 1 milyon karakterdir. Geçersiz satır sayısı gösterilir. Kopyalar kaldırılır.

`examples/indicators.csv` ve `examples/indicators.json` **yalnızca format örnekleridir**. RFC dokümantasyon adresleri ve example.org içerir; tehdit verisi veya doğrulanmış CVE kaydı değildir. Gerçek veri örneği dağıtılan snapshot’tır.

Analiz edilen dosya otomatik olarak kütüphaneye eklenmez; “Yerel Veri Setine Ekle” ile eklenir. Kullanıcı verisi yalnızca RAM’de tutulur, sekme yenilenince silinir. CVE’ler IOC kütüphanesine alınmaz. Kullanıcı verisindeki eşleşmeler “Yalnızca kullanıcı verisi” olarak ayrılır.

## Güvenlik

- Tarayıcıda gizli token, API key, backend veya harici analiz isteği yoktur.
- IOC değerleri tıklanabilir bağlantı yapılmaz, otomatik ziyaret edilmez; yalnızca kopyalanır/dışa aktarılır.
- Kaynak açıklamaları React ile düz metin render edilir; HTML çalıştırılmaz. Kaynak linklerinde yalnızca credential içermeyen HTTPS kabul edilir ve `noopener noreferrer` kullanılır.
- CSV dışa aktarma PapaParse formül kaçırmasıyla formül enjeksiyonunu önler.
- Kullanıcı dosyası kaynak ilişkileri oluşturamaz. Proje STIX import aracı değildir.
- “Eşleşme yok” sonucu güvenlilik veya zararsızlık kanıtı değildir. Sistem DNS çözümlemesi, WHOIS, VirusTotal veya diğer gerçek zamanlı sorgular yapmaz.
- Uygulama harici CDN/font/script çağırmaz. Public feed’ler yalnızca Node veri işleme aşamasında indirilir.

## GitHub Pages dağıtımı

1. Bu klasörün **içeriğini** bir GitHub reposunun köküne koyun; `.github/`, `package-lock.json`, `public/` ve lisans dosyalarını da ekleyin.
2. Varsayılan dalı `main` yapın (başka dal kullanacaksanız workflow koşullarını değiştirin).
3. GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions** seçin.
4. `main` dalına push edin veya **Actions → Validate and deploy GitHub Pages → Run workflow** çalıştırın.
5. İlk başarılı çalışma sonrasında Pages adresi `https://KULLANICI.github.io/REPO/` olur. Hash yolları sayesinde doğrudan `/#actors` gibi bağlantılar yenilemede 404 üretmez.

Workflow push/PR üzerinde test ve build yapar; PR verisi ağdan yenilenmez ve dağıtılmaz. `main` üzerindeki günlük schedule **03:17 UTC / 06:17 Türkiye** saatinde kaynakları yeniler, test eder ve Pages’e dağıtır. GitHub planlanmış işleri geciktirebilir ve pasif repolarda durdurabilir. İzinler build için `contents: read`, deploy için `pages: write`/`id-token: write` ile sınırlıdır; tarayıcıya token aktarılmaz. GITHUB_TOKEN Actions tarafından otomatik sağlanır, kullanıcı API anahtarı gerektirmez.

## Dizinler

```text
src/                 Türkçe React arayüzü, analiz motoru, Cytoscape grafiği
scripts/             İndirme, normalizasyon ve veri bütünlüğü kontrolü
public/data/         Gerçek kaynaklardan işlenmiş statik snapshot
public/licenses/     Dağıtılan veri lisansları
tests/               Birim, veri bütünlüğü ve kesinti testleri
e2e/                 Masaüstü/mobil tarayıcı senaryoları
examples/            Tehdit olarak işaretlenmemiş dosya formatı örnekleri
.github/workflows/   Test, günlük veri güncelleme ve Pages deploy
```
