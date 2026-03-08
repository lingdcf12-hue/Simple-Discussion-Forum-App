# 📚 Panduan Setup & Implementasi Forum Diskusi

Aplikasi Forum Diskusi dengan Firebase Authentication & Firestore Database.

## 🎯 Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend & Database**: Firebase (Firestore & Auth)
- **UI Components**: Shadcn UI + Radix UI
- **Date Formatting**: date-fns
- **Notifications**: Sonner (Toast)

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                 # UI components (Button, Card, Input, dll)
│   │   ├── LoginForm.jsx       # Form Login & Register
│   │   ├── PostForm.jsx        # Form Buat Thread Baru
│   │   ├── ReplyForm.jsx       # Form Buat Balasan
│   │   ├── ThreadCard.jsx      # Card untuk menampilkan preview thread
│   │   ├── ThreadDetail.jsx    # Detail thread + list replies
│   │   └── ThreadList.jsx      # List semua threads
│   └── App.tsx                 # Main app component
├── config/
│   └── firebaseConfig.js       # Konfigurasi Firebase
├── contexts/
│   └── AuthContext.jsx         # Context untuk autentikasi
└── styles/
    └── ...                     # CSS files
```

---

## 🔥 Firebase Setup

### 1. Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add Project"** atau **"Tambah Project"**
3. Beri nama project (contoh: `forum-diskusi`)
4. Ikuti wizard setup hingga selesai

### 2. Enable Firestore Database

1. Di Firebase Console, pilih **"Firestore Database"** di menu kiri
2. Klik **"Create database"**
3. Pilih **"Start in test mode"** (untuk development)
4. Pilih lokasi server (pilih yang terdekat dengan lokasi Anda)
5. Klik **"Enable"**

### 3. Enable Authentication

1. Di Firebase Console, pilih **"Authentication"** di menu kiri
2. Klik **"Get started"**
3. Pilih tab **"Sign-in method"**
4. Enable **"Email/Password"**
5. Klik **"Save"**

### 4. Dapatkan Firebase Config

1. Di Firebase Console, klik ikon ⚙️ (Settings) > **"Project settings"**
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik icon **Web** (`</>`)
4. Register app dengan nama (contoh: `forum-web`)
5. Copy konfigurasi yang diberikan
6. Paste ke file `/src/config/firebaseConfig.js`

**Contoh konfigurasi:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",
  authDomain: "forum-diskusi.firebaseapp.com",
  projectId: "forum-diskusi",
  storageBucket: "forum-diskusi.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 5. Setup Firebase Security Rules

1. Di Firebase Console, pilih **"Firestore Database"**
2. Pilih tab **"Rules"**
3. Copy-paste rules di bawah ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function untuk cek apakah user sudah login
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function untuk cek apakah user adalah pemilik resource
    function isOwner(authorId) {
      return isSignedIn() && request.auth.uid == authorId;
    }
    
    // Rules untuk collection users
    match /users/{userId} {
      // Semua orang bisa membaca profil user
      allow read: if true;
      // Hanya user yang login yang bisa membuat profil sendiri
      allow create: if isSignedIn() && request.auth.uid == userId;
      // Hanya pemilik yang bisa update/delete profil sendiri
      allow update, delete: if isOwner(userId);
    }
    
    // Rules untuk collection threads
    match /threads/{threadId} {
      // Semua orang bisa membaca threads
      allow read: if true;
      // Hanya user yang login yang bisa membuat thread
      allow create: if isSignedIn() 
        && request.resource.data.authorId == request.auth.uid;
      // Hanya pemilik thread yang bisa update/delete
      allow update, delete: if isOwner(resource.data.authorId);
      
      // Rules untuk sub-collection replies
      match /replies/{replyId} {
        // Semua orang bisa membaca replies
        allow read: if true;
        // Hanya user yang login yang bisa membuat reply
        allow create: if isSignedIn() 
          && request.resource.data.authorId == request.auth.uid;
        // Hanya pemilik reply yang bisa update/delete
        allow update, delete: if isOwner(resource.data.authorId);
      }
    }
  }
}
```

4. Klik **"Publish"**

---

