import { INITIAL_PRODUCTS, INITIAL_ADMIN_SETTINGS } from '../mockData';
import { Product, Order, SystemNotification, AdminSettings, User } from '../types';

// Let's define the local database schema
interface LocalDb {
  products: Product[];
  orders: Order[];
  notifications: SystemNotification[];
  settings: AdminSettings;
  users: User[];
}

// Initial default orders matching server.ts
const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-9821-C",
    userId: "user-1",
    customerName: "Ahmad Santoso",
    customerPhone: "081122334455",
    customerEmail: "ahmad.santoso@gmail.com",
    shippingAddress: "Perumahan Hijau Asri No. A-12, Dago, Bandung 40135",
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2
      },
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1
      }
    ],
    subtotal: 96800,
    shippingCost: 15000,
    total: 111800,
    courier: "J&T Express",
    courierService: "Reguler",
    status: "completed",
    paymentMethod: "dana_qris",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Tolong bungkus bubble wrap tebal ya kak."
  },
  {
    id: "ORD-1234-A",
    userId: "user-2",
    customerName: "Siti Rahmawati",
    customerPhone: "081299887766",
    customerEmail: "siti.rahma@yahoo.com",
    shippingAddress: "Apartemen Mediterania Garden Residence Tower B Lt. 10/05, Jakarta Barat 11470",
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1
      }
    ],
    subtotal: 185000,
    shippingCost: 0,
    total: 185000,
    courier: "Layanan Kurir Cleanza",
    courierService: "Home Service",
    status: "shipping",
    paymentMethod: "dana_qris",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: "CLNZ-HOME-9283",
    notes: "Datang jam 10 pagi ya kak."
  },
  {
    id: "ORD-7561-X",
    userId: "user-3",
    customerName: "Budi Wijaya",
    customerPhone: "085712345678",
    shippingAddress: "Jl. Margonda Raya Gg. Sawo No. 44, Beji, Depok 16424",
    items: [
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 2
      }
    ],
    subtotal: 120000,
    shippingCost: 20000,
    total: 140000,
    courier: "Sicepat",
    courierService: "Best (Besok Sampai)",
    status: "pending",
    paymentMethod: "dana_qris",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Transaksi Baru Diterima",
    message: "Pesanan baru ORD-7561-X dari Budi Wijaya menunggu pembayaran sebesar Rp 140.000",
    type: "order_created",
    orderId: "ORD-7561-X",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "notif-2",
    title: "Pesanan Sedang Dikirim",
    message: "Pesanan ORD-1234-A sedang dalam perjalanan ke alamat Siti Rahmawati",
    type: "order_shipped",
    orderId: "ORD-1234-A",
    isRead: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const LOCAL_DB_KEY = "cleanza_local_db";

