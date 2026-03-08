# 🏗️ Arsitektur Aplikasi Forum Diskusi

Dokumen ini menjelaskan arsitektur dan flow data aplikasi Forum Diskusi.

---

## 📊 Diagram Arsitektur Keseluruhan

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT APP                               │
│                                                                 │
│  ┌────────────────┐         ┌──────────────────┐              │
│  │   App.tsx      │────────▶│  AuthContext     │              │
│  │  (Main App)    │         │  (Auth State)    │              │
│  └────────────────┘         └──────────────────┘              │
│         │                            │                         │
│         │                            ▼                         │
│         ▼                   ┌──────────────────┐              │
│  ┌────────────────┐         │  Firebase Auth   │              │
│  │  Components:   │         │  - login()       │              │
│  │  - ThreadList  │         │  - register()    │              │
│  │  - ThreadDetail│         │  - logout()      │              │
│  │  - PostForm    │         └──────────────────┘              │
│  │  - LoginForm   │                  │                         │
│  └────────────────┘                  │                         │
│         │                            │                         │
│         └────────────┬───────────────┘                         │
│                      ▼                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │      FIREBASE BACKEND       │
         │                             │
         │  ┌─────────────────────┐   │
         │  │  Firestore Database │   │
         │  │                     │   │
         │  │  Collections:       │   │
         │  │  - users            │   │
         │  │  - threads          │   │
         │  │    └─ replies       │   │
         │  │       (sub-coll)    │   │
         │  └─────────────────────┘   │
         │                             │
         │  ┌─────────────────────┐   │
         │  │  Security Rules     │   │
         │  │  - Read: Public     │   │
         │  │  - Write: Auth only │   │
         │  │  - Delete: Owner    │   │
         │  └─────────────────────┘   │
         └─────────────────────────────┘
```

---

## 🔄 Flow Data Aplikasi

### 1. Authentication Flow

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐      ┌──────────┐
│  User    │─────▶│ LoginForm   │─────▶│ AuthContext  │─────▶│ Firebase │
│  Click   │      │ Submit      │      │ register()   │      │   Auth   │
│ "Daftar" │      │ Email+Pass  │      │ login()      │      │          │
└──────────┘      └─────────────┘      └──────────────┘      └──────────┘
                                               │                    │
                                               │                    │
                                               ▼                    ▼
                                        ┌──────────────┐    ┌──────────────┐
                                        │ Update       │    │ Create User  │
                                        │ User State   │    │ in Firestore │
                                        └──────────────┘    │ /users/{uid} │
                                               │            └──────────────┘
                                               ▼
                                        ┌──────────────┐
                                        │ User Logged  │
                                        │ In ✅        │
                                        └──────────────┘
```

**Code Flow:**

```jsx
// 1. User klik "Daftar" di LoginForm
<button onClick={handleSubmit}>Daftar</button>

// 2. LoginForm memanggil AuthContext.register()
const { register } = useAuth();
await register(email, password, displayName);

// 3. AuthContext memanggil Firebase Auth
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// 4. AuthContext menyimpan user data ke Firestore
await setDoc(doc(db, 'users', user.uid), {
  email, displayName, createdAt: serverTimestamp()
});

// 5. AuthContext update state user
setUser(currentUser);

// 6. Aplikasi re-render dengan user state baru
```

---

### 2. Create Thread Flow

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐      ┌──────────┐
│  User    │─────▶│  PostForm   │─────▶│  Firestore   │─────▶│  Real-   │
│  Submit  │      │  Validate   │      │  addDoc()    │      │  time    │
│  Form    │      │  & Send     │      │  /threads    │      │  Update  │
└──────────┘      └─────────────┘      └──────────────┘      └──────────┘
                                               │                    │
                                               │                    │
                                               ▼                    ▼
                                        ┌──────────────┐    ┌──────────────┐
                                        │ Security     │    │ All clients  │
                                        │ Rules Check  │    │ receive      │
                                        │ ✅ Auth      │    │ onSnapshot   │
                                        └──────────────┘    │ event        │
                                                            └──────────────┘
                                                                   │
                                                                   ▼
                                                            ┌──────────────┐
                                                            │ ThreadList   │
                                                            │ Auto-update  │
                                                            │ ✅           │
                                                            └──────────────┘
```

**Code Flow:**

```jsx
// 1. User isi form di PostForm
<form onSubmit={handleSubmit}>
  <Input value={title} />
  <Textarea value={content} />
</form>

// 2. PostForm validate input
if (!title.trim() || !content.trim()) {
  toast.error('Judul dan konten harus diisi');
  return;
}

// 3. PostForm kirim data ke Firestore
const threadsRef = collection(db, 'threads');
await addDoc(threadsRef, {
  title, content,
  authorId: user.uid,
  authorName: user.displayName,
  createdAt: serverTimestamp()
});

