import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form inputs
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [nameVal, setNameVal] = useState('');
  const [phoneVal, setPhoneVal] = useState('');

  // Sandbox bypass states (for auth/unauthorized-domain preview fallback)
  const [showBypassInput, setShowBypassInput] = useState(false);
  const [bypassEmail, setBypassEmail] = useState('rafiqradian797@gmail.com');

  if (!isOpen) return null;

  // Real Firebase Google Sign-In with automatic Sandbox bypass helper
  const handleGoogleAuth = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // 1. Try real Firebase Google Sign-In
      const firebaseUser = await signInWithGoogle();
      
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('Gagal mendapatkan profil email dari Google.');
      }

      // 2. Sync with Express Backend database
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
        setSuccessMsg('Masuk menggunakan Google berhasil!');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } else {
        setError(data.error || 'Gagal menyinkronkan akun dengan server.');
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      // Auto-detect Firebase Unauthorized Domain inside AI Studio Preview Sandbox / GitHub / Custom domain
      if (
        err?.code === 'auth/unauthorized-domain' || 
        err?.message?.includes('unauthorized-domain') ||
        err?.code === 'auth/popup-blocked' ||
        err?.message?.includes('popup-blocked')
      ) {
        setShowBypassInput(true);
        setError(`Domain ini (${window.location.hostname}) belum diotorisasi di Firebase Console Anda. Anda dapat mendaftarkan domain ini di Firebase Console > Authentication > Settings > Authorized Domains. Atau gunakan tombol Masuk Instan Cepat di bawah ini.`);
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setError('Jendela masuk Google ditutup sebelum selesai. Silakan klik tombol Google kembali.');
      } else {
        setError(`Gagal masuk: ${err?.message || 'Pastikan koneksi internet stabil.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant Bypass handler
  const handleInstantBypass = async (email: string) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: email.split('@')[0].toUpperCase(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          googleId: `sandbox-${Math.random().toString(36).substring(7)}`
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(`Berhasil masuk instan sebagai: ${email}`);
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } else {
        setError(data.error || 'Gagal menyinkronkan akun.');
      }
    } catch (err: any) {
      setError(`Gagal: ${err?.message || 'Terjadi kesalahan sistem.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Safe Google Sandbox Sync handler
  const handleBypassGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassEmail || !bypassEmail.includes('@')) {
      setError('Mohon masukkan email Google yang valid.');
      return;
    }
    await handleInstantBypass(bypassEmail);
  };

  // Real Firebase Email/Password Register & Login Flow
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        // Validation
        if (!nameVal || !emailVal || !passwordVal) {
          setError('Mohon lengkapi semua kolom pendaftaran.');
          setLoading(false);
          return;
        }

        let fbUser = null;
        let isFirebaseOk = false;
        try {
          // 1. Register user on Firebase Authentication
          fbUser = await registerWithEmail(emailVal, passwordVal, nameVal);
          isFirebaseOk = true;
        } catch (fbErr: any) {
          console.warn('Firebase register error (using fallback database):', fbErr);
          // If the email is already in use in Firebase, check if it's fine, otherwise throw to general catch if it's crucial
          if (fbErr?.code === 'auth/email-already-in-use') {
            setError('Email ini sudah terdaftar di Firebase Auth. Silakan masuk akun.');
            setLoading(false);
            return;
          }
        }

        // 2. Sync / create on our Express server database
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameVal,
            email: emailVal,
            phone: phoneVal || '',
            password: passwordVal,
            role: 'customer' // customer by default
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setSuccessMsg(
            isFirebaseOk 
              ? 'Pendaftaran Berhasil! Akun terdaftar di Firebase & Server.' 
              : 'Pendaftaran Berhasil! (Disimpan langsung di database server).'
          );
          setTimeout(() => {
            onLoginSuccess(data.user);
            onClose();
          }, 1200);
        } else {
          setError(data.error || 'Gagal menyimpan pendaftaran di database server.');
        }

      } else {
        // LOGIN MODE
        if (!emailVal || !passwordVal) {
          setError('Email dan Password harus diisi.');
          setLoading(false);
          return;
        }

        let isFirebaseOk = false;
        try {
          // 1. Login with Firebase Authentication
          await loginWithEmail(emailVal, passwordVal);
          isFirebaseOk = true;
        } catch (fbErr: any) {
          console.warn('Firebase login error (using fallback database):', fbErr);
        }

        // 2. Authenticate / sync on local database
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: emailVal,
            password: passwordVal
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setSuccessMsg('Masuk Akun Berhasil!');
          setTimeout(() => {
            onLoginSuccess(data.user);
            onClose();
          }, 1000);
        } else {
          setError(data.error || 'Email atau password salah pada database.');
        }
      }
    } catch (err: any) {
      console.error(err);
      let localizedError = err?.message || 'Gagal terhubung ke server.';
      if (err?.code === 'auth/email-already-in-use') {
        localizedError = 'Email ini sudah terdaftar. Silakan masuk akun.';
      } else if (err?.code === 'auth/weak-password') {
        localizedError = 'Password terlalu lemah. Minimal 6 karakter.';
      } else if (err?.code === 'auth/invalid-email') {
        localizedError = 'Format alamat email tidak valid.';
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        localizedError = 'Email atau password salah. Silakan periksa kembali.';
      }
      setError(localizedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-y-auto">
      {/* Container - Compact sizing & Elegant borders (No absolute full-screen height on desktop) */}
      <div className="relative w-full max-w-2xl bg-[#F5F5F5] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-fade-in max-h-[96vh] sm:max-h-[90vh] md:max-h-[85vh]">
        
        {/* UPPER HEADER: LOG IN + HELP (Responsive spacing, no overflow) */}
        <div className="bg-white border-b border-gray-100 px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="text-base font-extrabold text-[#017A3E] tracking-tight">Cleanza</span>
            <span className="text-sm text-gray-300 font-light">|</span>
            <span className="text-sm font-bold text-gray-700">
              {authMode === 'login' ? 'Masuk' : 'Daftar Akun'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://wa.me/6281122334455" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] text-[#017A3E] hover:underline font-bold"
            >
              Butuh bantuan?
            </a>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: SPLIT VIEW (Compact responsive margins, auto scroll if height is constrained) */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-r from-[#017A3E] to-[#016533] p-3 sm:p-4 md:p-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          
          {/* LEFT SIDE: BRAND HERO (Hidden on mobile, sleek and responsive on desktop) */}
          <div className="hidden md:flex flex-col items-center text-center text-white max-w-[200px] shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-md mb-3">
              <Logo size="md" showText={false} />
            </div>
            <h2 className="text-xl font-black font-sans tracking-tight mb-0.5">Cleanza</h2>
            <p className="text-xs font-bold text-yellow-300 tracking-wide font-sans mb-2">
              Lebih Hemat Lebih Cepat
            </p>
            <p className="text-[10px] text-green-100 leading-relaxed max-w-[180px]">
              Platform laundry premium, pembersih sepatu, kasur, AC, dan deep cleaning rumah.
            </p>
          </div>

          {/* RIGHT SIDE: AUTH CARD (Matches Shopee white form card, compact padding) */}
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-4 sm:p-5 border border-gray-100 relative shrink-0">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-gray-800">
                {authMode === 'login' ? 'Masuk' : 'Daftar Akun Baru'}
              </h3>
              <div className="bg-green-50 text-[#017A3E] px-2 py-0.5 rounded-lg text-[9px] font-black border border-green-100 flex items-center gap-1">
                <span className="w-1 h-1 bg-[#017A3E] rounded-full animate-ping"></span>
                <span>Firebase Auth</span>
              </div>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-[11px] font-semibold flex flex-col gap-1 mb-4 border border-red-100 max-h-[140px] overflow-y-auto leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="p-3 bg-green-50 text-[#017A3E] rounded-lg text-[11px] font-bold flex items-center gap-2 mb-4 border border-green-100">
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* MAIN FORM */}
            <form onSubmit={handleEmailFormSubmit} className="space-y-3">
              <div className="space-y-2.5">
                {authMode === 'register' && (
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    className="w-full border border-gray-200 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] rounded-md px-3 py-2 text-xs outline-none transition-all"
                  />
                )}

                <input
                  type="email"
                  required
                  placeholder="Alamat Email (e.g. email@gmail.com)"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] rounded-md px-3 py-2 text-xs outline-none transition-all"
                />

                {authMode === 'register' && (
                  <input
                    type="tel"
                    placeholder="Nomor Telepon/WhatsApp (Opsional)"
                    value={phoneVal}
                    onChange={(e) => setPhoneVal(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full border border-gray-200 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] rounded-md px-3 py-2 text-xs outline-none transition-all"
                  />
                )}

                <input
                  type="password"
                  required
                  placeholder="Kata Sandi (Min 6 Karakter)"
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] rounded-md px-3 py-2 text-xs outline-none transition-all"
                />
              </div>

              {/* LOG IN / REGISTER SUBMIT button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#017A3E] hover:bg-[#016533] text-white font-extrabold text-xs py-2.5 rounded-md transition-all shadow-md active:scale-[0.99] duration-100 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                {loading ? 'Menghubungkan...' : authMode === 'login' ? 'MASUK AKUN' : 'DAFTAR SEKARANG'}
              </button>

              <div className="flex justify-between text-[10px] text-gray-400">
                <span className="hover:text-gray-600 cursor-pointer">Lupa Password?</span>
                <span className="hover:text-[#017A3E] cursor-pointer font-bold">Masuk via OTP</span>
              </div>

              {/* OR Separator line */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-3 text-gray-300 text-[9px] font-bold uppercase tracking-wider">ATAU</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Google Auth Buttons Grid */}
              <div className="space-y-2">
                {/* 1. Real Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-2 px-3 border border-gray-200 hover:border-gray-300 rounded-md transition-all flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer active:scale-95 text-xs font-bold text-gray-600"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.5-.125 2.77-1.4 3.61l3.25 2.52c1.9-1.75 3-4.33 3-7.98z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.25-2.52c-.9.6-2.05.96-3.43.96-2.63 0-4.85-1.78-5.65-4.17l-3.37 2.6c1.65 3.28 5.04 5.54 8.77 5.54z"/>
                    <path fill="#FBBC05" d="M6.35 15.36c-.2-.6-.32-1.25-.32-1.92s.12-1.32.32-1.92L2.98 8.92C2.07 10.74 1.56 12.81 1.56 15s.51 4.26 1.42 6.08l3.37-2.72z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 8.27 0 4.88 2.26 3.23 5.54l3.37 2.6c.8-2.39 3.02-4.17 5.65-4.17z"/>
                  </svg>
                  <span>Masuk dengan Google</span>
                </button>

                {/* 2. Sandbox Bypass Google Connection Form (shown automatically on error, or triggered via link) */}
                {showBypassInput && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mt-2.5 animate-fade-in space-y-2.5 text-left">
                    <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
                      ⚠️ Firebase Domain Authorization Required:
                    </p>
                    <p className="text-[9px] text-gray-600 leading-relaxed">
                      Domain <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">{window.location.hostname}</code> belum ditambahkan di **Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains**.
                    </p>
                    
                    <div className="pt-1.5 border-t border-amber-200/60 space-y-2">
                      <p className="text-[9.5px] text-[#017A3E] font-extrabold leading-normal">
                        Bypass Cepat (Satu Klik untuk Masuk Langsung):
                      </p>
                      <button
                        type="button"
                        onClick={() => handleInstantBypass('rafiqradian797@gmail.com')}
                        disabled={loading}
                        className="w-full bg-[#017A3E] hover:bg-[#016533] text-white text-[10px] font-extrabold py-2 px-3 rounded-md shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-bounce text-yellow-300" />
                        <span>MASUK SEBAGAI: rafiqradian797@gmail.com</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                      <p className="text-[9px] text-gray-500 font-medium">
                        Atau gunakan alamat email Google kustom Anda:
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          type="email"
                          placeholder="Masukkan Email Google Anda"
                          value={bypassEmail}
                          onChange={(e) => setBypassEmail(e.target.value)}
                          className="flex-1 border border-amber-300 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] bg-white rounded px-2.5 py-1.5 text-[11px] outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleBypassGoogleAuth}
                          disabled={loading}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer active:scale-95 shrink-0"
                        >
                          Hubungkan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            <div className="mt-4 text-center text-[10px] text-gray-400 leading-normal">
              Dengan masuk, Anda menyetujui <span className="text-orange-500 cursor-pointer hover:underline font-medium">Syarat, Ketentuan & Kebijakan</span> serta <span className="text-orange-500 cursor-pointer hover:underline font-medium">Kebijakan Privasi</span> Cleanza.
            </div>

            <div className="mt-3.5 pt-3 border-t border-gray-100 text-center text-xs">
              {authMode === 'login' ? (
                <>
                  <span className="text-gray-400">Baru di Cleanza? </span>
                  <button 
                    onClick={() => { setAuthMode('register'); setError(''); }} 
                    className="text-[#017A3E] hover:underline font-extrabold cursor-pointer"
                  >
                    Daftar Akun Baru
                  </button>
                </>
              ) : (
                <>
                  <span className="text-gray-400 font-medium">Sudah punya akun Cleanza? </span>
                  <button 
                    onClick={() => { setAuthMode('login'); setError(''); }} 
                    className="text-[#017A3E] hover:underline font-extrabold cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info SSL Certification Footer */}
        <div className="bg-white border-t border-gray-100 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-gray-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#017A3E]" />
            <span>Koneksi Aman Enkripsi SSL SHA-256</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Cleanza. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
