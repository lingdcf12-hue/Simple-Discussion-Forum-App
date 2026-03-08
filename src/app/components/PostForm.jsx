// ============================================
// POST FORM COMPONENT
// ============================================
// Component untuk form membuat thread baru
// Hanya muncul jika user sudah login

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export function PostForm({ onSuccess }) {
  const { user } = useAuth();
  
  // State untuk form inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: user harus login
    if (!user) {
      toast.error('Anda harus login untuk membuat thread');
      return;
    }

    // Validasi: title dan content harus diisi
    if (!title.trim() || !content.trim()) {
      toast.error('Judul dan konten harus diisi');
      return;
    }

    setLoading(true);

    try {
      // Tambahkan thread baru ke Firestore collection 'threads'
      const threadsRef = collection(db, 'threads');
      
      const newThread = {
        title: title.trim(),
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(threadsRef, newThread);

      console.log('Thread created successfully with ID:', docRef.id);
      toast.success('Thread berhasil dibuat!');

      // Reset form
      setTitle('');
      setContent('');

      // Callback setelah berhasil
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Gagal membuat thread: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Jika user belum login, tampilkan pesan
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Silakan login untuk membuat thread baru
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Thread Baru</CardTitle>
        <CardDescription>
          Bagikan topik diskusi Anda dengan komunitas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Judul */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul Thread</Label>
            <Input
              id="title"
              type="text"
              placeholder="Masukkan judul thread..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 karakter
            </p>
          </div>

          {/* Input Konten */}
          <div className="space-y-2">
            <Label htmlFor="content">Konten</Label>
            <Textarea
              id="content"
              placeholder="Tulis konten thread Anda di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimal 10 karakter
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || title.length === 0 || content.length < 10}>
              {loading ? 'Memposting...' : 'Posting Thread'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
