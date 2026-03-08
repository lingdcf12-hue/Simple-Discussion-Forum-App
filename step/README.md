# 🎯 Forum Diskusi - Aplikasi Web Belajar

Aplikasi Forum Diskusi sederhana untuk belajar Firebase Authentication & Firestore Database dengan React dan Tailwind CSS.

![Forum Diskusi](https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop)

---

## ✨ Fitur Utama

✅ **Autentikasi User** - Login & Register dengan Firebase Auth  
✅ **Buat Thread Diskusi** - Posting topik diskusi baru  
✅ **Lihat Daftar Thread** - Browse semua thread yang ada  
✅ **Balas Thread** - Tambahkan balasan ke thread  
✅ **Real-time Updates** - Data otomatis update tanpa refresh  
✅ **Hapus Thread/Reply** - Hanya pemilik yang bisa menghapus  
✅ **Security Rules** - Keamanan data dengan Firebase Rules  
✅ **Responsive UI** - Tampilan yang menarik dengan Tailwind CSS  

---

## 🚀 Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase Firestore (NoSQL Database)
- **Authentication**: Firebase Auth
- **UI Components**: Shadcn UI + Radix UI
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Notifications**: Sonner (Toast)

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                 # UI components (Button, Card, Input, dll)
│   │   ├── LoginForm.jsx       # ✅ Form Login & Register
│   │   ├── PostForm.jsx        # ✅ Form Buat Thread Baru
│   │   ├── ReplyForm.jsx       # ✅ Form Buat Balasan
│   │   ├── ThreadCard.jsx      # ✅ Card Preview Thread
│   │   ├── ThreadDetail.jsx    # ✅ Detail Thread + Replies
│   │   └── ThreadList.jsx      # ✅ List Semua Thread
│   └── App.tsx                 # ✅ Main App Component
├── config/
│   └── firebaseConfig.js       # ✅ Konfigurasi Firebase
├── contexts/
│   └── AuthContext.jsx         # ✅ Auth Context Provider
└── styles/                     # CSS files

Dokumentasi:
├── SETUP_GUIDE.md              # 📖 Panduan Setup Lengkap
└── IMPLEMENTATION_EXAMPLES.md  # 💡 Contoh Code Implementation
```

---

## ⚡ Quick Start

### 1. Setup Firebase

Sebelum menjalankan aplikasi, Anda perlu setup Firebase terlebih dahulu:

1. **Buat Firebase Project:**
   - Buka [Firebase Console](https://console.firebase.google.com/)
   - Klik "Add Project" dan ikuti wizard

2. **Enable Firestore Database:**
   - Pilih "Firestore Database" > "Create database"
   - Pilih "Start in test mode"

3. **Enable Authentication:**
   - Pilih "Authentication" > "Get started"
   - Enable "Email/Password"

4. **Dapatkan Firebase Config:**
   - Project Settings > Your apps > Web (`</>`)
   - Copy konfigurasi Firebase

5. **Update Config File:**
   - Edit `/src/config/firebaseConfig.js`
   - Paste konfigurasi Firebase Anda
   - Ganti placeholder dengan kredensial asli

6. **Setup Security Rules:**
   - Buka Firestore Database > Rules
   - Copy-paste rules dari `/src/config/firebaseConfig.js` (di bagian comment)
   - Klik "Publish"

### 2. Jalankan Aplikasi

Aplikasi sudah siap dijalankan! 🎉

---

## 📖 Dokumentasi Lengkap

📘 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Panduan setup Firebase lengkap dengan screenshot dan troubleshooting

💡 **[IMPLEMENTATION_EXAMPLES.md](./IMPLEMENTATION_EXAMPLES.md)** - Contoh code implementation dan best practices

---

## 🗄️ Database Schema

### Collection: `users`
```
users/{userId}
  - email: string
  - displayName: string
  - createdAt: Timestamp
```

### Collection: `threads`
```
threads/{threadId}
  - title: string
  - content: string
  - authorId: string
  - authorName: string
  - createdAt: Timestamp
  - updatedAt: Timestamp
  
  replies/{replyId} (sub-collection)
    - content: string
    - authorId: string
    - authorName: string
    - createdAt: Timestamp
