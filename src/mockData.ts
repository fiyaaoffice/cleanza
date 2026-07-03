import { Product, Category, AdminSettings } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Semua Produk', icon: 'Grid' },
  { id: 'products', name: 'Produk Pembersih', icon: 'Sparkles' },
  { id: 'services', name: 'Layanan Cleaning', icon: 'Home' },
  { id: 'laundry', name: 'Laundry Premium', icon: 'Shirt' },
  { id: 'tools', name: 'Alat Kebersihan', icon: 'Wrench' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Cleanza Premium Liquid Detergent 1L',
    description: 'Deterjen cair konsentrat tinggi dengan formula anti-bakteri dan aroma Lavender Perancis yang tahan hingga 14 hari. Lembut di tangan, ramah lingkungan, dan efektif menghilangkan noda membandel pada serat kain terdalam.',
    price: 38500,
    originalPrice: 48000,
    category: 'products',
    rating: 4.9,
    salesCount: 1240,
    image: 'https://images.unsplash.com/photo-1610557892470-76d74752076f?w=600&auto=format&fit=crop&q=80',
    stock: 85,
    weight: 1000
  },
  {
    id: 'p2',
    name: 'Cleanza Organic Multi-Surface Spray 500ml',
    description: 'Cairan pembersih serbaguna organik untuk meja dapur, kaca, kayu, dan mainan anak. Aman dari bahan kimia berbahaya (Non-Toxic) dengan kesegaran alami citrus orange oil yang mengusir serangga secara alami.',
    price: 24900,
    originalPrice: 32000,
    category: 'products',
    rating: 4.8,
    salesCount: 840,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    stock: 120,
    weight: 500
  },
  {
    id: 'p3',
    name: 'Deep Cleaning Kasur / Springbed (Per Unit)',
    description: 'Layanan pencucian kasur profesional menggunakan mesin extractor berteknologi tinggi untuk membersihkan noda ompol, tungau, debu mendalam, dan bakteri. Termasuk sterilisasi sinar UV-C dan pengeringan cepat 95%.',
    price: 185000,
    originalPrice: 220000,
    category: 'services',
    rating: 5.0,
    salesCount: 320,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80',
    stock: 999, // services usually don't run out of stock
    weight: 0 // services have 0 weight for courier calculation
  },
  {
    id: 'p4',
    name: 'Laundry Premium Kiloan (Cuci Setrika + Lipat) 5kg',
    description: 'Paket laundry kiloan higienis premium. Satu mesin satu pelanggan (tidak dicampur), disetrika menggunakan setrika uap boiler profesional, dan dikemas dengan plastik segel tebal berlogo Cleanza.',
    price: 45000,
    originalPrice: 55000,
    category: 'laundry',
    rating: 4.7,
    salesCount: 1540,
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebd01?w=600&auto=format&fit=crop&q=80',
    stock: 999,
    weight: 5000 // 5kg package
  },
  {
    id: 'p5',
    name: 'Cleanza Microfiber Towel Super Absorbent (Set of 3)',
    description: 'Kain microfiber ultra tebal 400 GSM dengan teknologi penyerapan air 7 kali lipat berat kain. Sempurna untuk detailing kendaraan mobil, membersihkan kaca tanpa baret (lint-free), dan perabotan premium.',
    price: 19800,
    originalPrice: 28000,
    category: 'tools',
    rating: 4.9,
    salesCount: 2150,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
    stock: 350,
    weight: 150
  },
  {
    id: 'p6',
    name: 'Shoes Deep Cleaning & Whitening Service',
    description: 'Layanan cuci sepatu premium luar dalam. Menggunakan pembersih khusus material (leather, canvas, suede) dengan pengerjaan manual oleh profesional. Dilengkapi teknik unyellowing dan pewangi khusus sepatu.',
    price: 60000,
    originalPrice: 75000,
    category: 'laundry',
    rating: 4.9,
    salesCount: 410,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    stock: 999,
    weight: 1000 // shoe package weight for courier return
  },
  {
    id: 'p7',
    name: 'Cleanza Glass & Window Shine Liquid 1L',
    description: 'Cairan pembersih kaca dengan formulasi "Rain Repellent" mencegah noda air kembali menempel. Memberikan kilau jernih transparan tanpa goresan dan melindungi kaca dari tumbuhnya jamur kaca membandel.',
    price: 29500,
    originalPrice: 38000,
    category: 'products',
    rating: 4.8,
    salesCount: 920,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&auto=format&fit=crop&q=80',
    stock: 95,
    weight: 1000
  },
  {
    id: 'p8',
    name: 'Deep Cleaning Sofa & Carpet (Per Dudukan)',
    description: 'Layanan pembersihan sofa/karpet basah profesional untuk mengangkat noda makanan, noda kosmetik, bau tidak sedap, rontokan bulu hewan, dan debu mikro. Termasuk pewangi disinfektan pembunuh bakteri.',
    price: 49000,
    originalPrice: 60000,
    category: 'services',
    rating: 4.9,
    salesCount: 680,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
    stock: 999,
    weight: 0
  }
];

export const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  danaPhone: '081234567890',
  danaName: 'Cleanza Laundry & Cleaning Store',
  // QRIS standard simulation string (EMVCo format or mock QR code content)
  qrisUrl: '00020101021126380010ID.CO.DANA.WWW01189360091234567890125204541153033605802ID5922Cleanza Cleaning Shop6007Jakarta61051211162070703A0154041.2',
  storeAddress: 'RS. karya medika, 1P4MF+4R4, Telagamurni, Kec. Cikarang Bar., Kabupaten Bekasi, Jawa Barat 17530'
};