// 4. Security Rules validasi
// Check: request.auth != null && request.resource.data.authorId == request.auth.uid

// 5. Thread tersimpan di Firestore

// 6. onSnapshot listener di ThreadList menerima event
onSnapshot(query, (snapshot) => {
  // Snapshot berisi thread baru
  setThreads(newThreads); // ✅ Auto-update!
});
```

---

### 3. Real-time Updates Flow

```
┌────────────────┐                    ┌────────────────┐
│  User A        │                    │  User B        │
│  (Browser 1)   │                    │  (Browser 2)   │
└────────────────┘                    └────────────────┘
       │                                     │
       │ 1. Create Thread                   │
       │    ─────────────────▶               │
       │                     │               │
       │              ┌──────▼──────┐        │
       │              │  Firestore  │        │
       │              │   Database  │        │
       │              └──────┬──────┘        │
       │                     │               │
       │                     │ 2. Trigger    │
       │ ◀───────────────────┼───────────────┤
       │   onSnapshot        │  onSnapshot   │
       │   event             │  event        │
       │                     │               │
       ▼                     │               ▼
┌────────────────┐           │        ┌────────────────┐
│ ThreadList     │           │        │ ThreadList     │
│ Auto-update ✅ │           │        │ Auto-update ✅ │
└────────────────┘                    └────────────────┘
```

**Code Implementation:**

```jsx
// Setup real-time listener di ThreadList
useEffect(() => {
  const q = query(
    collection(db, 'threads'), 
    orderBy('createdAt', 'desc')
  );
  
  // onSnapshot akan triggered setiap ada perubahan
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const threadsData = [];
    snapshot.forEach((doc) => {
      threadsData.push({ id: doc.id, ...doc.data() });
    });
    setThreads(threadsData); // ✅ Auto-update state!
  });
  
  // Cleanup listener saat component unmount
  return () => unsubscribe();
}, []);
```

**Keuntungan Real-time:**
- ✅ User A create thread → User B langsung lihat
- ✅ User B reply → User A langsung lihat
- ✅ Tidak perlu refresh manual
- ✅ Collaborative experience

---

## 🗄️ Database Structure

### Firestore Collections Hierarchy

```
Firestore Database
│
├── users/                          (Collection)
│   ├── {userId1}/                  (Document)
│   │   ├── email: "user1@email.com"
│   │   ├── displayName: "John Doe"
│   │   └── createdAt: Timestamp
│   │
│   └── {userId2}/                  (Document)
│       ├── email: "user2@email.com"
│       ├── displayName: "Jane Smith"
│       └── createdAt: Timestamp
│
└── threads/                        (Collection)
    ├── {threadId1}/                (Document)
    │   ├── title: "Cara belajar React?"
    │   ├── content: "Ada tips belajar React?"
    │   ├── authorId: "userId1"
    │   ├── authorName: "John Doe"
    │   ├── createdAt: Timestamp
    │   ├── updatedAt: Timestamp
    │   │
    │   └── replies/                (Sub-collection)
    │       ├── {replyId1}/         (Document)
    │       │   ├── content: "Mulai dari docs!"
    │       │   ├── authorId: "userId2"
    │       │   ├── authorName: "Jane Smith"
    │       │   └── createdAt: Timestamp
    │       │
    │       └── {replyId2}/         (Document)
    │           ├── content: "Tutorial di YouTube bagus"
    │           ├── authorId: "userId1"
    │           ├── authorName: "John Doe"
    │           └── createdAt: Timestamp
    │
    └── {threadId2}/                (Document)
        ├── title: "..."
        ├── content: "..."
        └── ...
```

---

## 🔐 Security Rules Logic

### Rules Decision Tree

```
                    ┌─────────────────┐
                    │  Request masuk  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Operation apa?  │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
      ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
      │  READ   │       │ CREATE  │      │ DELETE  │
      └────┬────┘       └────┬────┘      └────┬────┘
           │                 │                 │
      ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
      │ Allow ✅│       │ Is user │      │ Is user │
      │ (Public)│       │ logged  │      │ owner?  │
      └─────────┘       │ in?     │      └────┬────┘
                        └────┬────┘           │
                             │           ┌────┴────┐
                        ┌────┴────┐      │         │
                        │    ✅   │     ✅YES    ❌NO
                        │  Allow  │      │         │
                        └─────────┘   Allow    Deny
