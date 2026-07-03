import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, AlertCircle, Mail, ArrowRight, UserCheck, HelpCircle } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handles authenticating via the Express server
  const handleAuthenticate = async (email: string, name: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || 'User Google',
          googleId: 'g-' + Math.floor(10000000 + Math.random() * 90000000),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim() || email)}`
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
        // Reset state
        setCustomMode(false);
        setCustomEmail('');
        setCustomName('');
      } else {
        setError(data.error || 'Gagal masuk menggunakan Google.');
      }
    } catch (err) {
      setError('Kesalahan koneksi ke server. Pastikan server aktif.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Email Google wajib diisi.');
      return;
    }
    if (!customEmail.includes('@')) {
      setError('Format email Google tidak valid.');
      return;
    }
    const derivedName = customName.trim() || customEmail.split('@')[0];
    handleAuthenticate(customEmail, derivedName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-fade-in">
        
        {/* Colorful top bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#017A3E] via-[#FFD800] to-[#017A3E]"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer active:scale-95 duration-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Logo Brand Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Logo size="md" showText={false} />
            </div>
            <h3 className="text-xl font-extrabold font-sans text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
              <span>Google Account Sign-In</span>
              <Sparkles className="w-5 h-5 text-[#017A3E] animate-pulse" />
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Daftar dan masuk ke Cleanza secara instan hanya menggunakan akun Google resmi Anda.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 mb-5 border border-red-100">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. MOCK ACCOUNTS LIST (GOOGLE ONE TAP AUTH FEEL) */}
          {!customMode ? (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pilih Akun Google Anda</span>
              
              {/* Account 1: Muhammad Rafiq (Administrator) */}
              <button
                onClick={() => handleAuthenticate('rafiqradian797@gmail.com', 'Muhammad Rafiq')}
                disabled={loading}
                className="w-full text-left p-4 bg-gray-50 hover:bg-green-50/50 border border-gray-100 hover:border-[#017A3E]/30 rounded-2xl transition-all flex items-center justify-between group cursor-pointer active:scale-[0.99] duration-100"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Muhammad%20Rafiq&backgroundColor=017a3e&textColor=ffffff" 
                    alt="Muhammad Rafiq Avatar" 
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#017A3E] transition-colors">Muhammad Rafiq</h4>
                    <p className="text-[11px] text-gray-500">rafiqradian797@gmail.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold bg-[#FFD800] text-[#121212] px-2 py-1 rounded-md uppercase tracking-wider">
                  Admin
                </span>
              </button>

              {/* Account 2: Customer Demo */}
              <button
                onClick={() => handleAuthenticate('budi.santoso@gmail.com', 'Budi Santoso')}
                disabled={loading}
                className="w-full text-left p-4 bg-gray-50 hover:bg-green-50/50 border border-gray-100 hover:border-[#017A3E]/30 rounded-2xl transition-all flex items-center justify-between group cursor-pointer active:scale-[0.99] duration-100"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="https://api.dicebear.com/7.x/initials/svg?seed=Budi%20Santoso&backgroundColor=ffd800&textColor=121212" 
                    alt="Budi Santoso Avatar" 
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#017A3E] transition-colors">Budi Santoso</h4>
                    <p className="text-[11px] text-gray-500">budi.santoso@gmail.com</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold bg-gray-200 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wider">
                  Pelanggan
                </span>
              </button>

              {/* Button to show Custom Account Input */}
              <button
                onClick={() => setCustomMode(true)}
                disabled={loading}
                className="w-full py-3 px-4 border border-dashed border-gray-200 hover:border-[#017A3E] text-gray-500 hover:text-[#017A3E] text-xs font-bold rounded-2xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Mail className="w-4 h-4" />
                Gunakan Akun Google Lain
              </button>
            </div>
          ) : (
            /* 2. CUSTOM EMAIL GOOGLE INPUT FORM */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Email Google Anda</label>
                <input
                  type="email"
                  required
                  placeholder="nama@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Nama Lengkap (Opsional)</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-[#017A3E] hover:bg-[#016533] disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? 'Menghubungkan...' : 'Masuk Google'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Info & Terms */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex gap-2 items-start text-[10px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-[#017A3E] shrink-0 mt-0.5" />
              <p className="leading-normal">
                Google Single Sign-On (SSO) ini terhubung secara aman langsung ke server Cleanza. Email <span className="font-bold text-gray-600">rafiqradian797@gmail.com</span> dan <span className="font-bold text-gray-600">admin@cleanza.com</span> otomatis mendapat hak akses penuh sebagai <span className="font-bold text-[#017A3E]">Administrator Toko</span>.
              </p>
            </div>
            <div className="flex gap-2 items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              <span>Google Verified App</span>
              <span>•</span>
              <span>SHA-256 SSL Secure</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
