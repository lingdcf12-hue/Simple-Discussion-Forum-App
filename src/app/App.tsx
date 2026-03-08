// ============================================
// MAIN APP COMPONENT - Forum Diskusi
// ============================================
// Aplikasi Forum Diskusi dengan Firebase Authentication & Firestore
// 
// FITUR UTAMA:
// - Autentikasi (Login/Register/Logout)
// - Buat Thread Baru
// - Lihat Daftar Thread
// - Lihat Detail Thread & Balasan
// - Tambah Balasan ke Thread
// - Hapus Thread/Balasan (hanya pemilik)
// - Real-time Updates

import { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThreadList } from './components/ThreadList';
import { ThreadDetail } from './components/ThreadDetail';
import { PostForm } from './components/PostForm';
import { LoginForm } from './components/LoginForm';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Dialog, DialogContent } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { MessageSquare, LogOut, LogIn, User, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

function ForumApp() {
  const { user, logout } = useAuth();
  
  // State untuk navigation dan UI
  const [selectedThread, setSelectedThread] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('threads');

  // Handler logout
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Berhasil logout');
      setSelectedThread(null);
      setActiveTab('threads');
    }
  };

  // Handler klik thread card
  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
  };

  // Handler kembali ke list
  const handleBack = () => {
    setSelectedThread(null);
  };

  // Handler setelah berhasil posting thread
  const handlePostSuccess = () => {
    setActiveTab('threads');
    toast.success('Thread berhasil dibuat!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navbar */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Forum Diskusi</h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  
                  {/* Logout Button */}
                  <Button variant="outline" onClick={handleLogout} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <Button onClick={() => setShowLoginDialog(true)} className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Masuk
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {selectedThread ? (
          // DETAIL VIEW - Menampilkan thread detail beserta replies
          <ThreadDetail 
            threadId={selectedThread.id} 
            onBack={handleBack}
          />
        ) : (
          // LIST VIEW - Menampilkan tabs untuk list threads dan form posting
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="threads" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Semua Thread
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Buat Thread
              </TabsTrigger>
            </TabsList>

            {/* Tab: Daftar Thread */}
            <TabsContent value="threads" className="space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Diskusi Terbaru</h2>
                <p className="text-muted-foreground">
                  Klik pada thread untuk melihat detail dan membalas
                </p>
              </div>
              
              <ThreadList onThreadClick={handleThreadClick} />
            </TabsContent>

            {/* Tab: Form Buat Thread */}
            <TabsContent value="create" className="space-y-4">
              <PostForm onSuccess={handlePostSuccess} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Forum Diskusi © 2026 - Dibuat dengan React & Firebase</p>
          <p className="mt-2">
            <strong>Tech Stack:</strong> React + Firebase (Firestore & Auth) + Tailwind CSS
          </p>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <LoginForm onClose={() => setShowLoginDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

// App wrapper dengan AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <ForumApp />
    </AuthProvider>
  );
}
