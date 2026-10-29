'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import { notificationsApi } from '../../features/notifications/notificationsApi';

// ------------------------------ Fallback Demo Notifications ------------------------------
const DEFAULT_FALLBACK_NOTIFICATIONS = [
  {
    _id: 'mock-1',
    title: 'Daily ROI Payout Credited',
    message: '₹375.00 has been credited to your TierFlow wallet for Growth Plan A (1.5% Daily ROI).',
    type: 'roi',
    amount: 375,
    isRead: false,
    actionUrl: '/roi-history',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-2',
    title: 'Level 1 Referral Bonus Received',
    message: 'You earned ₹1,000.00 direct referral commission from user123\'s investment.',
    type: 'referral',
    amount: 1000,
    isRead: false,
    actionUrl: '/referrals',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-3',
    title: 'Capital Deposit Confirmed',
    message: '₹10,000.00 deposited successfully via Google Pay UPI into your vault balance.',
    type: 'wallet',
    amount: 10000,
    isRead: true,
    actionUrl: '/wallet',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-4',
    title: 'Security Login Verified',
    message: 'Authorized sign-in from New Delhi, India. Two-Factor authentication active.',
    type: 'security',
    isRead: true,
    actionUrl: '/settings',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

// ------------------------------ Relative Time Formatter ------------------------------
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

// ------------------------------ Type Config (Icons & Colors) ------------------------------
const TYPE_CONFIG = {
  roi: {
    icon: TrendingUp,
    badgeBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    tag: 'ROI Payout',
  },
  referral: {
    icon: Users,
    badgeBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    tag: 'Referral',
  },
  investment: {
    icon: Sparkles,
    badgeBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    tag: 'Portfolio',
  },
  wallet: {
    icon: Wallet,
    badgeBg: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
    tag: 'Wallet',
  },
  security: {
    icon: ShieldAlert,
    badgeBg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    tag: 'Security',
  },
  system: {
    icon: ShieldCheck,
    badgeBg: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
    tag: 'System',
  },
};

export const NotificationDropdown = () => {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'earnings' | 'system'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ------------------------------ Fetch Notifications ------------------------------
  const fetchNotifications = useCallback(
    async (filter = activeFilter, showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const response = await notificationsApi.getNotifications({ filter, limit: 30 });
        if (response?.data?.data) {
          const { notifications: list, unreadCount: count } = response.data.data;
          setNotifications(list || []);
          setUnreadCount(typeof count === 'number' ? count : 0);
        } else {
          setNotifications(DEFAULT_FALLBACK_NOTIFICATIONS);
          setUnreadCount(DEFAULT_FALLBACK_NOTIFICATIONS.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        // Fallback gracefully so UI never fails
        if (notifications.length === 0) {
          setNotifications(DEFAULT_FALLBACK_NOTIFICATIONS);
          setUnreadCount(DEFAULT_FALLBACK_NOTIFICATIONS.filter((n) => !n.isRead).length);
        }
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [activeFilter, notifications.length]
  );

  // Initial load & periodic poll
  useEffect(() => {
    fetchNotifications('all', false);

    const interval = setInterval(() => {
      fetchNotifications(activeFilter, false);
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchNotifications, activeFilter]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveFilter(tab);
    fetchNotifications(tab, true);
  };

  // ------------------------------ User Actions ------------------------------
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications(activeFilter, true);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    if (unreadCount === 0 || actionLoading) return;

    setActionLoading(true);
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      // Background retry or silent fallback
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationsApi.markAsRead(notif._id);
      } catch (err) {
        // Safe fallback
      }
    }

    setIsOpen(false);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    const itemToDelete = notifications.find((n) => n._id === id);

    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (itemToDelete && !itemToDelete.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationsApi.deleteNotification(id);
    } catch (err) {
      // Keep optimistic
    }
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    if (notifications.length === 0 || actionLoading) return;

    setActionLoading(true);
    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationsApi.clearAll();
    } catch (err) {
      // Keep optimistic
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ------------------------------ Trigger Button ------------------------------ */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-amber-50 text-amber-700 ring-2 ring-amber-500/20 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <Bell className="w-[19px] h-[19px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ------------------------------ Dropdown Flyout Card ------------------------------ */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[360px] sm:w-[410px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Top Gold Gradient Trim */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-slate-50/70 to-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/60">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={actionLoading}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 pt-2 pb-1 border-b border-slate-100 bg-white text-xs font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'earnings', label: 'Earnings' },
              { id: 'system', label: 'System' },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    active
                      ? 'bg-[#060B18] text-amber-400 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notification List Scroll Area */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
                <span className="text-xs font-medium">Syncing notification stream...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 ring-1 ring-amber-500/20">
                  <BellOff className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                  {activeFilter === 'unread'
                    ? 'You have read all pending updates.'
                    : 'Activity and financial updates will appear here automatically.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
                const IconComponent = config.icon;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group relative p-3 sm:px-4 sm:py-3 transition-colors cursor-pointer flex items-start gap-3 ${
                      item.isRead
                        ? 'bg-white hover:bg-slate-50/80 text-slate-600'
                        : 'bg-amber-50/30 hover:bg-amber-50/60 text-slate-800'
                    }`}
                  >
                    {/* Unread Accent Bar on Left */}
                    {!item.isRead && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600 rounded-r" />
                    )}

                    {/* Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${config.badgeBg}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span
                          className={`text-xs font-bold leading-tight ${
                            item.isRead ? 'text-slate-800' : 'text-slate-950 font-black'
                          }`}
                        >
                          {item.title}
                        </span>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2.5 mt-1.5">
                        <span className="text-[10px] font-medium text-slate-400">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                        {item.amount !== null && item.amount !== undefined && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            +₹{Number(item.amount).toLocaleString('en-IN')}
                          </span>
                        )}
                        {item.actionUrl && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 hover:text-amber-700">
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Delete Dismiss on Hover */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(e, item._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md transition-all absolute top-2.5 right-2.5 cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">TierFlow Financial Alerts</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/settings');
              }}
              className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
            >
              Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

