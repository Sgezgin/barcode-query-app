# Barcode Query System

Modern ve kullanıcı dostu bir Carrier Label sorgulama sistemi. Next.js ile geliştirilmiş, gerçek zamanlı API entegrasyonu ile çalışır.

## 🚀 Özellikler

### 🔐 Güvenli Giriş Sistemi
- Admin paneli ile giriş
- Kullanıcı adı ve şifre güncelleme
- Oturum yönetimi

### 📊 Sorgulama Seçenekleri
- **Tek Sorgulama**: Manuel carrier label girişi
- **Toplu Sorgulama**: Excel/TXT dosya yükleme
- Otomatik 20 karakter filtresi
- Gerçek zamanlı API sorguları

### 📈 Sonuç Yönetimi
- Detaylı sonuç görüntüleme
- Filtreleme ve arama
- Excel/TXT export
- İstatistiksel özetler

### 🎨 Modern Tasarım
- Glassmorphism efektleri
- Responsive tasarım
- Smooth animasyonlar
- Dark mode tema

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn

## 🛠️ Kurulum

1. **Proje klasörünü oluşturun:**
```bash
mkdir barcode-query-app
cd barcode-query-app
```

2. **Package.json dosyasını oluşturun ve bağımlılıkları yükleyin:**
```bash
npm init -y
npm install next@14.0.0 react@^18 react-dom@^18 lucide-react@^0.263.1 xlsx@^0.18.5
npm install -D autoprefixer@^10 eslint@^8 eslint-config-next@14.0.0 postcss@^8 tailwindcss@^3
```

3. **Tüm dosyaları ilgili klasörlere kopyalayın**

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

5. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 📁 Proje Yapısı

```
barcode-query-app/
├── components/
│   ├── Header.js          # Ana başlık ve ayarlar
│   ├── LoginForm.js       # Giriş formu
│   ├── Navigation.js      # Tab navigasyonu
│   ├── QueryTab.js        # Tek sorgulama
│   ├── ResultsTab.js      # Sonuçlar
│   └── UploadTab.js       # Dosya yükleme
├── pages/
│   ├── api/
│   │   └── query-barcode.js # API endpoint
│   ├── _app.js            # Next.js app wrapper
│   └── index.js           # Ana sayfa
├── styles/
│   └── globals.css        # Global CSS ve Tailwind
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔧 Konfigürasyon

### API Ayarları

API bilgileri `pages/api/query-barcode.js` dosyasında bulunur:

```javascript
const username = 'PTSUser92112';
const password = 'PsT12+aX1127y';
const apiUrl = 'https://einvoice.alliance-healthcare.com.tr/PTS_Proxy/api/getbarcodes';
```

### Varsayılan Giriş Bilgileri

```
Kullanıcı Adı: admin
Şifre: admin
```

## 🎯 Kullanım

### Tek Sorgulama
1. "Tek Sorgulama" sekmesine gidin
2. 20 karakterlik carrier label girin
3. "Sorgula" butonuna tıklayın

### Toplu Sorgulama
1. "Toplu Sorgulama" sekmesine gidin
2. Excel (.xlsx) veya TXT dosyası yükleyin
3. "Toplu Sorgulama Başlat" butonuna tıklayın

### Sonuçları Görüntüleme
1. "Sonuçlar" sekmesine gidin
2. Filtreleme ve arama yapın
3. Excel veya TXT olarak export edin

## 📊 Desteklenen Dosya Formatları

### Excel Files (.xlsx)
- Tüm sayfalar taranır
- 20 karakterlik sayısal veriler otomatik algılanır
- Duplicate veriler temizlenir

### Text Files (.txt)
- Her satır ayrı kontrol edilir
- Sadece 20 karakterlik sayısal veriler alınır

## 🔒 Güvenlik

- API anahtarları server-side'da saklanır
- CORS koruması aktif
- Input validation
- XSS koruması

## 📱 Responsive Design

- Mobil uyumlu tasarım
- Tablet optimizasyonu
- Desktop tam desteği

## 🎨 Tema ve Tasarım

- **Renk Paleti**: Indigo-Purple gradient
- **Efektler**: Glassmorphism, backdrop blur
- **Animasyonlar**: Fade-in, slide-up, hover effects
- **İkonlar**: Lucide React icon seti

## 🚀 Production Build

```bash
npm run build
npm start
```

## 🔧 Özelleştirme

### Tema Değiştirme
`styles/globals.css` dosyasındaki CSS değişkenlerini düzenleyin.

### API Endpoint Değiştirme
`pages/api/query-barcode.js` dosyasındaki URL ve credentials'ları güncelleyin.

### Yeni Özellik Ekleme
Components klasöründe yeni bileşenler oluşturup `pages/index.js`'e entegre edin.

## 📝 Notlar

- API rate limiting için sorgular arasında 200ms bekleme
- Maksimum 20 karakter carrier label desteği
- Otomatik duplicate temizleme
- Memory-based storage (veri tabanı yok)

## 🐛 Bilinen Sorunlar

- CORS hatası durumunda API proxy kullanılabilir
- Büyük dosyalar için memory limitasyonu
- Browser storage yerine memory kullanımı

## 📞 Destek

Herhangi bir sorun için GitHub issues kullanın veya iletişime geçin.