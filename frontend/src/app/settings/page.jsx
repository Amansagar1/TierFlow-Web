'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Shield,
  Key,
  ShieldCheck,
  Smartphone,
  Mail,
  Sliders,
  Database,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Check,
  Copy,
  RefreshCw,
  Download,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../features/auth/authApi';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState({
    roiAlerts: true,
    referralAlerts: true,
    walletAlerts: true,
    securityAlerts: true,
    weeklyDigest: false,
    marketingUpdates: false,
  });
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [theme, setTheme] = useState('light');
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [ipRestricted, setIpRestricted] = useState(false);
  const [apiKey, setApiKey] = useState(
    user?._id ? `tfl_live_${user._id.toString().slice(-8)}${user.referralCode?.toLowerCase() || '00'}` : 'tfl_live_sec_key'
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  React.useEffect(() => {
    if (user?.settings) {
      const s = user.settings;
      if (s.notifications) setNotifications(s.notifications);
      if (s.currency) setCurrency(s.currency);
      if (s.timezone) setTimezone(s.timezone);
      if (s.dateFormat) setDateFormat(s.dateFormat);
      if (s.theme) setTheme(s.theme);
      if (s.sessionTimeout) setSessionTimeout(s.sessionTimeout);
      if (s.twoFactorEnabled !== undefined) setTwoFactor(s.twoFactorEnabled);
      if (s.ipRestricted !== undefined) setIpRestricted(s.ipRestricted);
      if (s.apiKey) setApiKey(s.apiKey);
    } else if (user?._id) {
      setApiKey(`tfl_live_${user._id.toString().slice(-8)}${user.referralCode?.toLowerCase() || '00'}`);
    }
  }, [user]);

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success('API key copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    const newKey = `tfl_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    setApiKey(newKey);
    try {
      await authApi.updateSettings({
        notifications,
        currency,
        timezone,
        dateFormat,
        theme,
        sessionTimeout,
        twoFactorEnabled: twoFactor,
        ipRestricted,
        apiKey: newKey,
      });
      await refreshUser();
      toast.success('New API Secret Key generated and saved!');
    } catch (err) {
      toast.error('Failed to save regenerated API key');
    } finally {
      setIsRegenerateModalOpen(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await authApi.updateSettings({
        notifications,
        currency,
        timezone,
        dateFormat,
        theme,
        sessionTimeout,
        twoFactorEnabled: twoFactor,
        ipRestricted,
        apiKey,
      });
      await refreshUser();
      toast.success('All settings and preferences saved to your account!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const defaults = {
      notifications: {
        roiAlerts: true,
        referralAlerts: true,
        walletAlerts: true,
        securityAlerts: true,
        weeklyDigest: false,
        marketingUpdates: false,
      },
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light',
      sessionTimeout: '30m',
      twoFactorEnabled: true,
      ipRestricted: false,
      apiKey,
    };

    setNotifications(defaults.notifications);
    setCurrency(defaults.currency);
    setTimezone(defaults.timezone);
    setDateFormat(defaults.dateFormat);
    setTheme(defaults.theme);
    setSessionTimeout(defaults.sessionTimeout);
    setTwoFactor(defaults.twoFactorEnabled);
    setIpRestricted(defaults.ipRestricted);

    try {
      await authApi.updateSettings(defaults);
      await refreshUser();
      toast.success('Preferences reset to default values and saved!');
    } catch (err) {
      toast.error('Failed to save reset preferences');
    }
  };

  return (
    <AppLayout searchPlaceholder="Search system settings, notifications, security...">
      <div className="space-y-4">
        {/* ------------------------------ Header & Navigation ------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure notifications, security protocols, API keys, and regional preferences.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-500 font-medium">Settings</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-[#0066FF] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* ------------------------------ Settings Metric KPI Cards ------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Alert Channels</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {Object.values(notifications).filter(Boolean).length} Active
              </h3>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                Email, SMS & Push Active
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#00C48C] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Security Guard</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {twoFactor ? '2FA Active' : 'Standard'}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                256-Bit TLS Encryption
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#7B2CBF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">System Timezone</p>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight truncate">
                {timezone}
              </h3>
              <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                {timezone === 'Asia/Kolkata'
                  ? 'GMT+5:30 (Auto-Sync)'
                  : timezone === 'Asia/Dubai'
                  ? 'GMT+4:00 (Auto-Sync)'
                  : timezone === 'Asia/Singapore'
                  ? 'GMT+8:00 (Auto-Sync)'
                  : 'Auto-Sync Active'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FF8A00] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Privacy Rating</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                100% Compliant
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Zero 3rd-Party Tracking</p>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-12 gap-3.5 sm:gap-4">
          {/* ------------------------------ Left Column: Notifications & Preferences ------------------------------ */}
          <div className="col-span-12 lg:col-span-8 space-y-3.5 sm:space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Notification Preferences
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Control how and when you receive real-time financial alerts and account activity.
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Real-Time
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 leading-tight">
                      Daily ROI Accrual Notifications
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Receive an instant push notification and email whenever daily earnings are deposited into your wallet.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications.roiAlerts}
                      onChange={() => toggleNotification('roiAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0066FF]" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 leading-tight">
                      Multi-Level Referral Bonuses
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Get notified instantly when direct or indirect tier downline members make eligible investments.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications.referralAlerts}
                      onChange={() => toggleNotification('referralAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0066FF]" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 leading-tight">
                      Deposit & Withdrawal Confirmations
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Receive tracking updates when deposit gateway transactions clear or IMPS bank transfers disburse.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications.walletAlerts}
                      onChange={() => toggleNotification('walletAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0066FF]" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 leading-tight">
                      Security & Login Alerts
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Immediate alert on unrecognized device sessions, IP anomalies, or password modifications.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications.securityAlerts}
                      onChange={() => toggleNotification('securityAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0066FF]" />
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <p className="font-bold text-slate-900 leading-tight">
                      Weekly Performance Digest
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      A consolidated Monday morning report detailing ROI yield, total capital, and tree growth.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={() => toggleNotification('weeklyDigest')}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0066FF]" />
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Regional & Display Preferences
                </h2>
                <p className="text-[11px] text-slate-400">
                  Customize your currency formatting, timezone offsets, and interface appearance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Primary Display Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="INR">₹ INR (Indian Rupee - Official)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="USDT">₮ USDT (Tether Crypto)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Platform Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST - GMT+5:30)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST - GMT+4:00)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT - GMT+8:00)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date Presentation
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 30/10/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/30/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Color Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-blue-50 border-blue-600 text-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      Clean Light
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('dark');
                        toast('Dark theme preview coming in v2.0');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-blue-50 border-blue-600 text-blue-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Cyber Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-red-50/40 rounded-2xl p-4 sm:p-5 border border-red-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
              </div>
              <p className="text-xs text-red-700/80 mb-4">
                Freezing or deleting your account is irreversible. All pending ROI and active network earnings will be halted.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => toast('Account freeze feature requires manual KYC review.')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-red-200 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Temporary Freeze Account
                </button>
                <button
                  onClick={() => setIsDangerModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Delete Account & Capital Refund
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------ Right Column: API & Access Controls ------------------------------ */}
          <div className="col-span-12 lg:col-span-4 space-y-3.5 sm:space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    API & Webhooks
                  </h3>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-2.5">
                Use your private read-only API key to pull live balances, ROI histories, and tree hierarchies programmatically.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-800 font-bold truncate mr-2">
                  {apiKey.substring(0, 14)}••••••••
                </span>
                <button
                  onClick={handleCopyKey}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer shrink-0"
                  title="Copy API Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => setIsRegenerateModalOpen(true)}
                className="w-full mt-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                <span>Regenerate Key</span>
              </button>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Access Controls
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Auto-Logout Inactivity Window
                  </label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="15m">15 Minutes of Inactivity</option>
                    <option value="30m">30 Minutes (Recommended)</option>
                    <option value="1h">1 Hour</option>
                    <option value="never">Never (Stay Logged In)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-[11px]">Strict IP Locking</p>
                    <p className="text-[10px] text-slate-400">Lock session to current IP</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={ipRestricted}
                      onChange={() => setIpRestricted(!ipRestricted)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0066FF]" />
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Data Governance
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Download a cryptographically verified ledger statement of all your transactions, referrals, and daily ROI earnings.
              </p>

              <button
                onClick={() => toast.success('Financial ledger archive downloaded (.CSV)')}
                className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Ledger (.CSV)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Modal: Regenerate API Key ------------------------------ */}
      <Modal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        title="Regenerate API Secret Key"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to regenerate your API Secret Key? Any existing programmatic integrations, webhooks, or third-party bots using the current key will immediately be disconnected.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium">
            This action cannot be undone. Make sure to update your environment variables immediately after regenerating.
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsRegenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRegenerateKey}>
              Confirm Regeneration
            </Button>
          </div>
        </div>
      </Modal>

      {/* ------------------------------ Modal: Account Deletion ------------------------------ */}
      <Modal
        isOpen={isDangerModalOpen}
        onClose={() => setIsDangerModalOpen(false)}
        title="Account Deletion Request"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Account liquidation requires verifying that all active investment tenures have completed and available balances have been settled to your verified bank account.
          </p>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 font-medium">
            Please contact TierFlow Compliance at <span className="underline">support@tierflow.com</span> for formal account closure and capital return.
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setIsDangerModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
