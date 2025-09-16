# 📅 EventApp  

EventApp adalah aplikasi manajemen event fullstack yang saya buat sebagai bagian dari course online.  
Aplikasi ini membantu pengguna (admin & member) untuk membuat, mengelola, dan mengikuti event dengan sistem tiket digital dan pembayaran online.  

---

## 🚀 Fitur Utama  

### 👨‍💻 Admin  
- 🗓️ **CRUD Event** → buat, edit, hapus, dan kelola event  
- 🏷️ **CRUD Kategori Event** → atur kategori event  
- 🎟️ **CRUD Ticket** → kelola tiket (harga, kuota, status)  
- 🖼️ **CRUD Banner** → pasang banner promosi event  

### 🙋 Member  
- 🔍 **Lihat Event** → telusuri event berdasarkan kategori atau tanggal  
- 🎟️ **Beli Tiket** → pesan tiket dengan integrasi pembayaran Midtrans  
- 📂 **Riwayat Pemesanan** → cek daftar tiket yang sudah dibeli  

---

## 🎯 Tujuan Project

### Project ini dibuat sebagai:
- 💡 Latihan fullstack dari course online
- 🏗️ Portfolio pribadi untuk menunjukkan skill modern web dev
- 📚 Pembelajaran dalam membangun aplikasi web modern dan mempelajari teknologi tersebut

---

## 🖼️ Preview  
(Sisipkan screenshot di sini, contoh:)  
![EventApp Screenshot](./screenshot.png)  

---

## 🛠️ Tech Stack   

### ⚙️ Backend  
- **Express JS** → Backend Framework  
- **MongoDB + Mongoose** → Database & ODM  
- **Swagger** → API Documentation  
- **Yup** → Data Validation  
- **Nodemailer + Zoho SMTP** → Email Notification  
- **JWT (JSON Web Token)** → Authentication & Authorization  
- **EJS** → Template Engine  
- **Cloudinary** → Cloud Storage untuk gambar/banner  

---

## ⚙️ Cara Menjalankan  

### 1. Clone repository  
```bash
git clone https://github.com/username/eventapp.git
cd eventapp
```
### 2. Install Dependencies 
```bash
npm install
```
### 3. Jalankan server
```bash
npm run dev
```
---

Untuk yang frontend, github nya ada di sini: https://github.com/FarrelSZ/Frontend-event-app

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
