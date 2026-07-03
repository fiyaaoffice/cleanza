import React from 'react';
import { Star, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
}

const CATEGORIES = [
  { id: 'all', name: 'Semua Kategori' },
  { id: 'products', name: 'Produk Kimia/Sabun' },
  { id: 'services', name: 'Home Deep Cleaning' },
  { id: 'laundry', name: 'Premium Laundry' },
  { id: 'tools', name: 'Alat & Spons' }
];

export default function ProductGrid({
  products,
  onAddToCart,
  selectedCategory,
  onSelectCategory,
  searchQuery
}: ProductGridProps) {
  
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 sm:py-8 font-sans">
      
      {/* Category Tabs (Shopee Style with clean glass look) */}
      <div className="flex overflow-x-auto gap-1.5 sm:gap-3 pb-3 mb-5 sm:mb-8 scrollbar-none scroll-smooth">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 duration-100 ${
              selectedCategory === cat.id 
                ? 'bg-[#017A3E] text-white border-[#017A3E] shadow-md shadow-[#017A3E]/10' 
                : 'bg-white/80 text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid Container */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-[32px] border border-white/40">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-bold text-gray-700">Produk Tidak Ditemukan</h4>
          <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map(product => {
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountPercentage = hasDiscount 
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            return (
              <div 
                key={product.id}
                className="glass-card glass-card-hover rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between border border-white/50 group relative"
              >
                {/* MALL tag or Discount overlay */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start">
                  <span className="bg-[#017A3E] text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-sm">
                    MALL
                  </span>
                  {hasDiscount && (
                    <span className="bg-[#FFD800] text-[#121212] text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-sm">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>

                {/* Image Section (1:1 Aspect Ratio) */}
                <div className="aspect-square w-full overflow-hidden bg-gray-50 relative shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                      HABIS
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[8px] sm:text-[9px] text-[#017A3E] font-bold uppercase tracking-wider block">
                      {product.category === 'services' ? 'Jasa Layanan' : 'Produk Kimia'}
                    </span>
                    <h4 className="font-bold text-[11px] sm:text-xs text-gray-900 leading-snug line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-[#017A3E] transition-colors">
                      {product.name}
                    </h4>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center text-[#FFD800]">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-800 ml-0.5">{product.rating}</span>
                      </div>
                      <span className="text-gray-300 text-[9px] sm:text-[10px]">|</span>
                      <span className="text-gray-400 text-[9px] sm:text-[10px]">{product.salesCount} Terjual</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Price Section */}
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-xs sm:text-sm font-extrabold text-[#017A3E] font-display">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      {hasDiscount && (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                          Rp {product.originalPrice?.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart CTA */}
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-white hover:bg-green-50 text-[#017A3E] hover:text-[#016533] border border-green-100 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Beli</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
