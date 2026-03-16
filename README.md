# 📸 QRIS Auto Decoder

QRIS Scanner dengan Next.js - Upload/paste QRIS → Otomatis decode string → Siap kirim ke API

## 🚀 Fitur

- ✏️ **Paste String QRIS** - Direct input dari aplikasi
- 📤 **Upload Gambar** - Support PNG, JPG, GIF, WebP
- 🔍 **Auto Decode** - Parse TLV format otomatis
- ⚙️ **API Config** - Setup custom endpoint & format
- 🚀 **Send to API** - One-click send hasil QRIS
- 📊 **History** - Track semua decoded QRIS
- 💾 **LocalStorage** - Config & history tersimpan

## 🏃 Quick Start

### 1. Clone / Download
```bash
git clone <your-repo-url>
cd qris-scanner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development
```bash
npm run dev
```

Buka http://localhost:3000

### 4. Build untuk Production
```bash
npm run build
npm start
```

## 🌐 Deploy ke Vercel

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: GitHub Integration
1. Push ke GitHub
2. Connect repo ke https://vercel.com
3. Auto-deploy setiap push

## 📁 Project Structure

```
qris-scanner/
├── pages/
│   ├── index.js          # Main page
│   └── api/
│       └── qrcode.js     # API route untuk decode
├── package.json
├── next.config.js
├── .gitignore
└── README.md
```

## 🔧 API Endpoint

### POST `/api/qrcode`

**Request:**
```json
{
  "qrcode": "000201021202..."
}
```

**Response:**
```json
{
  "success": true,
  "qrcode": "000201021202...",
  "decoded": {
    "00": {
      "name": "Payload Format Indicator",
      "value": "01",
      "length": 2
    },
    ...
  },
  "length": 248,
  "tagCount": 12,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Use Cases

1. **Batch Processing** - Decode banyak QRIS sekaligus
2. **API Integration** - Send hasil ke sistem backend
3. **Data Analysis** - Extract & analyze QRIS data
4. **QR Scanning** - Upload screenshot QRIS langsung

## 🔐 Keamanan

- All processing berjalan di server (API route)
- No external API calls ke pihak ketiga
- LocalStorage hanya untuk config & history
- CORS headers diatur untuk flexibility

## 📝 TODO / Future

- [ ] Real QR image detection (computer vision)
- [ ] Batch import CSV
- [ ] Export results ke Excel
- [ ] Database integration
- [ ] User authentication
- [ ] Analytics dashboard

## 🤝 Contributing

Fork, modify, submit PR!

## 📄 License

MIT

## 📞 Support

Buka issue di GitHub untuk pertanyaan

---

**Made with ❤️ untuk QRIS Indonesia**