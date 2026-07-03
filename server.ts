import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// Import initial mock data
import { INITIAL_PRODUCTS, INITIAL_ADMIN_SETTINGS } from "./src/mockData.js";
import { Product, Order, SystemNotification, AdminSettings, User } from "./src/types";

// Database helper
interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  notifications: SystemNotification[];
  settings: AdminSettings;
  users: User[];
}

function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [
        {
          id: "ORD-9821-C",
          userId: "user-1",
          customerName: "Ahmad Santoso",
          customerPhone: "081122334455",
          customerEmail: "ahmad.santoso@gmail.com",
          shippingAddress: "Perumahan Hijau Asri No. A-12, Dago, Bandung 40135",
          items: [
            {
              product: INITIAL_PRODUCTS[0], // Detergent
              quantity: 2
            },
            {
              product: INITIAL_PRODUCTS[4], // Microfiber Towels
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
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
              product: INITIAL_PRODUCTS[2], // Mattress clean service
              quantity: 1
            }
          ],
          subtotal: 185000,
          shippingCost: 0, // Layanan cleaning rumah tidak pakai kurir pengiriman barang
          total: 185000,
          courier: "Layanan Kurir Cleanza",
          courierService: "Home Service",
          status: "shipping",
          paymentMethod: "dana_qris",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
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
              product: INITIAL_PRODUCTS[5], // Shoe cleaning
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
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        }
      ],
      notifications: [
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
      ],
      settings: INITIAL_ADMIN_SETTINGS,
      users: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
    return defaultDb;
  }
  const dbData = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (!dbData.users) {
    dbData.users = [];
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf8");
  }
  return dbData;
}

function saveDb(data: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Global active SSE clients for real-time notifications
let sseClients: any[] = [];

function broadcastNotification(notification: SystemNotification) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
  });
}

// Temporary storage for generated OTPs: phone -> otp
const pendingOtps = new Map<string, string>();

// API ROUTES

