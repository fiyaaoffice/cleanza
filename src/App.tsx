import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroBanner from './components/HeroBanner';
import ProductGrid from './components/ProductGrid';
import AuthModal from './components/AuthModal';
import CartModal from './components/CartModal';
import AdminDashboard from './components/AdminDashboard';
import NotificationToast from './components/NotificationToast';
import { Product, CartItem, Order, User, SystemNotification, AdminSettings } from './types';
import { Sparkles, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_ADMIN_SETTINGS } from './mockData';
import { logOutFirebase } from './lib/firebase';

export default function App() {
  // Authentication & Users
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data State with localStorage fallback for complete static/GitHub Pages support
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cleanza_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cleanza_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('cleanza_settings');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cleanza_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cleanza_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cleanza_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Search & Filtering
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI Modal Controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Live Toast Notification
  const [activeToast, setActiveToast] = useState<SystemNotification | null>(null);

  // Initial Fetch Data
  useEffect(() => {
    fetchProducts();
    fetchSettings();
    fetchNotifications();
    
    // Attempt to recover login session from localStorage
    const savedUser = localStorage.getItem('cleanza_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (e) {
        localStorage.removeItem('cleanza_user');
      }
    }

    // Recover Cart Items from localStorage
    const savedCart = localStorage.getItem('cleanza_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {}
    }
  }, []);

  // Fetch orders when user changes or logs in
  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  // Save Cart to localStorage whenever it is updated
  useEffect(() => {
    localStorage.setItem('cleanza_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Subscribing to Server-Sent Events (SSE) for Real-Time Transaksional Alerts
  useEffect(() => {
    const sse = new EventSource('/api/notifications/stream');

    sse.onmessage = (event) => {
      try {
        const newNotif: SystemNotification = JSON.parse(event.data);
        
        // Add to active notifications lists
        setNotifications((prev) => [newNotif, ...prev]);
        
        // Pop up the live transaction notification toast
        setActiveToast(newNotif);
        
        // Refresh products or orders depending on payload
        fetchProducts();
        if (currentUser) {
          fetchOrders();
        }
      } catch (err) {
        console.error("Error parsing real-time notification", err);
      }
    };

    sse.onerror = () => {
      console.warn("SSE disconnected. Reconnecting in background...");
    };

    return () => {
      sse.close();
    };
  }, [currentUser]);

  // API Call Helpers
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Gagal memuat produk", e);
    }
  };

  const fetchOrders = async () => {
    if (!currentUser) return;
    try {
      // If admin, we fetch all orders. If customer, we filter by userId
      const url = currentUser.role === 'admin' ? '/api/orders' : `/api/orders?userId=${currentUser.id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Gagal memuat pesanan", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setAdminSettings(data);
      }
    } catch (e) {
      console.error("Gagal memuat setting", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Gagal memuat notifikasi", e);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Visual cue - open cart automatically to make checkout seamless
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('cleanza_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      console.error("Gagal keluar dari Firebase Auth", e);
    }
    setCurrentUser(null);
    localStorage.removeItem('cleanza_user');
    setIsAdminOpen(false);
  };

  const handleCheckoutSuccess = (order: Order) => {
    fetchOrders();
    fetchNotifications();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-[#017A3E] selection:text-white">
      
      {/* 1. STICKY GLASS HEADER */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogout={handleLogout}
        adminSettings={adminSettings}
      />

      {/* 2. DYNAMIC MAIN BODY */}
      <main className="flex-1 pb-16">
        
        {/* Banner with Shopee sliding promo cards */}
        {!searchQuery && <HeroBanner />}

        {/* Categories and Products Catalog */}
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
        />

        {/* Customer Active Orders Tracker */}
        {currentUser && orders.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
            <div className="glass-card p-6 rounded-[32px] border border-white/50 space-y-4">
              <div className="flex items-center gap-2 text-[#017A3E] font-bold text-sm uppercase tracking-wider mb-2">
                <ShieldCheck className="w-5 h-5 text-[#017A3E]" />
                <span>Pelacakan Status Pesanan Anda</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white/80 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-gray-800">Nomor Pesanan: <strong className="text-[#017A3E]">{order.id}</strong></p>
                      <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black uppercase ${
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'paid' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'shipping' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-[#017A3E]'
                      }`}>
                        {order.status === 'pending' && 'Menunggu Bayar'}
                        {order.status === 'paid' && 'Dibayar'}
                        {order.status === 'shipping' && 'Sedang Dikirim'}
                        {order.status === 'completed' && 'Selesai'}
                      </span>
                    </div>
                    <p className="text-gray-500">Kurir: <strong>{order.courier}</strong> | Tagihan: <strong>Rp {order.total.toLocaleString('id-ID')}</strong></p>
                    {order.trackingNumber && (
                      <div className="p-2 bg-green-50 text-gray-600 rounded-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#017A3E] rounded-full animate-ping"></span>
                        <p className="text-[11px]">Resi Pengiriman: <strong className="text-[#017A3E]">{order.trackingNumber}</strong></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Float WhatsApp Assistance Bubble */}
        <div className="fixed bottom-6 left-6 z-40">
          <a 
            href={`https://wa.me/${adminSettings.danaPhone.replace(/^0/, '62')}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-[#017A3E] text-white hover:bg-[#016533] font-bold rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <MessageSquare className="w-5 h-5 text-[#FFD800]" />
            <span className="text-xs">Hubungi WhatsApp CS</span>
          </a>
        </div>

      </main>

      {/* 3. GLASS FOOTER WITH BRAND HIGHLIGHTS */}
      <Footer adminSettings={adminSettings} />

      {/* 4. MODALS INTERACTION STACK */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        adminSettings={adminSettings}
        onCheckoutSuccess={handleCheckoutSuccess}
        orders={orders}
        onUpdateOrders={setOrders}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onRefreshProducts={fetchProducts}
        orders={orders}
        onRefreshOrders={fetchOrders}
        notifications={notifications}
        onRefreshNotifications={fetchNotifications}
        adminSettings={adminSettings}
        onUpdateSettings={setAdminSettings}
        currentUser={currentUser}
        onUpdateProducts={setProducts}
        onUpdateOrders={setOrders}
      />

      {/* Real-time transaction Toast Popups */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
      />

    </div>
  );
}
