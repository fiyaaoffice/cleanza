import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';
import { signInWithGoogle } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Sign in with Firebase Client-side SDK
      const firebaseUser = await signInWithGoogle();
      
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Gagal mendapatkan profil email dari Google.');
      }

      // 2. Synchronize with our Express Server to handle role assignment & session
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Pengguna Cleanza',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.email)}`,
          googleId: firebaseUser.uid
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Gagal menyinkronkan akun dengan server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal masuk menggunakan Google. Pastikan koneksi internet stabil.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Since login/register is Google-only, any attempt to login via form immediately routes to Google Sign-In!
    handleGoogleAuth();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#F5F5F5] md:rounded-[20px] overflow-hidden shadow-2xl flex flex-col min-h-screen md:min-h-0 animate-fade-in">
        
        {/* UPPER HEADER: LOG IN + HELP (Matches Shopee Logo Header) */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <span className="text-xl font-bold text-[#017A3E]">Cleanza</span>
            <span className="text-lg text-gray-300 font-light">|</span>
            <span className="text-lg font-medium text-gray-800">Log In</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://wa.me/6281122334455" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-[#017A3E] hover:underline font-semibold"
            >
              Butuh bantuan?
            </a>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: SPLIT VIEW (Matches screenshot background orange layout) */}
        <div className="flex-1 bg-gradient-to-r from-[#017A3E] to-[#016533] p-6 md:p-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          
          {/* LEFT SIDE: BRAND HERO (Matches Shopee bag hero) */}
          <div className="hidden md:flex flex-col items-center text-center text-white max-w-sm">
            <div className="w-48 h-48 rounded-[36px] bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg mb-6 animate-pulse">
              <Logo size="xl" showText={false} />
            </div>
            <h2 className="text-3xl font-extrabold font-sans tracking-tight mb-2">Cleanza</h2>
            <p className="text-lg font-medium text-yellow-300 tracking-wide font-sans">
              Lebih Hemat Lebih Cepat
            </p>
            <p className="text-xs text-green-100 mt-4 max-w-xs leading-relaxed">
              Solusi laundry premium, pembersih sepatu, kasur, AC, dan deep cleaning rumah dalam satu platform.
            </p>
          </div>

          {/* RIGHT SIDE: AUTH CARD (Matches Shopee white form card) */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Log In</h3>
              <div className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                <span>Google Only</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Fake form input fields to match Shopee layout aesthetic */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="No. Handphone/Username/Email"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] rounded-md px-4 py-3 text-sm outline-none transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] rounded-md px-4 py-3 text-sm outline-none transition-all"
                />
              </div>

              {/* LOG IN button - routes directly to Google Sign-In */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#017A3E] hover:bg-[#016533] text-white font-bold text-sm py-3.5 rounded-md transition-all shadow-md active:scale-[0.99] duration-100 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? 'Menghubungkan...' : 'LOG IN'}
              </button>

              <div className="flex justify-between text-xs text-gray-400">
                <span className="hover:text-gray-600 cursor-pointer">Lupa Password?</span>
                <span className="hover:text-[#017A3E] cursor-pointer font-medium" onClick={handleGoogleAuth}>Masuk via OTP</span>
              </div>

              {/* OR Separator line */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">ATAU</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Google Sign-in button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 border border-gray-200 hover:border-gray-300 rounded-md transition-all flex items-center justify-center gap-3 hover:bg-gray-50 cursor-pointer active:scale-95 text-sm font-semibold text-gray-700"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.5-.125 2.77-1.4 3.61l3.25 2.52c1.9-1.75 3-4.33 3-7.98z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.25-2.52c-.9.6-2.05.96-3.43.96-2.63 0-4.85-1.78-5.65-4.17l-3.37 2.6c1.65 3.28 5.04 5.54 8.77 5.54z"/>
                  <path fill="#FBBC05" d="M6.35 15.36c-.2-.6-.32-1.25-.32-1.92s.12-1.32.32-1.92L2.98 8.92C2.07 10.74 1.56 12.81 1.56 15s.51 4.26 1.42 6.08l3.37-2.72z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 8.27 0 4.88 2.26 3.23 5.54l3.37 2.6c.8-2.39 3.02-4.17 5.65-4.17z"/>
                </svg>
                <span>Google</span>
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400 leading-normal">
              Dengan login, kamu menyetujui <span className="text-orange-500 cursor-pointer hover:underline">Syarat, Ketentuan & Kebijakan</span> dan <span className="text-orange-500 cursor-pointer hover:underline">Kebijakan Privasi</span> Cleanza.
            </div>

            <div className="mt-6 text-center text-xs">
              <span className="text-gray-400">Baru di Cleanza? </span>
              <button 
                onClick={handleGoogleAuth} 
                disabled={loading}
                className="text-[#017A3E] hover:underline font-bold"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Info SSL Certification Footer */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2.5 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#017A3E]" />
            <span>Koneksi Aman Terenkripsi SSL SHA-256</span>
          </div>
          <div className="flex gap-4">
            <span>© {new Date().getFullYear()} Cleanza. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
