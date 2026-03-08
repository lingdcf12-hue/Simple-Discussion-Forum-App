// ============================================
// THREAD LIST COMPONENT
// ============================================
// Component untuk menampilkan daftar semua thread
// Menggunakan real-time listener untuk auto-update

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { ThreadCard } from './ThreadCard';
import { toast } from 'sonner';

export function ThreadList({ onThreadClick }) {
  // State untuk menyimpan list threads
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // REAL-TIME LISTENER UNTUK THREADS
  // Menggunakan onSnapshot untuk mendapatkan update real-time
  useEffect(() => {
    // Query untuk mengambil semua threads, diurutkan berdasarkan createdAt (terbaru dulu)
    const threadsRef = collection(db, 'threads');
    const q = query(threadsRef, orderBy('createdAt', 'desc'));

    // Setup real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = [];
      snapshot.forEach((doc) => {
        threadsData.push({ id: doc.id, ...doc.data() });
      });
      
      setThreads(threadsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to threads:', error);
      toast.error('Gagal mengambil daftar thread');
      setLoading(false);
    });

    // Cleanup listener ketika component unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Memuat thread...</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">Belum ada thread diskusi</p>
        <p className="text-sm text-muted-foreground">
          Jadilah yang pertama membuat thread!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <ThreadCard 
          key={thread.id} 
          thread={thread} 
          onClick={onThreadClick}
        />
      ))}
    </div>
  );
}
