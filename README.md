# MCC Korsini MES Prototipi

MCC Korsini bitirme hattı için üretim takip (MES) tasarım prototipi. MCC'nin resmi sistemi değildir; iş emirleri, kamera, kalite ve bakım kayıtları örnektir. Veriler tarayıcı belleğinde (localStorage) tutulur; "Örnek veriye dön" ile sıfırlanır.

## Modüller
- Üretim: Prosesler (Baskı ve Kesim "Yakında"), Makinelerim (Bitirme-1…5), Planlama
- Kalite: kamera hata analizi, uygunsuzluklar, hatalı koliler
- Bakım: arıza talepleri, periyodik bakım planı
- Takip: aksiyonlar, akıllı otomasyonlar
- Yönetim: ayarlar (kullanıcılar ve yetkiler, makineler, ürünler, duruş nedenleri, hata kodları, iş kuralları, vardiyalar, denetim izi)

## Yapı
- `src/`: kaynak kod (`app.js`, `app.css`, `logo.svg`) ve derleme betiği
- `docs/`: yayınlanan site (GitHub Pages bu klasörden yayınlar)

## Derleme
`python3 src/build.py docs/index.html`
