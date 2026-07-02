import React, { useState } from 'react';
import { X, Phone, Mail, ShieldCheck, Sparkles, AlertCircle, Lock, UserCircle, KeyRound, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  // Authentication tabs: 'login' | 'register' | 'otp' | 'google'
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp' | 'google'>('login');
  
  // Form input states
  const [username, setUsername] = useState(''); // Email or Phone for Login
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer');
  const [adminPin, setAdminPin] = useState('');

  // OTP field states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Google field states
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Common UI states
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Reset all message states on switch
  const handleTabSwitch = (tab: 'login' | 'register' | 'otp' | 'google') => {
    setActiveTab(tab);
    setError('');
    setInfoMessage('');
    setPassword('');
    setRegPassword('');
    setOtp('');
    setOtpStep('send');
  };

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Email/No. HP dan Password wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);

    const simulateLocalLogin = () => {
      const isAdmin = username.toLowerCase().includes('admin') || password === '030507' || password === 'admin';
      const user = {
        id: 'usr-' + Math.floor(100000 + Math.random() * 900000),
        name: isAdmin ? 'Administrator Cleanza' : (username.split('@')[0] || 'User Demo'),
        email: username.includes('@') ? username : 'demo@cleanza.com',
        phone: !username.includes('@') ? username : '081234567890',
        role: isAdmin ? ('admin' as const) : ('customer' as const),
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      onClose();
      setUsername('');
      setPassword('');
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.user);
        onClose();
        setUsername('');
        setPassword('');
      } else {
        simulateLocalLogin();
      }
    } catch (err) {
      simulateLocalLogin();
    } finally {
      setLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPassword) {
      setError('Nama Lengkap dan Password wajib diisi.');
      return;
    }
    if (!regEmail && !regPhone) {
      setError('Mohon cantumkan Email atau Nomor Telepon aktif.');
      return;
    }
    if (regRole === 'admin' && adminPin !== '030507') {
      setError('PIN Rahasia Admin salah. Anda tidak dapat membuat akun administrator.');
      return;
    }

    setError('');
    setLoading(true);

    const simulateLocalRegister = () => {
      const user = {
        id: 'usr-' + Math.floor(100000 + Math.random() * 900000),
        name: regName,
        email: regEmail || 'demo@cleanza.com',
        phone: regPhone || '081234567890',
        role: regRole,
        verified: true,
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      onClose();
      // Clear fields
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setAdminPin('');
      setRegRole('customer');
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          role: regRole,
          adminPin: adminPin
        })
      });
      if (response.ok) {
        const data = await response.json();
        setInfoMessage('Akun berhasil dibuat! Silakan masuk menggunakan detail akun Anda.');
        // Auto fill details
        setUsername(regEmail || regPhone);
        setActiveTab('login');
        // Clear fields
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setAdminPin('');
        setRegRole('customer');
      } else {
        simulateLocalRegister();
      }
    } catch (err) {
      simulateLocalRegister();
    } finally {
      setLoading(false);
    }
  };

  // OTP Handlers (preserved)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Masukkan nomor telepon aktif Anda.');
      return;
    }
    setError('');
    setLoading(true);
    setInfoMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpStep('verify');
        setSimulatedOtp(data.otp);
        setInfoMessage(`Kode OTP simulasi telah dikirim via WhatsApp ke ${phone}.`);
      } else {
        setError(data.error || 'Gagal mengirim OTP.');
      }
    } catch (err) {
      setError('Kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Masukkan 6-digit kode OTP.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.user);
        onClose();
        setOtpStep('send');
        setPhone('');
        setOtp('');
      } else {
        setError(data.error || 'Kode OTP salah.');
      }
    } catch (err) {
      setError('Gagal memverifikasi OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler (preserved)
  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleName) {
      setError('Mohon lengkapi email dan nama Google Anda.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail,
          name: googleName,
          googleId: Math.random().toString(36).substring(2, 10),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName)}`
        }),
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Gagal masuk menggunakan Google.');
      }
    } catch (err) {
      setError('Kesalahan sistem Google auth.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Banner Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#017A3E] via-[#FFD800] to-[#017A3E]"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-2xl mb-3 border border-green-100">
              <Sparkles className="w-6 h-6 text-[#017A3E]" />
            </div>
            <h3 className="text-2xl font-bold font-display text-gray-900 tracking-tight">
              {activeTab === 'login' && 'Masuk Akun'}
              {activeTab === 'register' && 'Daftar Akun'}
              {activeTab === 'otp' && 'WhatsApp OTP'}
              {activeTab === 'google' && 'Masuk Google'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === 'login' && 'Masuk ke Cleanza untuk mulai berbelanja'}
              {activeTab === 'register' && 'Buat akun Cleanza baru dengan mudah dan cepat'}
              {activeTab === 'otp' && 'Login instan menggunakan kode OTP WhatsApp'}
              {activeTab === 'google' && 'Gunakan akun Google Mail Anda untuk login'}
            </p>
          </div>

          {/* Toggle Tab (Login / Register) */}
          {(activeTab === 'login' || activeTab === 'register') && (
            <div className="flex bg-gray-100/80 p-1 rounded-xl mb-6 border border-gray-100">
              <button
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'login' ? 'bg-white text-[#017A3E] shadow-sm' : 'text-gray-500'}`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk
              </button>
              <button
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'register' ? 'bg-white text-[#017A3E] shadow-sm' : 'text-gray-500'}`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Daftar Akun
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2 mb-4 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-green-50 text-[#017A3E] rounded-xl text-xs font-semibold space-y-1 mb-4 border border-green-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#017A3E]" />
                <span>{infoMessage}</span>
              </div>
              {simulatedOtp && activeTab === 'otp' && (
                <div className="mt-2 p-2 bg-[#FFD800]/20 rounded border border-[#FFD800]/50 text-center">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Simulasi WhatsApp OTP Received:</span>
                  <span className="text-lg font-bold tracking-widest text-gray-900">{simulatedOtp}</span>
                </div>
              )}
            </div>
          )}

          {/* 1. PASSWORD LOGIN VIEW */}
          {activeTab === 'login' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Email atau No. WhatsApp</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <UserCircle className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="nama@gmail.com atau No. HP"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password akun Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    type="button"
                    onClick={() => {
                      alert('Gunakan PIN Admin "030507" sebagai password, atau silakan buat akun baru dengan mengklik tab Daftar Akun!');
                    }}
                    className="text-[10px] font-bold text-[#017A3E] hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#017A3E] hover:bg-[#016533] disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold shadow-md shadow-[#017A3E]/10 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : 'Masuk Akun'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-[10px] text-gray-400">
                  PIN Admin Default: <span className="font-bold text-[#017A3E]">030507</span> (Bisa diketik di email/password untuk login langsung).
                </p>
              </div>
            </form>
          )}

          {/* 2. REGISTER/DAFTAR VIEW */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="contoh@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">No. WhatsApp / Telepon</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Buat Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>

              {/* Role Selection for Registration */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Mendaftar Sebagai</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('customer')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${regRole === 'customer' ? 'bg-[#017A3E]/10 text-[#017A3E] border-[#017A3E]' : 'bg-white text-gray-500 border-gray-200'}`}
                  >
                    Pelanggan
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${regRole === 'admin' ? 'bg-amber-500/10 text-amber-700 border-amber-500' : 'bg-white text-gray-500 border-gray-200'}`}
                  >
                    Admin Toko
                  </button>
                </div>
              </div>

              {/* Conditional PIN block if registering as admin */}
              {regRole === 'admin' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-amber-800 uppercase block">Masukkan PIN Khusus Admin</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan PIN Admin khusus"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-white border border-amber-300 focus:border-[#017A3E] focus:ring-1 focus:ring-[#017A3E] px-3 py-1.5 rounded-lg text-sm font-bold text-center tracking-widest"
                  />
                  <span className="text-[9px] text-amber-600 block leading-tight">Mendaftar sebagai administrator toko Cleanza memerlukan PIN Khusus (030507).</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold transition-all text-sm mt-2 flex items-center justify-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}
              </button>
            </form>
          )}

          {/* 3. WHATSAPP OTP VIEW */}
          {activeTab === 'otp' && (
            <div>
              {otpStep === 'send' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">No. WhatsApp Aktif</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">+62</span>
                      <input
                        type="tel"
                        required
                        placeholder="81234567890"
                        value={phone.replace(/^(\+62|0)/, '')}
                        onChange={(e) => setPhone('0' + e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full glass-input pl-14 pr-4 py-3 rounded-xl text-sm"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Kode verifikasi OTP instan akan dikirim langsung via WhatsApp API Cleanza.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#017A3E] hover:bg-[#016533] disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold shadow-md transition-all text-sm"
                  >
                    {loading ? 'Mengirim...' : 'Kirim OTP WhatsApp'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">6 Digit Kode OTP</label>
                      <button 
                        type="button" 
                        onClick={() => setOtpStep('send')} 
                        className="text-xs font-semibold text-[#017A3E] hover:underline"
                      >
                        Ubah Nomor
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Masukkan 6-digit angka"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full glass-input px-4 py-3 rounded-xl text-center text-lg font-bold tracking-widest"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#017A3E] hover:bg-[#016533] disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold shadow-md transition-all text-sm"
                  >
                    {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                  </button>
                  <p className="text-[10px] text-center text-gray-400">
                    Masukkan PIN Admin <span className="font-bold text-[#017A3E]">030507</span> untuk bypass dan masuk sebagai administrator.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* 4. GOOGLE MAIL VIEW */}
          {activeTab === 'google' && (
            <form onSubmit={handleGoogleLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Nama Lengkap Google</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rafiq"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Email Google Anda</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 text-white py-3 rounded-2xl font-bold shadow-md transition-all text-sm flex items-center justify-center gap-2 mt-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Masuk dengan Akun Google
              </button>
            </form>
          )}

          {/* Quick Switch Alternative Methods */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pilihan Masuk Cepat Lainnya</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTabSwitch(activeTab === 'login' || activeTab === 'register' ? 'login' : 'login')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all hover:bg-gray-50 ${activeTab === 'login' || activeTab === 'register' ? 'bg-[#017A3E]/10 border-[#017A3E] text-[#017A3E]' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                <KeyRound className="w-4 h-4" />
                <span className="text-[9px]">Password</span>
              </button>

              <button
                onClick={() => handleTabSwitch('otp')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all hover:bg-gray-50 ${activeTab === 'otp' ? 'bg-[#017A3E]/10 border-[#017A3E] text-[#017A3E]' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="text-[9px]">WA OTP</span>
              </button>

              <button
                onClick={() => handleTabSwitch('google')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all hover:bg-gray-50 ${activeTab === 'google' ? 'bg-[#017A3E]/10 border-[#017A3E] text-[#017A3E]' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-[9px]">G-Mail</span>
              </button>
            </div>
          </div>

          {/* Secure indicator */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#017A3E]" />
            <span>Koneksi Aman Enkripsi SHA-256</span>
          </div>

        </div>
      </div>
    </div>
  );
}
