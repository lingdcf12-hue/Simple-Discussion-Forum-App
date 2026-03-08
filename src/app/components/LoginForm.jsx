// ============================================
// LOGIN FORM COMPONENT
// ============================================
// Component untuk form Login dan Register
// Menggunakan Auth Context untuk autentikasi

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export function LoginForm({ onClose }) {
  const { login, register } = useAuth();
  
  // State untuk toggle antara Login dan Register mode
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // State untuk form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegisterMode) {
        // Mode Register
        if (!displayName.trim()) {
          toast.error('Nama harus diisi');
          setLoading(false);
          return;
        }

        const result = await register(email, password, displayName);
        
        if (result.success) {
          toast.success('Registrasi berhasil! Selamat datang!');
          if (onClose) onClose();
        } else {
          toast.error(result.error || 'Registrasi gagal');
        }
      } else {
        // Mode Login
        const result = await login(email, password);
        
        if (result.success) {
          toast.success('Login berhasil!');
          if (onClose) onClose();
        } else {
          toast.error(result.error || 'Login gagal');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isRegisterMode ? 'Daftar' : 'Masuk'}</CardTitle>
        <CardDescription>
          {isRegisterMode 
            ? 'Buat akun baru untuk mulai berdiskusi' 
            : 'Masuk ke akun Anda untuk melanjutkan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama - hanya muncul di mode Register */}
          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Nama Anda"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isRegisterMode}
              />
            </div>
          )}

          {/* Input Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {isRegisterMode && (
              <p className="text-sm text-muted-foreground">
                Minimal 6 karakter
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? 'Memproses...' 
              : (isRegisterMode ? 'Daftar' : 'Masuk')}
          </Button>

          {/* Toggle antara Login dan Register */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-primary hover:underline"
            >
              {isRegisterMode 
                ? 'Sudah punya akun? Masuk di sini' 
                : 'Belum punya akun? Daftar di sini'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
