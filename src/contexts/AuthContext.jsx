// ============================================
// AUTH CONTEXT - Mengelola State Autentikasi
// ============================================
// Context ini menyediakan state dan fungsi autentikasi ke seluruh aplikasi
// menggunakan Firebase Authentication

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Buat Context untuk Auth
const AuthContext = createContext({});

// Custom Hook untuk menggunakan Auth Context
// Gunakan hook ini di komponen lain: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export function AuthProvider({ children }) {
  // State untuk menyimpan user yang sedang login
  const [user, setUser] = useState(null);
  // State untuk loading saat memeriksa auth state
  const [loading, setLoading] = useState(true);

  // Effect untuk subscribe ke perubahan auth state
  // Firebase akan otomatis update state ketika user login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription ketika component unmount
    return () => unsubscribe();
  }, []);

  // FUNGSI REGISTER - Mendaftarkan user baru
  const register = async (email, password, displayName) => {
    try {
      // Buat user baru dengan email dan password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      const newUser = userCredential.user;

      // Update profile user dengan displayName
      await updateProfile(newUser, {
        displayName: displayName
      });

      // Simpan data user ke Firestore collection 'users'
      await setDoc(doc(db, 'users', newUser.uid), {
        email: email,
        displayName: displayName,
        createdAt: serverTimestamp()
      });

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, error: error.message };
    }
  };

  // FUNGSI LOGIN - Login user yang sudah terdaftar
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: error.message };
    }
  };

  // FUNGSI LOGOUT - Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Value yang akan di-provide ke seluruh aplikasi
  const value = {
    user,           // User object dari Firebase (null jika belum login)
    loading,        // Boolean untuk loading state
    register,       // Function untuk register
    login,          // Function untuk login
    logout          // Function untuk logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
