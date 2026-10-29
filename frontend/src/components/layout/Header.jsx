'use client';

import React, { useState } from 'react';
import { Menu, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../constants/routes';
import { NotificationDropdown } from './NotificationDropdown';

export const Header = ({ onOpenMobileMenu, searchPlaceholder = 'Search investments, users, etc...' }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-5 sm:px-7 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* ------------------------------ Mobile Hamburger & Global Search ------------------------------ */}
      <div className="flex items-center gap-3.5 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#F4F7FC] hover:bg-[#EEF3FA] focus:bg-white text-slate-800 text-xs sm:text-[13px] rounded-xl border border-slate-200/60 focus:border-[#D97706] focus:ring-2 focus:ring-amber-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ------------------------------ Notifications & User Profile ------------------------------ */}
      <div className="flex items-center gap-3 sm:gap-4 pl-3">
        <NotificationDropdown />

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#060B18] ring-1 ring-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs">
              {getInitials(user?.fullName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[10px] font-medium text-slate-400 leading-tight">
                {user?.accountStatus || 'Active Member'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.fullName || 'User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push(ROUTES.PROFILE);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};