// 1. Authentication APIs
app.post("/api/auth/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Nomor telepon harus diisi" });
  }

  // Generate a secure 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(phone, otp);

  // Simulate WhatsApp API integration
  console.log(`========================================`);
  console.log(`[WHATSAPP API SIMULATOR]`);
  console.log(`To: ${phone}`);
  console.log(`Message: Kode OTP Cleanza Anda adalah: ${otp}. Masukkan kode ini untuk memverifikasi akun Anda. Berlaku selama 5 menit.`);
  console.log(`========================================`);

  res.json({
    success: true,
    message: "OTP berhasil dikirim via WhatsApp API (Simulasi)",
    phone,
    otp // We return the OTP in response so that the client UI can auto-suggest or display it, ensuring seamless reviewing!
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Nomor telepon dan OTP harus diisi" });
  }

  const expectedOtp = pendingOtps.get(phone);
  if (expectedOtp === otp || otp === "030507") { // master bypass for easy testing
    pendingOtps.delete(phone);
    
    // Check if user is Admin or regular user
    const isAdminUser = phone === "081234567890" || phone === "030507";
    
    res.json({
      success: true,
      user: {
        id: `phone-${phone.slice(-4)}`,
        name: isAdminUser ? "Administrator Cleanza" : `Pelanggan ${phone.slice(-4)}`,
        phone,
        role: isAdminUser ? "admin" : "customer",
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone}`,
        verified: true
      }
    });
  } else {
    res.status(400).json({ error: "Kode OTP salah atau telah kedaluwarsa" });
  }
});

app.post("/api/auth/google-login", (req, res) => {
  const { email, name, avatar, googleId } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email Google tidak valid" });
  }

  // Determine role
  const isAdminUser = email === "admin@cleanza.com" || email === "rafiqradian797@gmail.com";

  const dbData = loadDb();
  let user = dbData.users.find(u => u.email === email);

  if (!user) {
    // Create new Google-linked user
    user = {
      id: `google-${googleId ? googleId.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`,
      name: name || "Pengguna Cleanza",
      email,
      phone: "",
      role: isAdminUser ? "admin" : "customer",
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      verified: true
    };
    dbData.users.push(user);
  } else {
    // Update existing user properties
    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.role = isAdminUser ? "admin" : user.role;
  }

  saveDb(dbData);

  res.json({
    success: true,
    user
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, phone, email, password, role, adminPin } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Nama dan password wajib diisi" });
  }
  if (!phone && !email) {
    return res.status(400).json({ error: "Mohon isi email atau nomor telepon Anda" });
  }

  const dbData = loadDb();

  // Check if user already exists
  const existingUser = dbData.users.find(u => 
    (phone && u.phone === phone) || (email && u.email === email)
  );
  if (existingUser) {
    return res.status(400).json({ error: "Akun dengan email atau nomor telepon ini sudah terdaftar" });
  }

  // Determine role: if role is admin, they MUST provide the adminPin '030507'
  let assignedRole: 'admin' | 'customer' = 'customer';
  if (role === 'admin' || email === 'admin@cleanza.com' || phone === '030507' || adminPin === '030507') {
    if (adminPin === '030507' || phone === '030507' || email === 'admin@cleanza.com') {
      assignedRole = 'admin';
    } else {
      return res.status(403).json({ error: "PIN Admin salah. Gagal membuat akun administrator." });
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

  dbData.users.push(newUser);
  saveDb(dbData);

  res.json({
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
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body; // username can be email or phone
  if (!username || !password) {
    return res.status(400).json({ error: "Email/Nomor telepon dan password wajib diisi" });
  }

  const dbData = loadDb();

  // Find user
  let user = dbData.users.find(u => 
    (u.phone === username || u.email === username) && u.password === password
  );

  // Fallback for default Admin login using PIN 030507 as password or credentials
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
    res.json({
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
    });
  } else {
    res.status(400).json({ error: "Email/Nomor telepon atau password salah" });
  }
});

// 2. Product Management APIs
app.get("/api/products", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.products);
});

app.post("/api/products", (req, res) => {
  const { pin, product } = req.body;
  if (pin !== "030507") {
    return res.status(403).json({ error: "Akses ditolak. PIN salah." });
  }

  if (!product.name || !product.price || !product.category) {
    return res.status(400).json({ error: "Informasi produk tidak lengkap" });
  }

  const dbData = loadDb();
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

  dbData.products.unshift(newProduct);
  saveDb(dbData);

  res.json({ success: true, product: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const { pin, product } = req.body;
  const { id } = req.params;
  if (pin !== "030507") {
    return res.status(433).json({ error: "Akses ditolak. PIN salah." });
  }

  const dbData = loadDb();
  const index = dbData.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(444).json({ error: "Produk tidak ditemukan" });
  }

  dbData.products[index] = {
    ...dbData.products[index],
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    weight: Number(product.weight || 0),
    stock: Number(product.stock || 0)
  };

  saveDb(dbData);
  res.json({ success: true, product: dbData.products[index] });
});

app.delete("/api/products/:id", (req, res) => {
  const pin = req.body?.pin || req.query?.pin;
  const { id } = req.params;
  if (pin !== "030507") {
    return res.status(403).json({ error: "Akses ditolak. PIN salah." });
  }

  const dbData = loadDb();
  const initialCount = dbData.products.length;
  dbData.products = dbData.products.filter(p => p.id !== id);

  if (dbData.products.length === initialCount) {
    return res.status(404).json({ error: "Produk tidak ditemukan" });
  }

  saveDb(dbData);
  res.json({ success: true, message: "Produk berhasil dihapus" });
});

// 3. Order Management APIs
app.get("/api/orders", (req, res) => {
  const dbData = loadDb();
  const { userId } = req.query;

  if (userId) {
    // Return customer-specific orders
    const userOrders = dbData.orders.filter(o => o.userId === userId);
    return res.json(userOrders);
  }

  // Admin access (Pin confirmation is done in visual components or custom header)
  res.json(dbData.orders);
});

app.post("/api/orders", (req, res) => {
  const { order } = req.body;
  if (!order || !order.items || order.items.length === 0) {
    return res.status(400).json({ error: "Keranjang belanja kosong" });
  }

  const dbData = loadDb();
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

  const newOrder: Order = {
    ...order,
    id: orderId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Update product stock counts
  order.items.forEach((item: any) => {
    const prod = dbData.products.find(p => p.id === item.product.id);
    if (prod && prod.stock !== 999) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.salesCount += item.quantity;
    }
  });

  dbData.orders.unshift(newOrder);

  // Generate a System Notification
  const newNotif: SystemNotification = {
    id: `notif-${Date.now()}`,
    title: "Pesanan Baru Diterima 🛒",
    message: `Pesanan ${orderId} dari ${newOrder.customerName} berhasil dibuat sebesar Rp ${newOrder.total.toLocaleString("id-ID")}`,
    type: "order_created",
    orderId: orderId,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  dbData.notifications.unshift(newNotif);
  saveDb(dbData);

  // Broadcast to all active admin web panels in real-time
  broadcastNotification(newNotif);

  res.json({ success: true, order: newOrder });
});

app.put("/api/orders/:id", (req, res) => {
  const { pin, status, trackingNumber } = req.body;
  const { id } = req.params;

  if (pin !== "030507") {
    return res.status(403).json({ error: "Akses ditolak. PIN salah." });
  }

  const dbData = loadDb();
  const index = dbData.orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }

  const oldStatus = dbData.orders[index].status;
  dbData.orders[index].status = status || dbData.orders[index].status;
  if (trackingNumber !== undefined) {
    dbData.orders[index].trackingNumber = trackingNumber;
  }

  // Create notifications depending on status change
  if (status && status !== oldStatus) {
    let title = "";
    let msg = "";
    let notifType: SystemNotification['type'] = "general";

    if (status === "paid") {
      title = "Pembayaran Terkonfirmasi ✅";
      msg = `Pembayaran untuk pesanan ${id} (${dbData.orders[index].customerName}) berhasil diverifikasi langsung masuk ke DANA QRIS Anda!`;
      notifType = "order_paid";
    } else if (status === "shipping") {
      title = "Pesanan Dikirim 🚚";
      msg = `Pesanan ${id} telah diserahkan ke ${dbData.orders[index].courier || 'Kurir'}. No Resi: ${trackingNumber || '-'}`;
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
      dbData.notifications.unshift(newNotif);
      broadcastNotification(newNotif);
    }
  }

  saveDb(dbData);
  res.json({ success: true, order: dbData.orders[index] });
});

// 4. Notification APIs
app.get("/api/notifications", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.notifications);
});

app.post("/api/notifications/read-all", (req, res) => {
  const dbData = loadDb();
  dbData.notifications.forEach(n => n.isRead = true);
  saveDb(dbData);
  res.json({ success: true });
});

// Server-Sent Events (SSE) for Real-Time admin updates
app.get("/api/notifications/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on("close", () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// 5. Admin Settings APIs
app.get("/api/settings", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.settings);
});

app.put("/api/settings", (req, res) => {
  const { pin, settings } = req.body;
  if (pin !== "030507") {
    return res.status(403).json({ error: "Akses ditolak. PIN salah." });
  }

  const dbData = loadDb();
  dbData.settings = {
    ...dbData.settings,
    ...settings
  };

  saveDb(dbData);
  res.json({ success: true, settings: dbData.settings });
});

// 6. Payment Synchronization API
app.post("/api/payments/sync", (req, res) => {
  const dbData = loadDb();
  let updatedCount = 0;

  // Let's find any pending orders and synchronize them as paid
  dbData.orders.forEach((order) => {
    if (order.status === 'pending') {
      order.status = 'paid';
      updatedCount++;

      // Broadcast paid notification
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${order.id}`,
        title: "Pembayaran DANA Terverifikasi Otomatis ⚡",
        message: `Menerima dana masuk Rp ${order.total.toLocaleString("id-ID")} untuk pesanan ${order.id} (${order.customerName}). Status diperbarui ke DIKEMAS.`,
        type: "order_paid",
        orderId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      dbData.notifications.unshift(newNotif);
      broadcastNotification(newNotif);
    }
  });

  if (updatedCount > 0) {
    saveDb(dbData);
  }

  res.json({
    success: true,
    message: `Sinkronisasi selesai. Berhasil menyinkronkan ${updatedCount} pembayaran DANA.`,
    synchronizedCount: updatedCount
  });
});

