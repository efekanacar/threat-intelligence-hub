# Threat Intelligence Hub

**[Web sitesini aç →](https://efekanacar.github.io/threat-intelligence-hub/)**

Şüpheli IOC’leri kontrol etmek ve tehditleri araştırmak için Türkçe bir araç. Kurulum, hesap veya API anahtarı gerekmez. Siteyi bilgisayarınızdan ya da telefonunuzdan açmanız yeterli.

## Nasıl kullanırım?

- **IOC Kontrolü:** Log veya IOC listesi yapıştırın, **Kontrol Et** düğmesine basın. CSV/JSON dosyası da yükleyebilirsiniz.
- **IOC Listesi:** IP, domain, URL veya hash arayın. Sonuca tıklayarak kaynağını ve varsa görülme tarihlerini inceleyin. Sonuçları indirebilirsiniz.
- **MITRE ATT&CK:** Teknik adı veya `T1059` gibi teknik numarası arayın; açıklamayı ve ilişkili grupları görün.

**Diğer araçlar** menüsünde tehdit aktörleri, ilişki haritası ve veri kaynakları bulunur.

## Sonuçlar ne anlama geliyor?

- **Açık kaynak eşleşmesi:** Gösterge, yüklü kaynaklardan birinde bulunuyor. Ayrıntılardan kaynağı inceleyin.
- **Eşleşme yok:** Yüklü verilerde bulunamadı. Bu, göstergenin güvenli olduğu anlamına gelmez.
- **Yalnızca kullanıcı verisi:** Kendi eklediğiniz listede bulunuyor; bağımsız olarak doğrulanmış değil.

## Bilmeniz gerekenler

Veriler MITRE ATT&CK, IPsum ve Feodo Tracker’dan gelir; her gün otomatik güncellenir. Bir kaynağa ulaşılamazsa önceki veriler korunur. Canlı sorgu yapılmaz.

Yüklediğiniz dosyalar dışarı gönderilmez. Eklediğiniz kullanıcı verileri sayfa yenilenince silinir. CVE ifadeleri ayrıştırılır, ancak CVE veri kaynağı bulunmaz. İlişki haritasında yalnızca kaynakların belirttiği bağlantılar gösterilir.

Kaynakların gerekli kullanım koşulları ve atıfları korunur: [MITRE](public/licenses/MITRE.txt), [IPsum](public/licenses/IPsum.txt), [Feodo Tracker](https://feodotracker.abuse.ch/blocklist/#tos). Proje MITRE tarafından desteklenmiş veya onaylanmış değildir.

[Güncelleme durumu](https://github.com/efekanacar/threat-intelligence-hub/actions/workflows/pages.yml) · [Geliştiriciler için teknik notlar](docs/TECHNICAL.md)
