# EBIS Task Tracker 🚀

![EBIS Tracker Banner](https://img.shields.io/badge/EBIS-Task%20Tracker-1e40af?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)

**EBIS Task Tracker** adalah aplikasi web modern dan *real-time* yang dirancang khusus untuk mempermudah alur kerja antara teknisi lapangan dan manajer. Aplikasi ini menyediakan platform terpusat untuk melacak tugas/order, memantau progres teknisi, serta menganalisis performa harian melalui *dashboard* interaktif.

## ✨ Fitur Utama

### 👨‍🔧 Untuk Teknisi
- **Daftar Tugas Langsung (*Live Task Board*)**: Teknisi dapat melihat dan mengambil order pekerjaan yang masih *pending* dengan mudah.
- **Pembaruan Status (*Progress Tracking*)**: Memperbarui status secara *real-time* (`On Progress`, `Completed`, `Kendala`, `Cancel`).
- **Sistem Catatan (*Notes*)**: Menambahkan catatan khusus atau kendala yang ditemui di lapangan agar bisa langsung dilihat oleh manajer.

### 📊 Untuk Manajer
- **Dashboard *Real-Time***: Memantau seluruh operasional dari satu layar penuh.
- **Statistik Interaktif**: Visualisasi data seperti distribusi status tugas dan performa per-STO (Sentral Telepon Otomat) menggunakan grafik interaktif.
- **Pantauan Kendala**: Kolom khusus untuk memonitor kendala terbaru di lapangan serta aktivitas harian teknisi.
- **Export Lanjutan**: Mengekspor data yang sudah difilter ke dalam format Excel (`.xlsx`) yang rapi, lengkap dengan kode warna otomatis pada kolom status.

### 🔄 Sistem & Operasional
- **Import Data**: Memasukkan file JSON hasil *export* dari sistem EBIS utama secara langsung ke dalam *database*.
- **Google reCAPTCHA Enterprise**: Sistem keamanan tingkat tinggi untuk mencegah bot dan penyalahgunaan.
- **AdSense Ready**: Terintegrasi langsung dengan Google AdSense untuk monetisasi.

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework**: React 18 dengan Vite
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Backend / Database**: Firebase Realtime Database
- **Visualisasi Data (Grafik)**: Recharts
- **Pembuatan Excel**: ExcelJS
- **Ikon**: Lucide React

## 🚀 Panduan Instalasi

### Persyaratan
Pastikan Anda sudah menginstal Node.js dan npm di komputer Anda.

### Langkah-langkah

1. *Clone* repositori ini:
   ```bash
   git clone https://github.com/username-anda/ebis-task-tracker.git
   ```

2. Masuk ke dalam folder proyek:
   ```bash
   cd ebis-task-tracker
   ```

3. Instal semua dependensi:
   ```bash
   npm install
   ```

### Pengaturan Variabel Lingkungan (*Environment Variables*)

Buat sebuah file bernama `.env` di folder utama (root) proyek dan masukkan konfigurasi Anda:

```env
VITE_FIREBASE_API_KEY=api_key_firebase_anda
VITE_FIREBASE_AUTH_DOMAIN=domain_auth_firebase_anda
VITE_FIREBASE_PROJECT_ID=project_id_firebase_anda
VITE_FIREBASE_STORAGE_BUCKET=storage_bucket_firebase_anda
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id_firebase_anda
VITE_FIREBASE_APP_ID=app_id_firebase_anda
VITE_FIREBASE_DATABASE_URL=database_url_firebase_anda

# Google AdSense
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx

# Google reCAPTCHA Enterprise
VITE_RECAPTCHA_SITE_KEY=site_key_recaptcha_anda
```

### Menjalankan Aplikasi Secara Lokal

Jalankan server pengembangan Vite:
```bash
npm run dev
```

Aplikasi akan bisa diakses melalui `http://localhost:5173`.

## 📦 Panduan Deployment (Vercel)

Proyek ini sangat dioptimalkan untuk di-deploy ke **Vercel**. 
Pastikan Anda memasukkan semua variabel di dalam `.env` ke bagian **Project Settings > Environment Variables** di Vercel sebelum melakukan *deploy*.

Untuk melakukan *build* ke tahap produksi secara manual:
```bash
npm run build
```

---
*Dibuat dengan ❤️ untuk Teknisi Telkom Indonesia.*
