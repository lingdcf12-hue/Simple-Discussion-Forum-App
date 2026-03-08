// ============================================
// FIREBASE CONFIGURATION FILE
// ============================================
// File ini berisi konfigurasi Firebase untuk aplikasi Forum Diskusi.
// Anda perlu mengganti nilai-nilai di bawah dengan kredensial dari Firebase Console.
//
// CARA MENDAPATKAN KREDENSIAL:
// 1. Buka Firebase Console: https://console.firebase.google.com/
// 2. Buat project baru atau pilih project yang sudah ada
// 3. Pergi ke Project Settings > General
// 4. Scroll ke bawah ke bagian "Your apps" dan klik Web icon (</>)
// 5. Daftarkan app dan copy konfigurasi yang diberikan
// 6. Paste konfigurasi tersebut di bawah ini

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// INISIALISASI SERVICES
// Export auth dan firestore untuk digunakan di seluruh aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

// ============================================
// STRUKTUR DATABASE FIRESTORE
// ============================================
//
// Collection: users
// Document ID: {userId}
//   - email: string
//   - displayName: string
//   - createdAt: Timestamp
//
// Collection: threads
// Document ID: {threadId} (auto-generated)
//   - title: string
//   - content: string
//   - authorId: string (reference ke users)
//   - authorName: string
//   - createdAt: Timestamp
//   - updatedAt: Timestamp
//
//   Sub-collection: replies
//   Document ID: {replyId} (auto-generated)
//     - content: string
//     - authorId: string
//     - authorName: string
//     - createdAt: Timestamp
//
// ============================================
// FIREBASE SECURITY RULES
// ============================================
// Copy rules di bawah ini ke Firebase Console > Firestore Database > Rules
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     
//     // Helper function untuk cek apakah user sudah login
//     function isSignedIn() {
//       return request.auth != null;
//     }
//     
//     // Helper function untuk cek apakah user adalah pemilik resource
//     function isOwner(authorId) {
//       return isSignedIn() && request.auth.uid == authorId;
//     }
//     
//     // Rules untuk collection users
//     match /users/{userId} {
//       // Semua orang bisa membaca profil user
//       allow read: if true;
//       // Hanya user yang login yang bisa membuat profil sendiri
//       allow create: if isSignedIn() && request.auth.uid == userId;
//       // Hanya pemilik yang bisa update/delete profil sendiri
//       allow update, delete: if isOwner(userId);
//     }
//     
//     // Rules untuk collection threads
//     match /threads/{threadId} {
//       // Semua orang bisa membaca threads
//       allow read: if true;
//       // Hanya user yang login yang bisa membuat thread
//       allow create: if isSignedIn() 
//         && request.resource.data.authorId == request.auth.uid;
//       // Hanya pemilik thread yang bisa update/delete
//       allow update, delete: if isOwner(resource.data.authorId);
//       
//       // Rules untuk sub-collection replies
//       match /replies/{replyId} {
//         // Semua orang bisa membaca replies
//         allow read: if true;
//         // Hanya user yang login yang bisa membuat reply
//         allow create: if isSignedIn() 
//           && request.resource.data.authorId == request.auth.uid;
//         // Hanya pemilik reply yang bisa update/delete
//         allow update, delete: if isOwner(resource.data.authorId);
//       }
//     }
//   }
// }
