export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  salesCount: number;
  image: string;
  stock: number;
  weight: number; // in grams
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'customer';
  avatar?: string;
  verified: boolean;
  password?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  courier: string;
  courierService: string;
  status: OrderStatus;
  paymentMethod: 'dana_qris' | 'bank_transfer';
  paymentProofUrl?: string; // simulation of proof upload
  createdAt: string;
  notes?: string;
  trackingNumber?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'order_created' | 'order_paid' | 'order_shipped' | 'order_completed' | 'general';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminSettings {
  danaPhone: string;
  danaName: string;
  qrisUrl: string; // Base64 or uploaded image url or mock QRIS string
  storeAddress: string;
  whatsappApiToken?: string;
  githubUrl?: string;
}
