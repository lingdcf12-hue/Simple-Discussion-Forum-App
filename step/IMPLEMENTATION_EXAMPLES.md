# 💡 Contoh Implementasi & Code Examples

Panduan praktis untuk menggunakan komponen dan fungsi dalam aplikasi Forum Diskusi.

---

## 🔐 1. Implementasi Autentikasi

### Contoh 1: Register User Baru

```jsx
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

function RegisterExample() {
  const { register } = useAuth();
  
  const handleRegister = async () => {
    const result = await register(
      'user@example.com',
      'password123',
      'John Doe'
    );
    
    if (result.success) {
      toast.success('Registrasi berhasil!');
      console.log('User:', result.user);
    } else {
      toast.error(result.error);
    }
  };
  
  return <button onClick={handleRegister}>Daftar</button>;
}
```

### Contoh 2: Login User

```jsx
import { useAuth } from '../contexts/AuthContext';

function LoginExample() {
  const { login, user } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(
      'user@example.com',
      'password123'
    );
    
    if (result.success) {
      console.log('Logged in as:', result.user.displayName);
    }
  };
  
  // Cek status login
  if (user) {
    return <p>Welcome, {user.displayName}!</p>;
  }
  
  return <button onClick={handleLogin}>Login</button>;
}
```

### Contoh 3: Protected Component

```jsx
import { useAuth } from '../contexts/AuthContext';

function ProtectedComponent() {
  const { user } = useAuth();
  
  // Redirect atau tampilkan pesan jika belum login
  if (!user) {
    return (
      <div>
        <p>Anda harus login untuk mengakses halaman ini</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Halaman Protected</h2>
      <p>Hanya user yang login bisa melihat ini</p>
    </div>
  );
}
```

---

## 📝 2. Operasi CRUD Firestore

### Contoh 1: Create Thread

```jsx
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

function CreateThreadExample() {
  const { user } = useAuth();
  
  const createThread = async () => {
    if (!user) {
      alert('Anda harus login');
      return;
    }
    
    try {
      const threadsRef = collection(db, 'threads');
      
      const newThread = {
        title: 'Judul Thread Saya',
        content: 'Konten thread yang lebih panjang...',
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(threadsRef, newThread);
      console.log('Thread created with ID:', docRef.id);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return <button onClick={createThread}>Buat Thread</button>;
}
```

### Contoh 2: Read Threads (One-time)

```jsx
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useEffect, useState } from 'react';

function ReadThreadsExample() {
  const [threads, setThreads] = useState([]);
  
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threadsRef = collection(db, 'threads');
        const q = query(threadsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const threadsData = [];
        snapshot.forEach((doc) => {
          threadsData.push({ id: doc.id, ...doc.data() });
        });
        
        setThreads(threadsData);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchThreads();
  }, []);
  
  return (
    <div>
      {threads.map(thread => (
        <div key={thread.id}>
          <h3>{thread.title}</h3>
          <p>{thread.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### Contoh 3: Real-time Listener

```jsx
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useEffect, useState } from 'react';

function RealtimeThreadsExample() {
  const [threads, setThreads] = useState([]);
  
  useEffect(() => {
    // Setup query
    const threadsRef = collection(db, 'threads');
    const q = query(threadsRef, orderBy('createdAt', 'desc'));
    
    // Setup real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = [];
      snapshot.forEach((doc) => {
        threadsData.push({ id: doc.id, ...doc.data() });
      });
      setThreads(threadsData);
      console.log('Threads updated:', threadsData.length);
    });
    
    // Cleanup: unsubscribe ketika component unmount
    return () => unsubscribe();
  }, []);
  
  return (
    <div>
      <h2>Live Threads ({threads.length})</h2>
      {threads.map(thread => (
        <div key={thread.id}>{thread.title}</div>
      ))}
    </div>
  );
}
```

### Contoh 4: Update Thread

```jsx
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