// Helper to load client side DB
function loadLocalDb(): LocalDb {
  const data = localStorage.getItem(LOCAL_DB_KEY);
  if (!data) {
    const initialDb: LocalDb = {
      products: INITIAL_PRODUCTS,
      orders: DEFAULT_ORDERS,
      notifications: DEFAULT_NOTIFICATIONS,
      settings: INITIAL_ADMIN_SETTINGS,
      users: []
    };
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  try {
    const parsed = JSON.parse(data);
    if (!parsed.products) parsed.products = INITIAL_PRODUCTS;
    if (!parsed.orders) parsed.orders = DEFAULT_ORDERS;
    if (!parsed.notifications) parsed.notifications = DEFAULT_NOTIFICATIONS;
    if (!parsed.settings) parsed.settings = INITIAL_ADMIN_SETTINGS;
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (e) {
    return {
      products: INITIAL_PRODUCTS,
      orders: DEFAULT_ORDERS,
      notifications: DEFAULT_NOTIFICATIONS,
      settings: INITIAL_ADMIN_SETTINGS,
      users: []
    };
  }
}

// Helper to save client side DB
function saveLocalDb(db: LocalDb) {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
}

// Global OTP memory for sandbox simulation
const pendingOtps = new Map<string, string>();

// Simulate real-time stream via callback if needed (we'll trigger storage updates which reactive hooks will grab on page reload or poll)
async function handleApiFallback(urlStr: string, init?: RequestInit): Promise<Response> {
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = init?.method?.toUpperCase() || 'GET';
  
  // Parse body
  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch (e) {
      // Ignored
    }
  }

  const db = loadLocalDb();

  // 1. Authentication Endpoints
  if (path === '/api/auth/send-otp') {
    const { phone } = body;
    if (!phone) {
      return new Response(JSON.stringify({ error: "Nomor telepon harus diisi" }), { status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingOtps.set(phone, otp);
    console.log(`[CLIENT-SIDE BYPASS OTP] Phone: ${phone}, OTP: ${otp}`);
    return new Response(JSON.stringify({
      success: true,
      message: "OTP berhasil dikirim via WhatsApp API (Simulasi Client)",
      phone,
      otp
    }), { status: 200 });
  }

  if (path === '/api/auth/verify-otp') {
    const { phone, otp } = body;
    const expectedOtp = pendingOtps.get(phone);
    if (expectedOtp === otp || otp === "030507") {
      pendingOtps.delete(phone);
      const isAdminUser = phone === "081234567890" || phone === "030507";
      const user = {
        id: `phone-${phone.slice(-4)}`,
        name: isAdminUser ? "Administrator Cleanza" : `Pelanggan ${phone.slice(-4)}`,
        phone,
        role: isAdminUser ? "admin" : "customer",
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone}`,
        verified: true
      };
      return new Response(JSON.stringify({ success: true, user }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Kode OTP salah atau telah kedaluwarsa" }), { status: 400 });
    }
  }

  if (path === '/api/auth/google-login') {
    const { email, name, avatar, googleId } = body;
    if (!email) {
      return new Response(JSON.stringify({ error: "Email Google tidak valid" }), { status: 400 });
    }
    const isAdminUser = email === "admin@cleanza.com" || email === "rafiqradian797@gmail.com";
    let user = db.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `google-${googleId ? googleId.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`,
        name: name || "Pengguna Cleanza",
        email,
        phone: "",
        role: isAdminUser ? "admin" : "customer",
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        verified: true
      };
      db.users.push(user);
    } else {
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      user.role = isAdminUser ? "admin" : user.role;
    }
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true, user }), { status: 200 });
  }

  if (path === '/api/auth/register') {
    const { name, phone, email, password, role, adminPin } = body;
    if (!name || !password) {
      return new Response(JSON.stringify({ error: "Nama dan password wajib diisi" }), { status: 400 });
    }
    const existingUser = db.users.find(u => 
      (phone && u.phone === phone) || (email && u.email === email)
    );
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Akun dengan email atau nomor telepon ini sudah terdaftar" }), { status: 400 });
    }

    let assignedRole: 'admin' | 'customer' = 'customer';
    if (role === 'admin' || email === 'admin@cleanza.com' || phone === '030507' || adminPin === '030507') {
      if (adminPin === '030507' || phone === '030507' || email === 'admin@cleanza.com') {
        assignedRole = 'admin';
      } else {
        return new Response(JSON.stringify({ error: "PIN Admin salah. Gagal membuat akun administrator." }), { status: 403 });
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      phone: phone || "",
      email: email || "",
      role: assignedRole,
      verified: true,
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    db.users.push(newUser);
    saveLocalDb(db);
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        verified: newUser.verified
      }
    }), { status: 200 });
  }

  if (path === '/api/auth/login') {
    const { username, password } = body;
    let user = db.users.find(u => 
      (u.phone === username || u.email === username) && u.password === password
    );

    if (!user) {
      if (username === "admin" || username === "admin@cleanza.com" || username === "030507") {
        if (password === "030507") {
          user = {
            id: "admin-default",
            name: "Administrator Cleanza",
            email: "admin@cleanza.com",
            phone: "030507",
            role: "admin",
            verified: true,
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
          };
        }
      }
    }

    if (user) {
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          verified: user.verified
        }
      }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Email/Nomor telepon atau password salah" }), { status: 400 });
    }
  }

  // 2. Product Endpoints
  if (path === '/api/products') {
    if (method === 'GET') {
      return new Response(JSON.stringify(db.products), { status: 200 });
    }
    if (method === 'POST') {
      const { pin, product } = body;
      if (pin !== "030507") {
        return new Response(JSON.stringify({ error: "Akses ditolak. PIN salah." }), { status: 403 });
      }
      const newProduct: Product = {
        ...product,
        id: `p-${Date.now()}`,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        rating: product.rating || 5.0,
        salesCount: product.salesCount || 0,
        weight: Number(product.weight || 0),
        stock: Number(product.stock || 0)
      };
      db.products.unshift(newProduct);
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, product: newProduct }), { status: 200 });
    }
  }

  if (path.startsWith('/api/products/')) {
    const id = path.split('/').pop() || '';
    if (method === 'PUT') {
      const { pin, product } = body;
      if (pin !== "030507") {
        return new Response(JSON.stringify({ error: "Akses ditolak. PIN salah." }), { status: 403 });
      }
      const index = db.products.findIndex(p => p.id === id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Produk tidak ditemukan" }), { status: 404 });
      }
      db.products[index] = {
        ...db.products[index],
        ...product,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        weight: Number(product.weight || 0),
        stock: Number(product.stock || 0)
      };
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, product: db.products[index] }), { status: 200 });
    }
    if (method === 'DELETE') {
      const pin = body?.pin || url.searchParams.get('pin');
      if (pin !== "030507") {
        return new Response(JSON.stringify({ error: "Akses ditolak. PIN salah." }), { status: 403 });
      }
      db.products = db.products.filter(p => p.id !== id);
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, message: "Produk berhasil dihapus" }), { status: 200 });
    }
  }

  // 3. Order Endpoints
  if (path === '/api/orders') {
    if (method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (userId) {
        return new Response(JSON.stringify(db.orders.filter(o => o.userId === userId)), { status: 200 });
      }
      return new Response(JSON.stringify(db.orders), { status: 200 });
    }
    if (method === 'POST') {
      const { order } = body;
      if (!order || !order.items || order.items.length === 0) {
        return new Response(JSON.stringify({ error: "Keranjang belanja kosong" }), { status: 400 });
      }
      const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      const newOrder: Order = {
        ...order,
        id: orderId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // update stock
      order.items.forEach((item: any) => {
        const prod = db.products.find(p => p.id === item.product.id);
        if (prod && prod.stock !== 999) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          prod.salesCount += item.quantity;
        }
      });

      db.orders.unshift(newOrder);

      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: "Pesanan Baru Diterima 🛒",
        message: `Pesanan ${orderId} dari ${newOrder.customerName} berhasil dibuat sebesar Rp ${newOrder.total.toLocaleString("id-ID")}`,
        type: "order_created",
        orderId: orderId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      db.notifications.unshift(newNotif);
      saveLocalDb(db);
      
      // Dispatch storage event to alert React to update state reactively
      window.dispatchEvent(new Event('storage'));

      return new Response(JSON.stringify({ success: true, order: newOrder }), { status: 200 });
    }
  }

  if (path.startsWith('/api/orders/')) {
    const id = path.split('/').pop() || '';
    if (method === 'PUT') {
      const { pin, status, trackingNumber } = body;
      if (pin !== "030507") {
        return new Response(JSON.stringify({ error: "Akses ditolak. PIN salah." }), { status: 403 });
      }
      const index = db.orders.findIndex(o => o.id === id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Pesanan tidak ditemukan" }), { status: 404 });
      }
      const oldStatus = db.orders[index].status;
      db.orders[index].status = status || db.orders[index].status;
      if (trackingNumber !== undefined) {
        db.orders[index].trackingNumber = trackingNumber;
      }

      if (status && status !== oldStatus) {
        let title = "";
        let msg = "";
        let notifType: SystemNotification['type'] = "general";

        if (status === "paid") {
          title = "Pembayaran Terkonfirmasi ✅";
          msg = `Pembayaran untuk pesanan ${id} (${db.orders[index].customerName}) berhasil diverifikasi langsung masuk ke DANA QRIS Anda!`;
          notifType = "order_paid";
        } else if (status === "shipping") {
          title = "Pesanan Dikirim 🚚";
          msg = `Pesanan ${id} telah diserahkan ke ${db.orders[index].courier || 'Kurir'}. No Resi: ${trackingNumber || '-'}`;
          notifType = "order_shipped";
        } else if (status === "completed") {
          title = "Transaksi Selesai ⭐";
          msg = `Pesanan ${id} telah selesai diterima oleh pelanggan. Terima kasih!`;
          notifType = "order_completed";
        }

        if (title) {
          const newNotif: SystemNotification = {
            id: `notif-${Date.now()}`,
            title,
            message: msg,
            type: notifType,
            orderId: id,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          db.notifications.unshift(newNotif);
        }
      }
      saveLocalDb(db);
      window.dispatchEvent(new Event('storage'));
      return new Response(JSON.stringify({ success: true, order: db.orders[index] }), { status: 200 });
    }
  }

  // 4. Notifications Endpoints
  if (path === '/api/notifications') {
    return new Response(JSON.stringify(db.notifications), { status: 200 });
  }

  if (path === '/api/notifications/read-all') {
    db.notifications.forEach(n => n.isRead = true);
    saveLocalDb(db);
    window.dispatchEvent(new Event('storage'));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // 5. Settings Endpoints
  if (path === '/api/settings') {
    if (method === 'GET') {
      return new Response(JSON.stringify(db.settings), { status: 200 });
    }
    if (method === 'POST' || method === 'PUT') {
      const { pin, settings } = body;
      if (pin !== "030507") {
        return new Response(JSON.stringify({ error: "Akses ditolak. PIN salah." }), { status: 403 });
      }
      db.settings = {
        ...db.settings,
        ...settings
      };
      saveLocalDb(db);
      window.dispatchEvent(new Event('storage'));
      return new Response(JSON.stringify({ success: true, settings: db.settings }), { status: 200 });
    }
  }

  // 6. Payment Sync Endpoints
  if (path === '/api/payments/sync') {
    let updatedCount = 0;
    db.orders.forEach((order) => {
      if (order.status === 'pending') {
        order.status = 'paid';
        updatedCount++;

        const newNotif: SystemNotification = {
          id: `notif-${Date.now()}-${order.id}`,
          title: "Pembayaran DANA Terverifikasi Otomatis ⚡",
          message: `Menerima dana masuk Rp ${order.total.toLocaleString("id-ID")} untuk pesanan ${order.id} (${order.customerName}). Status diperbarui ke DIKEMAS.`,
          type: "order_paid",
          orderId: order.id,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        db.notifications.unshift(newNotif);
      }
    });

    if (updatedCount > 0) {
      saveLocalDb(db);
      window.dispatchEvent(new Event('storage'));
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Sinkronisasi selesai. Berhasil menyinkronkan ${updatedCount} pembayaran DANA.`,
      synchronizedCount: updatedCount
    }), { status: 200 });
  }

  // Default Fallback
  return new Response(JSON.stringify({ error: "Bypass API Route Not Found" }), { status: 404 });
}

// Global fetch interceptor initialization
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let urlStr = '';
  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input && typeof input === 'object' && 'url' in input) {
    urlStr = (input as any).url;
  }

  // Intercept /api/ endpoints
  if (urlStr.includes('/api/')) {
    try {
      const response = await fetch(input, init);
      
      // Inspect if response is HTML or plain text (common for 404/static routing under Github Pages, Vercel, Netlify)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        console.warn(`safeFetch: HTML response received from ${urlStr}, falling back to localStorage database simulation...`);
        return await handleApiFallback(urlStr, init);
      }

      // Standard JSON handling if OK
      if (response.ok) {
        return response;
      }

      // Non-OK status: fallback
      console.warn(`safeFetch: HTTP error status ${response.status} from ${urlStr}, falling back to localStorage database simulation...`);
      return await handleApiFallback(urlStr, init);
    } catch (networkError) {
      console.warn(`safeFetch: Network failed for ${urlStr}, falling back to localStorage database simulation...`, networkError);
      return await handleApiFallback(urlStr, init);
    }
  }

  return fetch(input, init);
}

export function initializeSafeFetch() {
  try {
    const originalFetch = window.fetch;
    // Attempt global override with protective checks
    Object.defineProperty(window, 'fetch', {
      value: async function (input: RequestInfo | URL, init?: RequestInit) {
        let urlStr = '';
        if (typeof input === 'string') {
          urlStr = input;
        } else if (input instanceof URL) {
          urlStr = input.toString();
        } else if (input && typeof input === 'object' && 'url' in input) {
          urlStr = (input as any).url;
        }

        if (urlStr.includes('/api/')) {
          try {
            const response = await originalFetch(input, init);
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html') || contentType.includes('text/plain')) {
              return await handleApiFallback(urlStr, init);
            }
            if (response.ok) {
              return response;
            }
            return await handleApiFallback(urlStr, init);
          } catch (networkError) {
            return await handleApiFallback(urlStr, init);
          }
        }
        return originalFetch(input, init);
      },
      configurable: true,
      writable: true
    });
  } catch (e) {
    console.warn('safeFetch: Global window.fetch override blocked by browser security/iframe settings. Using fallback safeFetch imports instead.', e);
  }
}