```

---

## 🔐 Security Rules

Aplikasi ini menggunakan Firebase Security Rules untuk melindungi data:

✅ **Read**: Semua orang bisa membaca threads dan replies  
✅ **Create**: Hanya user yang login yang bisa membuat thread/reply  
✅ **Update/Delete**: Hanya pemilik yang bisa edit/hapus data sendiri  

Rules lengkap ada di `/src/config/firebaseConfig.js` (bagian comment).

---

## 🎓 Cara Menggunakan

### 1. User Belum Login
- ✅ Bisa melihat daftar thread
- ✅ Bisa melihat detail thread & replies
- ❌ Tidak bisa membuat thread
- ❌ Tidak bisa membalas thread

### 2. User Sudah Login
- ✅ Semua akses di atas
- ✅ Bisa membuat thread baru
- ✅ Bisa membalas thread
- ✅ Bisa menghapus thread/reply milik sendiri

### 3. Flow Aplikasi

```
1. Klik "Masuk" untuk login/register
2. Setelah login, klik tab "Buat Thread"
3. Isi judul dan konten, klik "Posting Thread"
4. Thread muncul di tab "Semua Thread"
5. Klik thread untuk melihat detail
6. Tulis balasan di form yang tersedia
7. Balasan langsung muncul secara real-time
```

---

## 🛠️ Komponen Utama

### AuthContext
Context untuk mengelola state autentikasi di seluruh aplikasi.

```jsx
import { useAuth } from '../contexts/AuthContext';

const { user, login, logout, register } = useAuth();
```

### ThreadCard
Component untuk menampilkan preview thread di list.

```jsx
<ThreadCard 
  thread={threadData} 
  onClick={handleClick} 
/>
```

### PostForm
Form untuk membuat thread baru (hanya muncul jika user login).

```jsx
<PostForm onSuccess={handleSuccess} />
```

### ThreadDetail
Menampilkan detail thread lengkap dengan replies dan form reply.

```jsx
<ThreadDetail 
  threadId={thread.id} 
  onBack={handleBack} 
/>
```

---

## 🔄 Real-time Features

Aplikasi ini menggunakan Firestore real-time listeners (`onSnapshot`) untuk:

- ✅ Auto-update list thread ketika ada thread baru
- ✅ Auto-update replies ketika ada balasan baru
- ✅ Tidak perlu refresh manual

```jsx
// Contoh real-time listener
useEffect(() => {
  const q = query(collection(db, 'threads'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Data otomatis update di sini
  });
  
  return () => unsubscribe(); // Cleanup
}, []);
```

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)

---

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
✅ **Solusi**: Pastikan `apiKey` di `firebaseConfig.js` sudah benar

### Error: "Missing or insufficient permissions"
✅ **Solusi**: 
1. Cek Firebase Security Rules sudah di-publish
2. Pastikan user sudah login sebelum create/update/delete

### Thread tidak muncul
✅ **Solusi**:
1. Buka Firebase Console > Firestore > Data
2. Cek apakah data ada di collection
3. Buka Console browser dan lihat error

### Real-time tidak berfungsi
✅ **Solusi**:
1. Pastikan menggunakan `onSnapshot` bukan `getDocs`
2. Cek cleanup function (`return () => unsubscribe()`)

**Troubleshooting lengkap ada di [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 💡 Tips Belajar

1. **Pahami Firestore Data Model** - Collection seperti folder, Document seperti file JSON
2. **Pelajari Security Rules** - Mulai dari test mode, pindah ke production rules
3. **Gunakan Firebase Console** - Lihat data real-time, debug rules, monitor auth
4. **Practice!** - Coba tambah fitur edit, kategori, search, dll

---

## 📝 Next Steps - Ide Fitur Tambahan

Setelah berhasil menjalankan aplikasi, coba tambahkan fitur:

- 🏷️ **Kategori/Tags** - Kategorisasi thread
- 👍 **Like/Vote System** - User bisa like thread/reply
- 🔍 **Search** - Cari thread berdasarkan keyword
- ✏️ **Edit Thread** - Edit thread yang sudah dibuat
- 📷 **Upload Image** - Tambah gambar di thread (Firebase Storage)
- 👤 **User Profile** - Halaman profil user
- 🔔 **Notifications** - Notifikasi ketika ada reply baru
- 📊 **Analytics** - Statistik thread populer

---

## 📄 License

Project ini dibuat untuk tujuan edukasi dan pembelajaran. Bebas digunakan dan dimodifikasi.

---

## 🤝 Kontribusi

Ini adalah project pembelajaran. Silakan fork dan modifikasi sesuai kebutuhan Anda!

---

## 📧 Support

Jika ada pertanyaan atau issue, silakan buka issue di repository atau hubungi developer.

---

**Selamat Belajar! 🎉**

Made with ❤️ using React + Firebase + Tailwind CSS
