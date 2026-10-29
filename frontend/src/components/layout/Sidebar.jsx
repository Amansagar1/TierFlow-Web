'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Coins,
  TrendingUp,
  Users,
  Network,
  Wallet,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

function RibbonLogo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sb-tf-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="sb-tf-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <rect x="18" y="18" width="64" height="13" rx="6.5" fill="url(#sb-tf-gold)" />
      <rect x="37" y="18" width="13.5" height="64" rx="6.5" fill="url(#sb-tf-bronze)" />
      <rect x="37" y="39" width="37" height="13" rx="6.5" fill="url(#sb-tf-gold)" />
      <circle cx="81" cy="45.5" r="4.5" fill="#FDE68A" />
    </svg>
  );
}

const navItems = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Investments', path: ROUTES.INVESTMENTS, icon: Coins },
  { name: 'ROI History', path: ROUTES.ROI_HISTORY, icon: TrendingUp },
  { name: 'Referral Income', path: ROUTES.REFERRAL_INCOME, icon: Users },
  { name: 'Referral Tree', path: ROUTES.REFERRAL_TREE, icon: Network },
  { name: 'Wallet', path: ROUTES.WALLET, icon: Wallet },
  { name: 'Profile', path: ROUTES.PROFILE, icon: User },
  { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];

export const Sidebar = ({ isMobile = false, onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <aside className="w-60 bg-[#060B18] text-white flex flex-col h-full shrink-0 select-none z-30 border-r border-amber-500/10">
      {/* ------------------------------ Brand Header ------------------------------ */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-amber-500/10">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <RibbonLogo className="w-8 h-8 drop-shadow-md" />
          <div className="flex items-baseline">
            <span className="font-extrabold text-[19px] tracking-tight text-white">
              Tier<span className="text-[#F59E0B]">Flow</span>
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ------------------------------ Navigation Links ------------------------------ */}
      <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== ROUTES.DASHBOARD && pathname?.startsWith(item.path));

          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={isMobile ? onCloseMobile : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white shadow-lg shadow-amber-600/30 font-bold'
                  : 'text-slate-400 hover:text-amber-100 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ------------------------------ User Sign Out ------------------------------ */}
      <div className="p-3.5 border-t border-amber-500/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