## 🗄️ Struktur Database Firestore

### Collection: `users`

```
users/
  {userId}/
    - email: string
    - displayName: string
    - createdAt: Timestamp
```

**Contoh Document:**
```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": Timestamp(2026-03-03 10:30:00)
}
```

### Collection: `threads`

```
threads/
  {threadId}/
    - title: string
    - content: string
    - authorId: string (reference ke users)
    - authorName: string
    - createdAt: Timestamp
    - updatedAt: Timestamp
    
    replies/ (sub-collection)
      {replyId}/
        - content: string
        - authorId: string
        - authorName: string
        - createdAt: Timestamp
```

**Contoh Thread Document:**
```json
{
  "title": "Cara belajar React untuk pemula?",
  "content": "Halo semua! Saya baru mulai belajar React. Ada yang bisa kasih tips?",
  "authorId": "abc123xyz",
  "authorName": "John Doe",
  "createdAt": Timestamp(2026-03-03 10:30:00),
  "updatedAt": Timestamp(2026-03-03 10:30:00)
}
```

**Contoh Reply Document:**
```json
{
  "content": "Saya sarankan mulai dari dokumentasi resmi React!",
  "authorId": "def456uvw",
  "authorName": "Jane Smith",
  "createdAt": Timestamp(2026-03-03 11:00:00)
}
```

---

## 🔐 Fitur Autentikasi

### Auth Context (`/src/contexts/AuthContext.jsx`)

Context ini menyediakan:

- **State:**
  - `user` - Object user yang sedang login (null jika belum login)
  - `loading` - Boolean untuk loading state

- **Functions:**
  - `register(email, password, displayName)` - Daftar user baru
  - `login(email, password)` - Login user
  - `logout()` - Logout user

### Cara Menggunakan Auth Context

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, register } = useAuth();
  
  // Cek apakah user sudah login
  if (user) {
    return <p>Welcome, {user.displayName}!</p>;
  }
  
  return <p>Please login</p>;
}
```

---

## 📝 Komponen UI Utama

### 1. LoginForm.jsx

**Fungsi:** Form untuk login dan register

**Props:**
- `onClose` - Callback ketika form selesai/ditutup

**Fitur:**
- Toggle antara mode Login dan Register
- Validasi input (email, password min 6 karakter)
- Error handling dengan toast notification

### 2. ThreadCard.jsx

**Fungsi:** Menampilkan card preview thread

**Props:**
- `thread` - Object data thread
- `onClick` - Callback ketika card diklik

**Menampilkan:**
- Title thread
- Excerpt content (150 karakter pertama)
- Nama author
- Waktu posting (relative time)

### 3. PostForm.jsx

**Fungsi:** Form untuk membuat thread baru

**Props:**
- `onSuccess` - Callback setelah berhasil posting

**Fitur:**
- Hanya muncul jika user sudah login
- Input: title (max 200 char) dan content
- Character counter
- Validasi form

### 4. ThreadDetail.jsx

**Fungsi:** Menampilkan detail thread + list replies

**Props:**
- `threadId` - ID thread yang akan ditampilkan
- `onBack` - Callback untuk kembali ke list

**Fitur:**
- Menampilkan full content thread
- Real-time updates untuk replies
- Form untuk menambah reply
- Tombol delete (hanya muncul untuk pemilik)

### 5. ThreadList.jsx

**Fungsi:** Menampilkan daftar semua thread

**Props:**
- `onThreadClick` - Callback ketika thread diklik

**Fitur:**
- Real-time updates menggunakan `onSnapshot`
- Diurutkan berdasarkan waktu (terbaru dulu)
- Loading state

### 6. ReplyForm.jsx

**Fungsi:** Form untuk membuat balasan

**Props:**
- `threadId` - ID thread yang akan dibalas
- `onSuccess` - Callback setelah berhasil

**Fitur:**
- Hanya muncul jika user sudah login
- Textarea untuk input balasan

---

## 🔄 Data Fetching & Real-time Updates

### Menggunakan `onSnapshot` untuk Real-time

**Contoh di ThreadList:**

```jsx
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

