# 📚 Setup Guide: GitHub → Vercel

## Step 1: Persiapan di Local

### 1.1 Download semua files
Pastikan sudah punya semua file di folder:
- `package.json`
- `next.config.js`
- `vercel.json`
- `.gitignore`
- `README.md`
- `pages/index.js`
- `pages/api/qrcode.js`

### 1.2 Initialize Git
```bash
cd qris-scanner
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

### 1.3 Tambah semua files
```bash
git add .
git commit -m "Initial commit: QRIS Scanner Next.js"
```

---

## Step 2: Upload ke GitHub

### 2.1 Buat Repository di GitHub
1. Buka https://github.com/new
2. **Repository name:** `qris-scanner`
3. **Description:** `QRIS Auto Decoder - Upload/paste QRIS string`
4. **Public** ✓
5. Jangan initialize dengan README (sudah ada)
6. Klik **Create repository**

### 2.2 Push ke GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/qris-scanner.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` dengan username GitHub kamu.

### 2.3 Verify
Buka https://github.com/YOUR_USERNAME/qris-scanner
Pastikan semua files sudah ada

---

## Step 3: Deploy ke Vercel

### Option A: Via Dashboard (Recommended)

**Step 1: Login ke Vercel**
1. Buka https://vercel.com
2. Klik **Sign Up** atau **Log In**
3. Choose "Continue with GitHub"

**Step 2: Import Project**
1. Klik **Add New** → **Project**
2. Klik **Continue with GitHub**
3. Authorize Vercel
4. Search "qris-scanner"
5. Klik **Import**

**Step 3: Configure**
1. **Framework Preset:** Next.js ✓
2. **Root Directory:** ./ (leave as is)
3. Klik **Deploy**

**Step 4: Wait**
Vercel akan build & deploy otomatis
Selesai dalam ~2 menit

**Step 5: Access**
URL akan di-generate: `https://qris-scanner-xxx.vercel.app`

---

### Option B: Via CLI

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
vercel --prod
```

**Step 3: Follow prompts**
- Scope: `qris-scanner`
- Link existing: `No`
- Which directory: `.` (default)
- Settings: use defaults

**Step 4: Done!**
URL akan di-tampilkan di terminal

---

## Step 4: Testing

### Test Development
```bash
npm run dev
```

### Test Production Build
```bash
npm run build
npm start
```

### Test di Vercel
Buka URL dari Vercel dashboard

---

## Step 5: Updates & Maintenance

### Push Updates
```bash
# Edit files
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel akan **auto-deploy** setiap push ke `main` branch!

### View Logs
1. https://vercel.com/dashboard
2. Select project `qris-scanner`
3. Klik **Deployments** → pilih latest
4. View logs di **Functions**

---

## 🔗 Hasil Akhir

- 🌐 **Live URL:** `https://qris-scanner-xxx.vercel.app`
- 💻 **GitHub Repo:** `https://github.com/YOUR_USERNAME/qris-scanner`
- ⚙️ **API Endpoint:** `https://qris-scanner-xxx.vercel.app/api/qrcode`

---

## ❓ Troubleshooting

### Build Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deploy Error: "Function exceeds maximum size"
Normal, Next.js berfungsi baik untuk use case ini

### API Not Working
1. Check `/api/qrcode.js` exists
2. Test di browser console:
```javascript
fetch('/api/qrcode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ qrcode: '000201021202...' })
}).then(r => r.json()).then(console.log)
```

### Vercel Auth Issues
1. Disconnect GitHub: https://github.com/settings/installations
2. Re-authorize dan deploy ulang

---

## 📖 Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Help: https://docs.github.com

---

**✅ Selesai! Website QRIS Scanner kamu sudah live di Vercel!**

Share URL ke orang lain dan mereka bisa langsung pakai tanpa setup apapun!