function UpdateThreadExample({ threadId }) {
  const { user } = useAuth();
  
  const updateThread = async () => {
    if (!user) return;
    
    try {
      const threadRef = doc(db, 'threads', threadId);
      
      await updateDoc(threadRef, {
        title: 'Judul Baru',
        content: 'Konten yang sudah diupdate',
        updatedAt: serverTimestamp()
      });
      
      console.log('Thread updated successfully');
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };
  
  return <button onClick={updateThread}>Update Thread</button>;
}
```

### Contoh 5: Delete Thread

```jsx
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

function DeleteThreadExample({ threadId }) {
  const deleteThread = async () => {
    // Konfirmasi dulu
    if (!window.confirm('Yakin ingin menghapus?')) return;
    
    try {
      await deleteDoc(doc(db, 'threads', threadId));
      console.log('Thread deleted successfully');
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };
  
  return <button onClick={deleteThread}>Hapus Thread</button>;
}
```

### Contoh 6: Create Reply (Sub-collection)

```jsx
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

function CreateReplyExample({ threadId }) {
  const { user } = useAuth();
  
  const createReply = async () => {
    if (!user) return;
    
    try {
      // Reference ke sub-collection 'replies' di dalam thread
      const repliesRef = collection(db, 'threads', threadId, 'replies');
      
      const newReply = {
        content: 'Ini adalah balasan saya',
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp()
      };
      
      await addDoc(repliesRef, newReply);
      console.log('Reply created successfully');
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };
  
  return <button onClick={createReply}>Balas</button>;
}
```

### Contoh 7: Read Replies (Real-time)

```jsx
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useEffect, useState } from 'react';

function RepliesListExample({ threadId }) {
  const [replies, setReplies] = useState([]);
  
  useEffect(() => {
    if (!threadId) return;
    
    // Query ke sub-collection
    const repliesRef = collection(db, 'threads', threadId, 'replies');
    const q = query(repliesRef, orderBy('createdAt', 'asc'));
    
    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repliesData = [];
      snapshot.forEach((doc) => {
        repliesData.push({ id: doc.id, ...doc.data() });
      });
      setReplies(repliesData);
    });
    
    return () => unsubscribe();
  }, [threadId]);
  
  return (
    <div>
      <h3>Balasan ({replies.length})</h3>
      {replies.map(reply => (
        <div key={reply.id}>
          <p><strong>{reply.authorName}</strong></p>
          <p>{reply.content}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 3. Query & Filtering

### Contoh 1: Filter berdasarkan Author

```jsx
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

async function getThreadsByAuthor(authorId) {
  const threadsRef = collection(db, 'threads');
  const q = query(threadsRef, where('authorId', '==', authorId));
  
  const snapshot = await getDocs(q);
  const threads = [];
  snapshot.forEach((doc) => {
    threads.push({ id: doc.id, ...doc.data() });
  });
  
  return threads;
}

// Penggunaan
const myThreads = await getThreadsByAuthor(user.uid);
```

### Contoh 2: Limit & Pagination

```jsx
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

async function getLatestThreads(limitCount = 10) {
  const threadsRef = collection(db, 'threads');
  const q = query(
    threadsRef, 
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const threads = [];
  snapshot.forEach((doc) => {
    threads.push({ id: doc.id, ...doc.data() });
  });
  
  return threads;
}

// Penggunaan
const latestThreads = await getLatestThreads(5); // Ambil 5 thread terbaru
```

### Contoh 3: Compound Query

```jsx
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

async function getRecentThreadsByAuthor(authorId) {
  const threadsRef = collection(db, 'threads');
  
  // Query dengan multiple conditions
  const q = query(
    threadsRef,
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const threads = [];
  snapshot.forEach((doc) => {
    threads.push({ id: doc.id, ...doc.data() });
  });
  
  return threads;
}
```

---

## 📅 4. Working with Timestamps

### Contoh 1: Format Timestamp

```jsx
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Baru saja';
  
  try {
    // Convert Firestore Timestamp ke Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Format 1: Relative time (2 jam yang lalu)
    const relativeTime = formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: id 
    });
    
    // Format 2: Absolute time (3 Maret 2026, 10:30)
    const absoluteTime = format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    
    return relativeTime; // atau absoluteTime
  } catch (error) {
    return 'Waktu tidak valid';
  }
}

// Penggunaan di component
function ThreadExample({ thread }) {
  return (
    <div>
      <h3>{thread.title}</h3>
      <p>Posted {formatTimestamp(thread.createdAt)}</p>
    </div>
  );
}
```

---

## 🎨 5. UI Component Examples

### Contoh 1: Conditional Rendering berdasarkan Auth

```jsx
import { useAuth } from '../contexts/AuthContext';

function ConditionalExample() {
  const { user } = useAuth();
  
  return (
    <div>
      {user ? (
        // Tampilan untuk user yang sudah login
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button>Logout</button>
        </div>
      ) : (
        // Tampilan untuk user yang belum login
        <div>
          <p>Please login to continue</p>
          <button>Login</button>
        </div>
      )}
    </div>
  );
}
```

### Contoh 2: Show/Hide Delete Button

```jsx
import { useAuth } from '../contexts/AuthContext';
import { Trash2 } from 'lucide-react';

function ThreadWithDelete({ thread }) {
  const { user } = useAuth();
  
  // Cek apakah user adalah pemilik thread
  const isOwner = user && thread.authorId === user.uid;
  
  return (
    <div>
      <h3>{thread.title}</h3>
      <p>{thread.content}</p>
      
      {/* Delete button hanya muncul jika user adalah pemilik */}
      {isOwner && (
        <button onClick={() => deleteThread(thread.id)}>
          <Trash2 className="w-4 h-4" />
          Hapus
        </button>
      )}
    </div>
  );
}
```

---

## 🔔 6. Toast Notifications

### Contoh Penggunaan Toast

```jsx
import { toast } from 'sonner';

// Success toast
toast.success('Thread berhasil dibuat!');

// Error toast
toast.error('Gagal menghapus thread');

// Info toast
toast.info('Thread sedang diproses...');

// Warning toast
toast.warning('Anda belum login');

// Promise toast (untuk async operations)
toast.promise(
  createThread(),
  {
    loading: 'Membuat thread...',
    success: 'Thread berhasil dibuat!',
    error: 'Gagal membuat thread'
  }
);

// Custom toast dengan action
toast.success('Thread berhasil dibuat!', {
  action: {
    label: 'Lihat',
    onClick: () => console.log('View thread')
  }
});
```

---

## 🛡️ 7. Error Handling

### Contoh Error Handling yang Baik

```jsx
async function createThreadWithErrorHandling() {
  try {
    const threadsRef = collection(db, 'threads');
    const newThread = { /* ... */ };
    
    const docRef = await addDoc(threadsRef, newThread);
    
    toast.success('Thread berhasil dibuat!');
    return { success: true, id: docRef.id };
  } catch (error) {
    // Log error untuk debugging
    console.error('Error creating thread:', error);
    
    // Tampilkan pesan error yang user-friendly
    if (error.code === 'permission-denied') {
      toast.error('Anda tidak memiliki izin untuk membuat thread');
    } else if (error.code === 'unauthenticated') {
      toast.error('Anda harus login terlebih dahulu');
    } else {
      toast.error('Terjadi kesalahan: ' + error.message);
    }
    
    return { success: false, error: error.message };
  }
}
```

---

## 🧪 8. Testing in Firebase Console

### Cara Test di Firebase Console

1. **Test Create Thread:**
   - Buka Firestore > Data
   - Klik "Start collection"
   - Collection ID: `threads`
   - Document ID: (auto-generate)
   - Fields:
     ```
     title: string - "Test Thread"
     content: string - "Test content"
     authorId: string - "test123"
     authorName: string - "Test User"
     createdAt: timestamp - (now)
     ```

2. **Test Security Rules:**
   - Buka Firestore > Rules > Rules Playground
   - Pilih operation: `get`, `list`, `create`, dll
   - Path: `/threads/abc123`
   - Authenticated: Yes/No
   - Run test

---

## 💡 9. Best Practices

### 1. Selalu Cleanup Listeners

```jsx
useEffect(() => {
  const unsubscribe = onSnapshot(/* ... */);
  
  // PENTING: Cleanup untuk avoid memory leaks
  return () => unsubscribe();
}, []);
```

### 2. Handle Loading States

```jsx
function ThreadList() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(query, (snapshot) => {
      // ... set threads
      setLoading(false); // Set loading ke false setelah data loaded
    });
    
    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return <p>Loading...</p>;
  }
  
  return <div>{/* render threads */}</div>;
}
```

### 3. Validasi User Input

```jsx
function validateThreadInput(title, content) {
  if (!title.trim()) {
    toast.error('Judul tidak boleh kosong');
    return false;
  }
  
  if (title.length > 200) {
    toast.error('Judul maksimal 200 karakter');
    return false;
  }
  
  if (content.length < 10) {
    toast.error('Konten minimal 10 karakter');
    return false;
  }
  
  return true;
}
```

### 4. Use serverTimestamp()

```jsx
import { serverTimestamp } from 'firebase/firestore';

// GOOD - Gunakan serverTimestamp()
const newThread = {
  // ...
  createdAt: serverTimestamp() // Server menentukan waktu
};

// AVOID - Jangan gunakan Date.now() atau new Date()
const newThread = {
  // ...
  createdAt: new Date() // Client menentukan waktu (bisa tidak akurat)
};
```

---

## 🎓 10. Advanced Examples

### Contoh: Count Replies

```jsx
import { collection, getCountFromServer } from 'firebase/firestore';

async function getReplyCount(threadId) {
  const repliesRef = collection(db, 'threads', threadId, 'replies');
  const snapshot = await getCountFromServer(repliesRef);
  return snapshot.data().count;
}

// Penggunaan
const count = await getReplyCount('thread123');
console.log(`Thread has ${count} replies`);
```

### Contoh: Batch Operations

```jsx
import { writeBatch, doc } from 'firebase/firestore';

async function deleteThreadWithReplies(threadId) {
  const batch = writeBatch(db);
  
  // Delete thread
  const threadRef = doc(db, 'threads', threadId);
  batch.delete(threadRef);
  
  // Note: Sub-collections tidak otomatis terhapus
  // Anda perlu hapus replies secara manual jika diperlukan
  
  await batch.commit();
  console.log('Batch delete completed');
}
```

---

Semoga contoh-contoh ini membantu Anda memahami implementasi Firebase dengan lebih baik! 🚀