useEffect(() => {
  // Query untuk semua threads
  const threadsRef = collection(db, 'threads');
  const q = query(threadsRef, orderBy('createdAt', 'desc'));

  // Setup real-time listener
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const threadsData = [];
    snapshot.forEach((doc) => {
      threadsData.push({ id: doc.id, ...doc.data() });
    });
    setThreads(threadsData);
  });

  // Cleanup saat unmount
  return () => unsubscribe();
}, []);
```

**Keuntungan Real-time:**
- Data otomatis update ketika ada perubahan di Firestore
- Tidak perlu manual refresh
- User langsung melihat thread/reply baru

---

## ✅ Keamanan (Security Rules)

### Prinsip Security Rules:

1. **Read Access (Baca):**
   - ✅ Semua orang bisa membaca threads dan replies
   - ✅ Semua orang bisa membaca profil user

2. **Create Access (Buat):**
   - ✅ Hanya user yang login yang bisa membuat thread
   - ✅ Hanya user yang login yang bisa membuat reply
   - ✅ `authorId` harus sama dengan `request.auth.uid`

3. **Update/Delete Access:**
   - ✅ Hanya pemilik yang bisa edit/hapus thread sendiri
   - ✅ Hanya pemilik yang bisa edit/hapus reply sendiri
   - ✅ Validasi berdasarkan `resource.data.authorId`

### Testing Security Rules

Di Firebase Console > Firestore > Rules, ada tab **"Rules Playground"** untuk testing.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Firebase Config:**
   - Edit `/src/config/firebaseConfig.js`
   - Ganti dengan kredensial Firebase Anda

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Buka Browser:**
   - Buka `http://localhost:5173`

---

## 📖 Flow Aplikasi

### 1. User Belum Login

- User melihat daftar thread (read-only)
- Klik thread untuk melihat detail + replies
- Tidak bisa membuat thread atau reply
- Tombol "Masuk" untuk login/register

### 2. User Sudah Login

- User melihat daftar thread
- Bisa membuat thread baru (tab "Buat Thread")
- Bisa membalas thread
- Bisa menghapus thread/reply milik sendiri
- Tombol "Keluar" untuk logout

### 3. Real-time Collaboration

- Ketika user A membuat thread, user B langsung melihatnya
- Ketika user A membalas thread, user B langsung melihat reply baru
- Tidak perlu refresh manual

---

## 🎨 Customization

### Mengubah Warna/Theme

Edit file `/src/styles/theme.css` untuk mengubah color tokens.

### Menambahkan Fitur Like/Vote

Tambahkan field `likes: number` di thread/reply document, lalu buat fungsi untuk increment/decrement.

### Menambahkan Avatar User

Gunakan Firebase Storage untuk upload gambar avatar, lalu simpan URL di user document.

---

## 📚 Resources & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"

**Solusi:** Pastikan `apiKey` di `firebaseConfig.js` sudah benar.

### Error: "Missing or insufficient permissions"

**Solusi:** 
1. Cek Firebase Security Rules sudah di-publish
2. Pastikan user sudah login sebelum create/update/delete

### Thread/Reply tidak muncul

**Solusi:**
1. Buka Firebase Console > Firestore > Data
2. Cek apakah data ada di collection
3. Cek Console browser untuk error

### Real-time tidak berfungsi

**Solusi:**
1. Pastikan menggunakan `onSnapshot` bukan `getDocs`
2. Cek cleanup function (`return () => unsubscribe()`)

---

## 📝 Tips Belajar

1. **Pahami Firestore Data Model:**
   - Collection = folder
   - Document = file JSON
   - Sub-collection = folder di dalam document

2. **Pelajari Security Rules:**
   - Mulai dari test mode
   - Pindah ke production rules setelah paham

3. **Gunakan Console Firebase:**
   - Lihat data real-time di tab "Data"
   - Debug rules di "Rules Playground"
   - Monitor auth di "Authentication"

4. **Practice:**
   - Coba tambah fitur edit thread
   - Tambah kategori/tags
   - Implementasi search

---

**Selamat Belajar! 🎉**

Jika ada pertanyaan, silakan buka issue atau hubungi developer.