```

**Code Implementation:**

```javascript
// Security Rules di Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;  // Cek apakah user login
    }
    
    function isOwner(authorId) {
      return isSignedIn() && request.auth.uid == authorId;  // Cek apakah user = owner
    }
    
    // Rules untuk threads
    match /threads/{threadId} {
      allow read: if true;  // ✅ Semua orang bisa read
      
      allow create: if isSignedIn()  // ✅ Harus login
        && request.resource.data.authorId == request.auth.uid;  // ✅ authorId harus match
      
      allow update, delete: if isOwner(resource.data.authorId);  // ✅ Hanya owner
    }
  }
}
```

---

## 🧩 Component Architecture

### Component Hierarchy

```
App.tsx
│
├── AuthProvider (Context)
│   └── Provides: user, login, logout, register
│
├── Header
│   ├── Logo
│   └── User Info / Login Button
│
├── Main Content
│   │
│   ├── selectedThread == null
│   │   │
│   │   └── Tabs
│   │       ├── Tab: "Semua Thread"
│   │       │   └── ThreadList
│   │       │       └── ThreadCard (multiple)
│   │       │           ├── Title
│   │       │           ├── Excerpt
│   │       │           ├── Author
│   │       │           └── Timestamp
│   │       │
│   │       └── Tab: "Buat Thread"
│   │           └── PostForm
│   │               ├── Input (Title)
│   │               ├── Textarea (Content)
│   │               └── Button (Submit)
│   │
│   └── selectedThread != null
│       │
│       └── ThreadDetail
│           ├── Back Button
│           ├── Thread Content
│           │   ├── Title
│           │   ├── Full Content
│           │   ├── Author
│           │   ├── Timestamp
│           │   └── Delete Button (if owner)
│           │
│           ├── ReplyForm
│           │   ├── Textarea
│           │   └── Button (Submit)
│           │
│           └── Replies List
│               └── Reply Card (multiple)
│                   ├── Content
│                   ├── Author
│                   ├── Timestamp
│                   └── Delete Button (if owner)
│
├── LoginDialog
│   └── LoginForm
│       ├── Toggle (Login/Register)
│       ├── Input (Email)
│       ├── Input (Password)
│       ├── Input (Name - register only)
│       └── Button (Submit)
│
└── Toaster (Notifications)
```

---

## 📡 Data Flow Summary

### Read Data (Fetch)

```
Component ────▶ Firestore Query ────▶ onSnapshot Listener
   │                                         │
   │                                         │
   │◀─────────── Update State ◀──────────────┘
   │
   └────▶ Re-render with new data
```

### Write Data (Create)

```
User Input ────▶ Validation ────▶ Firestore addDoc()
                                        │
                                        │
                                        ▼
                                  Security Rules
                                        │
                                  ┌─────┴─────┐
                                  │           │
                                Allow       Deny
                                  │           │
                                  ▼           ▼
                            Save to DB    Return Error
                                  │
                                  └────▶ Trigger onSnapshot
                                              │
                                              ▼
                                        All listeners
                                        receive update
```

---

## 🎯 Key Concepts

### 1. Context Pattern (AuthContext)

**Purpose:** Share authentication state across all components

```jsx
// Provider di root
<AuthProvider>
  <App />
</AuthProvider>

// Consume di any component
const { user } = useAuth();
```

### 2. Real-time Listeners (onSnapshot)

**Purpose:** Auto-update UI when data changes

```jsx
// Setup listener
const unsubscribe = onSnapshot(query, (snapshot) => {
  // Update state
});

// Cleanup
return () => unsubscribe();
```

### 3. Security Rules

**Purpose:** Server-side validation untuk protect data

```javascript
// Rules berjalan di server, tidak bisa di-bypass dari client
allow create: if isSignedIn() 
  && request.resource.data.authorId == request.auth.uid;
```

### 4. Sub-collections

**Purpose:** Nested data structure (replies inside threads)

```jsx
// Path ke sub-collection
collection(db, 'threads', threadId, 'replies')

// Hierarchy: threads/{threadId}/replies/{replyId}
```

---

## 🚀 Performance Considerations

### 1. Real-time Listeners

**Pro:**
- ✅ Data selalu up-to-date
- ✅ User experience lebih baik

**Con:**
- ⚠️ Consume reads quota
- ⚠️ Bisa expensive di scale

**Optimization:**
```jsx
// Limit query untuk reduce reads
const q = query(threadsRef, orderBy('createdAt', 'desc'), limit(20));
```

### 2. Cleanup Listeners

**Important:** Selalu cleanup untuk avoid memory leaks

```jsx
useEffect(() => {
  const unsubscribe = onSnapshot(/* ... */);
  return () => unsubscribe();  // ✅ Cleanup!
}, []);
```

---

## 📚 Learning Path

Untuk memahami arsitektur ini, pelajari:

1. **React Basics**
   - Components
   - Props & State
   - Hooks (useState, useEffect)
   - Context API

2. **Firebase Firestore**
   - Collections & Documents
   - Queries & Filters
   - Real-time Listeners
   - Sub-collections

3. **Firebase Auth**
   - Email/Password Auth
   - User State Management
   - onAuthStateChanged

4. **Security Rules**
   - Read/Write Rules
   - Helper Functions
   - Request/Resource Objects

---

**Selamat Belajar! 🎓**
