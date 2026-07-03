import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Award, Truck, ShieldCheck } from 'lucide-react';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Kebersihan Cemerlang, Hidup Lebih Tenang",
      subtitle: "Cleanza Premium Cleaning",
      desc: "Layanan cuci springbed, sofa, karpet, dan laundry kiloan premium bersertifikasi 2026. Bersih higienis bebas kuman menggunakan produk organik terbaik kami.",
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1000&auto=format&fit=crop&q=80",
      cta: "Pesan Sekarang",
      badge: "Layanan Terbaik No. 1"
    },
    {
      title: "Formula Deterjen Cair Organik Generasi Baru 2026",
      subtitle: "Cleanza Liquid Soap",
      desc: "Efektif mengangkat noda membandel 10x lebih cepat dengan keharuman mewah Lavender Perancis tahan hingga 14 hari. Aman bagi kulit sensitif anak.",
      image: "https://images.unsplash.com/photo-1610557892470-76d74752076f?w=1000&auto=format&fit=crop&q=80",
      cta: "Lihat Produk",
      badge: "Diskon Spektakuler 15%"
    },
    {
      title: "Premium Shoes Laundry & Unyellowing Treatment",
      subtitle: "Cleanza Shoe Wash",
      desc: "Kembalikan warna putih bersih sepatu favorit Anda dengan layanan whitening khusus. Antar-jemput instan didukung kurir tepercaya pilihan Anda.",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop&q=80",
      cta: "Mulai Cuci Sepatu",
      badge: "Promo Sepatu Bersih"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-white/50 bg-gradient-to-r from-green-500/10 via-yellow-400/5 to-white/10">
        
        {/* Dynamic Slide Background Blur */}
        <div className="absolute inset-0 z-0">
          <img 
            src={slides[currentSlide].image} 
            alt="background blur" 
            className="w-full h-full object-cover blur-2xl opacity-10 transition-all duration-1000"
          />
        </div>

        {/* Slide Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center min-h-[280px] md:min-h-[380px] lg:min-h-[420px] p-4 sm:p-8 md:p-12">
          {/* Text content (Left) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 flex flex-col items-start justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] sm:text-xs font-semibold bg-white/90 text-[#017A3E] rounded-full shadow-sm border border-[#017A3E]/20">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFD800] fill-[#FFD800]" />
              {slides[currentSlide].badge}
            </span>

            <div className="space-y-1 sm:space-y-2">
              <p className="text-[#017A3E] text-[10px] sm:text-xs font-bold font-display uppercase tracking-wider">
                {slides[currentSlide].subtitle}
              </p>
              <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold font-display leading-tight text-[#121212] tracking-tight">
                {slides[currentSlide].title}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg">
              {slides[currentSlide].desc}
            </p>

            <button className="flex items-center gap-2 bg-[#017A3E] hover:bg-[#016533] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold shadow-md transition-all group border-2 border-white/20">
              <span>{slides[currentSlide].cta}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FFD800]" />
            </button>
          </div>

          {/* Visual card content (Right) */}
          <div className="lg:col-span-5 h-[160px] sm:h-[240px] md:h-[320px] relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-white/40">
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title} 
              className="w-full h-full object-cover transform scale-100 hover:scale-105 transition-transform duration-700"
            />
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            
            {/* Absolute badge overlay inside image */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 glass-effect p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-between border border-white/35">
              <div>
                <p className="text-[8px] sm:text-[10px] text-[#017A3E] font-bold uppercase tracking-wider">Promo Spesial</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-900 leading-tight truncate">Pengiriman Instant GoSend / Grab</p>
              </div>
              <span className="bg-[#FFD800] text-[#121212] text-[8px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
                AKTIF
              </span>
            </div>
          </div>
        </div>

        {/* Slider dots indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-[#017A3E]' : 'w-2 bg-gray-300'}`}
              aria-label={`slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Shopee-style Highlight Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/50">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#017A3E] shrink-0 shadow-sm border border-green-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Kualitas Terjamin 2026</h4>
            <p className="text-xs text-gray-500 mt-0.5">Produk non-toxic & kru jasa profesional tersertifikasi.</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/50">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-[#017A3E] shrink-0 shadow-sm border-yellow-100">
            <Truck className="w-6 h-6 text-[#017A3E]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Integrasi Kurir Lengkap</h4>
            <p className="text-xs text-gray-500 mt-0.5">Lacak pesanan real-time J&T, JNE, Sicepat & GoSend.</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/50">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#017A3E] shrink-0 shadow-sm border-green-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">Pembayaran QRIS DANA</h4>
            <p className="text-xs text-gray-500 mt-0.5">Metode scan QR otomatis masuk ke rekening DANA admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
