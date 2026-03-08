// ============================================
// REPLY FORM COMPONENT
// ============================================
// Component untuk form membuat balasan/reply pada thread
// Menggunakan sub-collection 'replies' di dalam thread document

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function ReplyForm({ threadId, onSuccess }) {
  const { user } = useAuth();
  
  // State untuk form input
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: user harus login
    if (!user) {
      toast.error('Anda harus login untuk membalas thread');
      return;
    }

    // Validasi: content harus diisi
    if (!content.trim()) {
      toast.error('Balasan tidak boleh kosong');
      return;
    }

    setLoading(true);

    try {
      // Reference ke sub-collection 'replies' di dalam thread document
      const repliesRef = collection(db, 'threads', threadId, 'replies');
      
      const newReply = {
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      };

      await addDoc(repliesRef, newReply);

      console.log('Reply created successfully');
      toast.success('Balasan berhasil ditambahkan!');

      // Reset form
      setContent('');

      // Callback setelah berhasil
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('Gagal menambahkan balasan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Jika user belum login, tampilkan pesan
  if (!user) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-center text-muted-foreground">
          Silakan login untuk membalas thread ini
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Balasan */}
        <div className="space-y-2">
          <Label htmlFor="reply">Tulis Balasan</Label>
          <Textarea
            id="reply"
            placeholder="Tulis balasan Anda di sini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Mengirim...' : 'Kirim Balasan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
