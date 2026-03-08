// ============================================
// THREAD DETAIL COMPONENT
// ============================================
// Component untuk menampilkan detail thread beserta balasan-balasannya
// Menggunakan real-time listener untuk auto-update ketika ada balasan baru

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { ReplyForm } from './ReplyForm';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ArrowLeft, User, Clock, Trash2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

export function ThreadDetail({ threadId, onBack }) {
  const { user } = useAuth();
  
  // State untuk thread dan replies
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Baru saja';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (error) {
      return 'Waktu tidak valid';
    }
  };

  // FETCH THREAD DATA
  // Mengambil data thread berdasarkan threadId
  useEffect(() => {
    const fetchThread = async () => {
      try {
        const threadRef = doc(db, 'threads', threadId);
        const threadSnap = await getDoc(threadRef);
        
        if (threadSnap.exists()) {
          setThread({ id: threadSnap.id, ...threadSnap.data() });
        } else {
          toast.error('Thread tidak ditemukan');
          onBack();
        }
      } catch (error) {
        console.error('Error fetching thread:', error);
        toast.error('Gagal mengambil data thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [threadId, onBack]);

  // REAL-TIME LISTENER UNTUK REPLIES
  // Subscribe ke perubahan replies menggunakan onSnapshot
  useEffect(() => {
    if (!threadId) return;

    // Query untuk mengambil replies, diurutkan berdasarkan createdAt
    const repliesRef = collection(db, 'threads', threadId, 'replies');
    const q = query(repliesRef, orderBy('createdAt', 'asc'));

    // Setup real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repliesData = [];
      snapshot.forEach((doc) => {
        repliesData.push({ id: doc.id, ...doc.data() });
      });
      setReplies(repliesData);
    }, (error) => {
      console.error('Error listening to replies:', error);
      toast.error('Gagal mengambil balasan');
    });

    // Cleanup listener ketika component unmount
    return () => unsubscribe();
  }, [threadId]);

  // HANDLER DELETE THREAD
  const handleDeleteThread = async () => {
    if (!window.confirm('Yakin ingin menghapus thread ini?')) return;

    try {
      await deleteDoc(doc(db, 'threads', threadId));
      toast.success('Thread berhasil dihapus');
      onBack();
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error('Gagal menghapus thread');
    }
  };

  // HANDLER DELETE REPLY
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Yakin ingin menghapus balasan ini?')) return;

    try {
      await deleteDoc(doc(db, 'threads', threadId, 'replies', replyId));
      toast.success('Balasan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Gagal menghapus balasan');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Memuat thread...</p>
      </div>
    );
  }

  if (!thread) {
    return null;
  }

  // Cek apakah user adalah pemilik thread
  const isThreadOwner = user && thread.authorId === user.uid;

  return (
    <div className="space-y-6">
      {/* Header dengan tombol back */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      {/* Thread Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{thread.title}</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {thread.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(thread.createdAt)}
                </span>
              </CardDescription>
            </div>
            
            {/* Delete button - hanya muncul jika user adalah pemilik */}
            {isThreadOwner && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDeleteThread}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground">{thread.content}</p>
        </CardContent>
      </Card>

      {/* Separator */}
      <Separator />

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            {replies.length} Balasan
          </h3>
        </div>

        {/* Reply Form */}
        <ReplyForm threadId={threadId} onSuccess={() => {}} />

        {/* List of Replies */}
        <div className="space-y-3">
          {replies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada balasan. Jadilah yang pertama!
            </p>
          ) : (
            replies.map((reply) => {
              const isReplyOwner = user && reply.authorId === user.uid;
              
              return (
                <Card key={reply.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardDescription className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <User className="w-3 h-3" />
                          {reply.authorName}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatDate(reply.createdAt)}
                        </span>
                      </CardDescription>
                      
                      {/* Delete button untuk reply */}
                      {isReplyOwner && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteReply(reply.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