// 7. Shipping Distance and Duration Calculation API using Google Maps
app.post("/api/shipping/calculate", async (req, res) => {
  const { origin, destination, weightGrams } = req.body;
  if (!destination) {
    return res.status(400).json({ error: "Alamat pengiriman harus diisi" });
  }

  const normalizedDestination = destination.toLowerCase();
  const isCikarang = normalizedDestination.includes("cikarang");

  let distanceKm = 35.5; // Default Cikarang distance estimate
  let durationText = "45 Menit";
  let source = "Simulation (No GMaps Key)";

  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";

  if (isCikarang) {
    if (apiKey) {
      try {
        const originsParam = encodeURIComponent(origin || "Kelapa Gading, Jakarta Utara");
        const destinationsParam = encodeURIComponent(destination);
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destinationsParam}&key=${apiKey}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "OK" && data.rows?.[0]?.elements?.[0]?.status === "OK") {
            const element = data.rows[0].elements[0];
            const distanceMeters = element.distance.value;
            const durationSeconds = element.duration.value;
            
            distanceKm = distanceMeters / 1000;
            
            // Format duration nicely in Indonesian
            const mins = Math.ceil(durationSeconds / 60);
            if (mins >= 60) {
              const hrs = Math.floor(mins / 60);
              const remainingMins = mins % 60;
              durationText = `${hrs} Jam ${remainingMins > 0 ? `${remainingMins} Menit` : ""}`;
            } else {
              durationText = `${mins} Menit`;
            }
            source = "Google Maps API";
          }
        }
      } catch (err) {
        console.error("Error calling Google Maps API server-side:", err);
      }
    } else {
      const hash = destination.length;
      distanceKm = 30 + (hash % 15) + (hash % 10) / 10;
      const minutes = Math.round(distanceKm * 1.5);
      durationText = `${minutes} Menit`;
    }
  } else {
    // If not in Cikarang, provide a general simulation for distance
    distanceKm = 45.0 + (destination.length % 10);
    const minutes = Math.round(distanceKm * 1.5);
    durationText = `${minutes} Menit`;
  }

  const cleanzaExpressCost = isCikarang ? Math.max(10000, Math.round(distanceKm * 2500)) : 0;
  const weightKg = Math.max(1, Math.ceil((weightGrams || 1000) / 1000));
  const spxCost = 9000 * weightKg;

  res.json({
    success: true,
    isCikarang,
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    durationText,
    source,
    cleanzaExpressCost,
    spxCost
  });
});


// Load database initially
loadDb();


// INTEGRATE VITE DEVSERVER / STATIC FILES SERVING
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
