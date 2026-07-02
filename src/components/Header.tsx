import React, { useState } from 'react';
import { ShoppingCart, User, Bell, Settings, LogOut, Search, Sparkles, Github } from 'lucide-react';
import { User as UserType, SystemNotification, AdminSettings } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  cartCount: number;
  notifications: SystemNotification[];
  onMarkNotificationsRead: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout: () => void;
  adminSettings?: AdminSettings;
}

export default function Header({
  currentUser,
  onOpenAuth,
  onOpenCart,
  onOpenAdmin,
  cartCount,
  notifications,
  onMarkNotificationsRead,
  searchQuery,
  setSearchQuery,
  onLogout,
  adminSettings
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-effect border-b border-cleanza-glass-border">
      {/* Top Bar - Shopee style text shortcuts */}
      <div className="bg-[#017A3E] text-white text-[10px] sm:text-xs py-1.5 px-4 md:px-8 flex justify-between items-center font-sans">
        <div className="hidden md:flex gap-4 items-center">
          <span className="hover:text-[#FFD800] cursor-pointer transition-colors">Seller Centre</span>
          <span>|</span>
          {adminSettings?.githubUrl && (
            <>
              <a 
                href={adminSettings.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#FFD800] flex items-center gap-1 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
              </a>
              <span>|</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD800]" />
          </span>
        </div>
        <div className="flex gap-3.5 sm:gap-4 items-center w-full md:w-auto justify-end">
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="flex items-center gap-1 hover:text-[#FFD800] transition-colors relative cursor-pointer active:scale-95 duration-100"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifikasi</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FFD800] text-[#121212] text-[9px] font-bold px-1 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 font-semibold text-sm flex justify-between items-center bg-gray-50">
                  <span>Notifikasi Transaksi</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={onMarkNotificationsRead}
                      className="text-xs text-[#017A3E] hover:underline"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      Belum ada notifikasi transaksi.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-3 border-b border-gray-50 text-xs transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-green-50/50' : ''}`}
                      >
                        <div className="font-bold text-gray-900 flex justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] font-normal text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <span>|</span>
          <span>Bantuan</span>
          <span>|</span>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <img 
                src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} 
                alt="Avatar" 
                className="w-4 h-4 rounded-full bg-white object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="font-medium hover:text-[#FFD800] cursor-pointer" onClick={currentUser.role === 'admin' ? onOpenAdmin : undefined}>
                {currentUser.name}
              </span>
              {currentUser.role === 'admin' && (
                <span className="bg-[#FFD800] text-[#121212] text-[9px] font-extrabold px-1.5 py-0.5 rounded ml-1">
                  ADMIN
                </span>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="font-semibold hover:text-[#FFD800] transition-colors">
              Daftar / Login
            </button>
          )}
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => setSearchQuery('')}>
          <Logo size="md" />
        </div>

        {/* Shopee-style Search Bar */}
        <div className="relative w-full md:max-w-xl flex">
          <input
            type="text"
            placeholder="Cari deterjen, paket laundry premium, atau deep cleaning rumah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input px-4 py-2.5 rounded-l-xl text-sm pr-12 focus:ring-2 focus:ring-[#017A3E] border-r-0"
          />
          <button className="bg-[#017A3E] hover:bg-[#016533] text-white px-6 rounded-r-xl transition-all flex items-center justify-center border-l-0 shadow-sm active:scale-95 cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Actions - Cart & User menu */}
        <div className="flex items-center gap-5">
          {/* Cart Icon with Shopee styling */}
          <button 
            onClick={onOpenCart} 
            className="relative p-2.5 bg-white/80 hover:bg-white rounded-xl border border-gray-100 shadow-sm text-gray-700 hover:text-[#017A3E] transition-all cursor-pointer active:scale-95 duration-100"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FFD800] text-[#121212] border-2 border-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard / Profile Actions */}
          {currentUser && (
            <div className="flex gap-2">
              {currentUser.role === 'admin' && (
                <button 
                  onClick={onOpenAdmin} 
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#FFD800] text-[#121212] hover:bg-yellow-400 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 duration-100"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}
              <button 
                onClick={onLogout} 
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100 cursor-pointer active:scale-95 duration-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
