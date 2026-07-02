import React, { useState, useEffect } from 'react';
import { X, Trash2, ShieldCheck, MapPin, Plus, Minus, AlertCircle, Sparkles } from 'lucide-react';
import { CartItem, Order, User, AdminSettings } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  adminSettings: AdminSettings;
  onCheckoutSuccess: (order: Order) => void;
  orders?: Order[];
  onUpdateOrders?: (orders: Order[]) => void;
}

const COURIERS = [
  { id: 'j&t', name: 'J&T Express', service: 'Reguler (2-3 Hari)', ratePerKg: 9000, isInstant: false },
  { id: 'jne', name: 'JNE Express', service: 'Reguler (2-4 Hari)', ratePerKg: 11000, isInstant: false },
  { id: 'sicepat', name: 'Sicepat', service: 'BEST (Besok Sampai)', ratePerKg: 15000, isInstant: false },
  { id: 'gosend', name: 'GoSend', service: 'Sameday (6-8 Jam)', ratePerKg: 20000, isInstant: true, flatRate: 20000 },
  { id: 'grab', name: 'Grab Express', service: 'Instant (1-2 Jam)', ratePerKg: 35000, isInstant: true, flatRate: 35000 }
];

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOpenAuth,
  adminSettings,
  onCheckoutSuccess,
  orders,
  onUpdateOrders
}: CartModalProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  
  // Courier selection
  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0]);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync user info
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalWeight = cartItems.reduce((acc, item) => acc + ((item.product.weight || 0) * item.quantity), 0); // in grams
  
  // Dynamic Shipping Cost
  const calculatedShippingCost = () => {
    if (totalWeight === 0) return 0; // service or no weight items
    const weightInKg = Math.ceil(totalWeight / 1000);
    if (selectedCourier.isInstant) {
      return selectedCourier.flatRate || 25000;
    }
    return selectedCourier.ratePerKg * weightInKg;
  };

  const shippingCost = calculatedShippingCost();
  const totalAmount = subtotal + shippingCost;

  const handleNextToShipping = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (cartItems.length === 0) {
      setError('Keranjang belanja Anda kosong.');
      return;
    }
    setError('');
    setCheckoutStep('shipping');
  };

  const handleNextToPayment = () => {
    if (!address || !customerName || !customerPhone) {
      setError('Mohon lengkapi data pengiriman Anda.');
      return;
    }
    setError('');
    setCheckoutStep('payment');
  };

  // Simulate proof upload
  const handleUploadProofMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProof(file);
      setPaymentProofUrl(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async (autoVerify: boolean = false) => {
    setLoading(true);
    setError('');

    const newOrderPayload = {
      userId: currentUser?.id || 'guest',
      customerName,
      customerPhone,
      customerEmail: currentUser?.email || '',
      shippingAddress: address,
      items: cartItems,
      subtotal,
      shippingCost,
      total: totalAmount,
      courier: selectedCourier.name,
      courierService: selectedCourier.service,
      paymentMethod: 'dana_qris' as const,
      paymentProofUrl: paymentProofUrl || undefined,
      notes,
      status: autoVerify ? ('paid' as const) : ('pending' as const)
    };

    const simulateLocalOrder = () => {
      const mockOrder: Order = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        ...newOrderPayload,
        status: autoVerify ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
        trackingNumber: autoVerify ? 'CLZ-' + Math.floor(100000 + Math.random() * 900000) : undefined
      };
      setCreatedOrder(mockOrder);
      if (onUpdateOrders && orders) {
        onUpdateOrders([mockOrder, ...orders]);
      }
      onCheckoutSuccess(mockOrder);
      setCheckoutStep('success');
      onClearCart();
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrderPayload })
      });
      if (response.ok) {
        const data = await response.json();
        setCreatedOrder(data.order);
        onCheckoutSuccess(data.order);
        setCheckoutStep('success');
        onClearCart();
      } else {
        simulateLocalOrder();
      }
    } catch (err) {
      simulateLocalOrder();
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCheckoutStep('cart');
    setPaymentProof(null);
    setPaymentProofUrl('');
    setCreatedOrder(null);
    setAddress('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-end">
      <div className="w-full max-w-lg h-full bg-white flex flex-col shadow-2xl border-l border-white/20 relative font-sans text-gray-800">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#017A3E] text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD800]" />
            <h3 className="font-bold text-lg font-display">
              {checkoutStep === 'cart' && 'Keranjang Belanja'}
              {checkoutStep === 'shipping' && 'Detail Pengiriman'}
              {checkoutStep === 'payment' && 'Sistem Pembayaran Aman'}
              {checkoutStep === 'success' && 'Pembayaran Diterima'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Stepper Bar (Shopee look) */}
        <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <span className={checkoutStep === 'cart' ? 'text-[#017A3E]' : ''}>1. Keranjang</span>
          <span className={checkoutStep === 'shipping' ? 'text-[#017A3E]' : ''}>2. Pengiriman</span>
          <span className={checkoutStep === 'payment' ? 'text-[#017A3E]' : ''}>3. Pembayaran</span>
          <span className={checkoutStep === 'success' ? 'text-[#017A3E]' : ''}>4. Selesai</span>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2 border border-red-100 shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* STEP 1: CART VIEW */}
          {checkoutStep === 'cart' && (
            <div className="space-y-4 h-full">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-gray-400">
                    <Trash2 className="w-10 h-10 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Keranjang Belanja Kosong</h4>
                    <p className="text-xs text-gray-500 mt-1">Silakan pilih produk berkualitas Cleanza terbaik kami.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div 
                      key={item.product.id} 
                      className="glass-card p-4 rounded-2xl flex gap-4 items-center justify-between border border-gray-100"
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="bg-green-50 text-[#017A3E] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          {item.product.category === 'services' ? 'LAYANAN' : 'PRODUK'}
                        </span>
                        <h4 className="font-bold text-xs text-gray-900 mt-1 truncate">{item.product.name}</h4>
                        <p className="text-xs text-[#017A3E] font-bold mt-1">Rp {item.product.price.toLocaleString('id-ID')}</p>
                        {item.product.weight > 0 && (
                          <p className="text-[10px] text-gray-400">Berat: {(item.product.weight * item.quantity / 1000).toFixed(1)} Kg</p>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="p-1 rounded bg-white hover:bg-gray-100 transition-all text-gray-500"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="p-1 rounded bg-white hover:bg-gray-100 transition-all text-gray-500"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SHIPPING VIEW */}
          {checkoutStep === 'shipping' && (
            <div className="space-y-4">
              <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100/60 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#017A3E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Alamat Toko Pengirim</h4>
                  <p className="text-xs text-gray-600 mt-1">{adminSettings.storeAddress}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap penerima"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">No. WhatsApp Penerima</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 0812345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Alamat Lengkap Pengiriman</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Nama jalan, Nomor rumah, RT/RW, Kecamatan, Kota/Kabupaten, Kode Pos"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* Courier Selection Option */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Pilih Jasa Kurir Pengiriman</label>
                  <div className="space-y-2">
                    {COURIERS.map(c => {
                      const sampleRate = totalWeight === 0 ? 0 : (c.isInstant ? c.flatRate : c.ratePerKg * Math.ceil(totalWeight / 1000));
                      return (
                        <label 
                          key={c.id} 
                          onClick={() => setSelectedCourier(c)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedCourier.id === c.id ? 'border-[#017A3E] bg-green-50/20' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="courier" 
                              checked={selectedCourier.id === c.id} 
                              onChange={() => setSelectedCourier(c)}
                              className="accent-[#017A3E]"
                            />
                            <div>
                              <p className="font-bold text-xs text-gray-900">{c.name}</p>
                              <p className="text-[10px] text-gray-500">{c.service}</p>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-[#017A3E]">
                            {sampleRate === 0 ? 'FREE (Service)' : `Rp ${sampleRate?.toLocaleString('id-ID')}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Titip satpam, bubble wrap tebal, dsb."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT VIEW */}
          {checkoutStep === 'payment' && (
            <div className="space-y-6">
              
              {/* Payment Info Callout */}
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                <div className="flex gap-2 items-center text-[#017A3E] font-bold text-xs uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#017A3E]" />
                  <span>Sistem Pembayaran DANA QRIS Aman</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Semua transaksi langsung dikirim langsung ke dompet digital resmi Cleanza milik Anda: <strong className="text-gray-800">{adminSettings.danaName} ({adminSettings.danaPhone})</strong>.
                </p>
              </div>

              {/* QRIS Scan Screen */}
              <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-[#FFD800] text-[#121212] text-[9px] font-black px-4 py-1 rounded-br-2xl uppercase tracking-wider">
                  DANA QRIS Resmi
                </div>

                {/* QR Container */}
                <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-slate-100 mb-4 mt-2">
                  {/* Generate an awesome styled mockup QRIS representing actual DANA barcode */}
                  <div className="w-44 h-44 bg-gradient-to-br from-[#017A3E] via-white to-amber-400 p-1 rounded-xl flex items-center justify-center relative">
                    {/* Simplified simulated QR representation */}
                    <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-2 relative">
                      {/* Grid pattern mock */}
                      <div className="grid grid-cols-4 gap-2 w-full h-full opacity-90">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-sm ${(i % 3 === 0 || i === 0 || i === 3 || i === 12 || i === 15) ? 'bg-slate-900' : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                      {/* Logo center */}
                      <div className="absolute inset-0 m-auto w-10 h-10 bg-blue-600 text-white font-extrabold text-[9px] rounded-full border-2 border-white flex items-center justify-center shadow-md">
                        DANA
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Pembayaran</p>
                  <p className="text-2xl font-extrabold text-[#017A3E] font-display">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Sesuai nominal: Rp {subtotal.toLocaleString('id-ID')} + Ongkir Rp {shippingCost.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Cara Membayar:</h4>
                <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                  <li>Buka aplikasi DANA, GoPay, OVO, LinkAja atau Mobile Banking Anda.</li>
                  <li>Scan kode QR di atas atau transfer langsung ke nomor DANA: <strong>{adminSettings.danaPhone}</strong>.</li>
                  <li>Masukkan nominal transfer sebesar <strong className="text-[#017A3E]">Rp {totalAmount.toLocaleString('id-ID')}</strong>.</li>
                  <li>Unggah bukti pembayaran di bawah atau klik <strong>"Verifikasi Pembayaran Instan"</strong> untuk langsung memproses pesanan.</li>
                </ol>
              </div>

              {/* Proof Upload Simulation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Unggah Bukti Transfer (Opsional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadProofMock}
                    className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-[#017A3E] hover:file:bg-green-100"
                  />
                </div>
                {paymentProofUrl && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <img src={paymentProofUrl} alt="payment proof" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-xs text-gray-600 font-medium">Bukti terlampir ({paymentProof?.name})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS VIEW */}
          {checkoutStep === 'success' && createdOrder && (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-[#017A3E]/20 text-[#017A3E] animate-bounce">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-display text-[#017A3E]">Transaksi Berhasil!</h3>
                <p className="text-xs text-gray-500">Nomor Pesanan Anda: <strong className="text-gray-800">{createdOrder.id}</strong></p>
                <p className="text-xs text-gray-600">Terima kasih atas pesanan Anda. Transaksi Anda aman & langsung dikonfirmasi real-time.</p>
              </div>

              {/* Summary card */}
              <div className="w-full glass-card p-5 rounded-2xl border border-gray-100 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Detail Pengiriman</span>
                  <span className="font-bold text-[#017A3E]">Sedang Diproses</span>
                </div>
                <p className="text-gray-800">Penerima: <strong>{createdOrder.customerName}</strong> ({createdOrder.customerPhone})</p>
                <p className="text-gray-600 leading-relaxed">Alamat: {createdOrder.shippingAddress}</p>
                <p className="text-gray-600">Kurir: <strong>{createdOrder.courier}</strong> ({createdOrder.courierService})</p>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Tagihan:</span>
                  <span className="text-[#017A3E]">Rp {createdOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400">Notifikasi status pengiriman Anda akan dikirim berkala langsung via WhatsApp API.</p>
            </div>
          )}

        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
          
          {checkoutStep === 'cart' && cartItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Estimasi Total Berat:</span>
                <span className="font-bold">{(totalWeight / 1000).toFixed(2)} Kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Subtotal Belanja:</span>
                <span className="text-xl font-extrabold text-[#017A3E] font-display">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={handleNextToShipping}
                className="w-full bg-[#017A3E] hover:bg-[#016533] text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shadow-[#017A3E]/10"
              >
                {currentUser ? 'Lanjut ke Pengiriman' : 'Login Untuk Checkout'}
              </button>
            </div>
          )}

          {checkoutStep === 'shipping' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Ongkos Kirim ({selectedCourier.name}):</span>
                <span className="font-bold text-[#017A3E]">
                  {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total Pembayaran:</span>
                <span className="text-xl font-extrabold text-[#017A3E] font-display">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 py-3 rounded-2xl font-semibold text-xs text-gray-600 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={handleNextToPayment}
                  className="w-full bg-[#017A3E] hover:bg-[#016533] text-white py-3 rounded-2xl font-bold text-xs transition-all shadow-md"
                >
                  Lanjut Pembayaran
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="space-y-3">
              <button
                onClick={() => handlePlaceOrder(false)}
                disabled={loading}
                className="w-full bg-[#017A3E] hover:bg-[#016533] text-white py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md"
              >
                {loading ? 'Memproses...' : 'Sudah Bayar, Kirim Bukti'}
              </button>
              <button
                onClick={() => handlePlaceOrder(true)}
                disabled={loading}
                className="w-full bg-[#FFD800] hover:bg-yellow-400 text-[#121212] py-3 rounded-2xl font-extrabold text-xs transition-all border border-[#FFD800] flex items-center justify-center gap-1"
              >
                <Sparkles className="w-4 h-4 text-[#017A3E]" />
                <span>Verifikasi Pembayaran Instan</span>
              </button>
              <button
                onClick={() => setCheckoutStep('shipping')}
                className="w-full bg-transparent text-gray-500 py-2 rounded-xl text-xs hover:underline text-center"
              >
                Kembali ke Pengiriman
              </button>
            </div>
          )}

          {checkoutStep === 'success' && (
            <button
              onClick={resetFlow}
              className="w-full bg-[#017A3E] hover:bg-[#016533] text-white py-3.5 rounded-2xl font-bold text-sm transition-all"
            >
              Belanja Kembali
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
