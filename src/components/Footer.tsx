import React from 'react';
import { Sparkles, ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="w-full glass-effect border-t border-cleanza-glass-border pt-12 pb-8 mt-20 text-gray-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <Logo size="sm" />
          <p className="text-xs leading-relaxed text-gray-500">
            Platform e-commerce pembersih & jasa cuci premium pertama di Indonesia dengan konsep modern, minimalis, dan clean glass 2026.
          </p>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-[#017A3E] hover:bg-[#017A3E] hover:text-white transition-all cursor-pointer">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Metode Pembayaran Aman</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-extrabold text-blue-600">
              DANA QRIS
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-teal-600">
              MANDIRI
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-extrabold text-blue-800">
              BCA
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-extrabold text-[#017A3E]">
              QRIS ALL
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-orange-600">
              BNI
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-blue-500">
              BRI
            </div>
          </div>
          <p className="text-[10px] text-gray-400 leading-snug">
            *Semua metode pembayaran non-tunai langsung ditransfer aman ke akun DANA QRIS admin.
          </p>
        </div>

        {/* Logistics & Couriers */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Kurir Pengiriman</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center text-[10px] font-extrabold text-red-600">
              <span>J&T Express</span>
              <span className="text-[8px] text-gray-400 font-normal">Kiloan & Layanan</span>
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center text-[10px] font-extrabold text-blue-600">
              <span>JNE Express</span>
              <span className="text-[8px] text-gray-400 font-normal">Reguler & OKE</span>
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center text-[10px] font-extrabold text-orange-500">
              <span>Sicepat</span>
              <span className="text-[8px] text-gray-400 font-normal">REG & BEST</span>
            </div>
            <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center text-[10px] font-extrabold text-green-600">
              <span>GoSend / Grab</span>
              <span className="text-[8px] text-gray-400 font-normal">Sameday & Instant</span>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="space-y-3 text-xs text-gray-500">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Hubungi Cleanza</h3>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#017A3E] shrink-0" />
            <span>Jl. Boulevard Raya CA-20, Kelapa Gading, Jakarta Utara 14240</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#017A3E] shrink-0" />
            <span>+62 812-3456-7890</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#017A3E] shrink-0" />
            <span>cs@cleanza.com</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100/50 pt-6 max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <p>© 2026 Cleanza Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="flex items-center gap-1">
          Dibuat dengan <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> untuk kebersihan Indonesia yang lebih cemerlang.
        </p>
      </div>
    </footer>
  );
}
