import React, { useEffect } from 'react';
import { Bell, Sparkles, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationToastProps {
  notification: SystemNotification | null;
  onClose: () => void;
}

export default function NotificationToast({ notification, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000); // closes after 7s
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-slide-in p-0.5 rounded-[24px] bg-gradient-to-r from-[#017A3E] via-[#FFD800] to-[#017A3E] shadow-2xl">
      <div className="bg-white rounded-[23px] p-4 flex gap-3.5 items-start relative overflow-hidden">
        
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl"></div>

        {/* Icon based on notification type */}
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#017A3E] shrink-0 border border-green-100/60 shadow-sm">
          {notification.type === 'order_created' && <ShoppingBag className="w-5 h-5 text-[#017A3E]" />}
          {notification.type === 'order_paid' && <ShieldCheck className="w-5 h-5 text-[#017A3E]" />}
          {notification.type === 'order_shipped' && <Sparkles className="w-5 h-5 text-[#017A3E]" />}
          {!['order_created', 'order_paid', 'order_shipped'].includes(notification.type) && <Bell className="w-5 h-5" />}
        </div>

        {/* Notification details */}
        <div className="flex-1 min-w-0 pr-4">
          <span className="text-[9px] font-extrabold text-[#017A3E] uppercase tracking-wider block">
            Aktivitas Real-Time ⚡
          </span>
          <h5 className="font-bold text-xs text-gray-900 mt-0.5 leading-snug">
            {notification.title}
          </h5>
          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
            {notification.message}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1 rounded-full hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
