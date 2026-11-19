# MCC Korsini MES Prototipi

MCC Korsini (Türkiye) paketleme prosesi için üretim takip (MES) tasarım prototipi. MCC'nin resmi sistemi değildir; iş emirleri, kamera, kalite ve bakım kayıtları örnektir. Veriler tarayıcı belleğinde (localStorage) tutulur; "Örnek veriye dön" ile sıfırlanır.

## Modüller
- Üretim: Prosesler (Baskı ve Kesim "Yakında"), Makinelerim (Bitirme-1…5), Planlama (Pakon iş emirleri Excel ile yüklenir, takım lideri Bitirme makinelerine atar), Vardiya Sayı Raporu
- Makine detayı: koparma kontrol formu, kamera sonuçları (makinenin IP adresinden sipariş bazlı sorgu, koli görüntüleri), 2 saatlik üretim panosu, Pakon üretim takip formu
- Kalite: kamera hata analizi, Pakon bozuk nedenleri, önceki prosesten gelen uygunsuzluklar, uygunsuzluklar, hatalı koliler
- Bakım: arıza talepleri, periyodik bakım planı
- Takip: aksiyonlar, akıllı otomasyonlar
- Yönetim: ayarlar (kullanıcılar ve yetkiler, makineler, ürünler, duruş nedenleri, hata kodları, iş kuralları, vardiyalar, denetim izi)

## Yapı
- `src/`: kaynak kod (`app.js`, `app.css`, `logo.svg`) ve derleme betiği
- `docs/`: yayınlanan site (GitHub Pages bu klasörden yayınlar)

## Derleme
`python3 src/build.py docs/index.html`
