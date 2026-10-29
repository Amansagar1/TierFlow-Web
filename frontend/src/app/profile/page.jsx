'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Award,
  KeyRound,
  Smartphone,

  Laptop,
  CheckCircle2,
  Copy,
  Check,
  Edit2,
  Lock,
  ChevronRight,
  TrendingUp,
  Share2,
  AlertCircle,
  Clock,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../features/auth/authApi';
import { dashboardApi } from '../../features/dashboard/dashboardApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    country: user?.country || '',
    city: user?.city || '',
    address: user?.address || '',
  });
  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await dashboardApi.getSummary();
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Profile stats load error:', err);
      }
    }
    fetchStats();
  }, []);
  React.useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
      });
    }
  }, [user]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.settings?.twoFactorEnabled ?? true);

  React.useEffect(() => {
    if (user?.settings?.twoFactorEnabled !== undefined) {
      setTwoFactorEnabled(user.settings.twoFactorEnabled);
    }
  }, [user]);

  const referralCode = user?.referralCode || '';
  const referralLink = referralCode ? `https://tierflow.com/register?ref=${referralCode}` : 'https://tierflow.com/register';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({
        fullName: profileData.fullName,
        mobileNumber: profileData.mobileNumber,
        city: profileData.city,
        country: profileData.country,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
      });
      await refreshUser();
      toast.success('Profile details updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Current password incorrect');
    }
  };

  return (
    <AppLayout searchPlaceholder="Search account settings, profile, credentials...">
      <div className="space-y-4">
        {/* ------------------------------ Header & Navigation ------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              User Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal information, KYC verification, and account credentials.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-500 font-medium">Profile</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* ------------------------------ Profile Metric KPI Cards ------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#00C48C] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Account Status</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {user?.accountStatus || 'Active'}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                KYC {user?.kyc?.tier || 'Tier 1'} {user?.kyc?.status || 'Active'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Active Capital</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {formatINR(stats?.investmentSummary?.totalActiveInvestments ?? 0)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Across {stats?.investmentSummary?.activeInvestmentsCount ?? 0} active plans
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#7B2CBF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Referral Rank</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {(stats?.referralSummary?.totalReferrals || 0) > 10 ? 'Silver Ambassador' : 'Ambassador'}
              </h3>
              <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                {stats?.referralSummary?.totalReferrals ?? 0} Total Referrals
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FF8A00] flex items-center justify-center text-white shrink-0 shadow-xs">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Security Rating</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {user?.settings?.twoFactorEnabled ? 'High Protection' : 'Standard'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {user?.settings?.twoFactorEnabled ? '2FA & Session Guard On' : 'Standard Security'}
              </p>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-12 gap-3.5 sm:gap-4">
          {/* ------------------------------ Left Column: Identity Banner & Tabs ------------------------------ */}
          <div className="col-span-12 lg:col-span-8 space-y-3.5 sm:space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="h-24 sm:h-28 bg-gradient-to-r from-[#0066FF] via-[#0A4CC0] to-[#00C48C] relative p-4 flex items-end">
                <div className="absolute right-4 top-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold border border-white/20">
                  Investor ID: #{referralCode || 'TFL-0000'}
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-4">
                  <div className="flex items-end gap-3.5">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#0B1528] to-[#1E293B] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border-4 border-white shrink-0">
                      {(profileData.fullName || user?.fullName || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {profileData.fullName}
                        </h2>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {profileData.email} &nbsp;·&nbsp; {profileData.mobileNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-blue-600 block">
                        Referral Code
                      </span>
                      <span className="font-extrabold text-xs text-slate-900 font-mono tracking-wider">
                        {referralCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-b border-slate-100 pt-2 text-xs">
                  {[
                    { key: 'personal', label: 'Personal Information' },
                    { key: 'kyc', label: 'KYC & Documentation' },
                    { key: 'security', label: 'Security & Access' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer relative ${activeTab === tab.key
                        ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {activeTab === 'personal' && (
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Full Legal Name
                      </span>
                      <p className="text-xs font-bold text-slate-900">{profileData.fullName}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Registered Email Address
                      </span>
                      <p className="text-xs font-bold text-slate-900">{profileData.email}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Mobile Phone
                      </span>
                      <p className="text-xs font-bold text-slate-900">{profileData.mobileNumber}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Date of Birth & Gender
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {profileData.dateOfBirth} &nbsp;({profileData.gender})
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Country & City
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {profileData.city}, {profileData.country}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Residential Address
                      </span>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profileData.address}
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === 'kyc' && (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">National ID (Aadhaar Card)</p>
                          <p className="text-[10px] text-slate-400">
                            {user?.kyc?.aadhaarLast4 ? `•••• •••• •••• ${user.kyc.aadhaarLast4}` : 'Not provided'} {user?.kyc?.verifiedAt ? `· Verified on ${formatDate(user.kyc.verifiedAt)}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="bg-white text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {user?.kyc?.status || 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">Tax Identification (PAN Card)</p>
                          <p className="text-[10px] text-slate-400">
                            {user?.kyc?.pan || 'Not provided'} {user?.kyc?.verifiedAt ? `· Verified on ${formatDate(user.kyc.verifiedAt)}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="bg-white text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {user?.kyc?.status || 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">Bank Account Verification</p>
                          <p className="text-[10px] text-slate-400">
                            {user?.bankDetails?.bankName ? `${user.bankDetails.bankName} · A/C ${user.bankDetails.accountNumberMasked || user.bankDetails.accountNumber}` : 'Not linked'}
                          </p>
                        </div>
                      </div>
                      <span className="bg-white text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {user?.bankDetails?.verified ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )}
                {activeTab === 'security' && (
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-xs text-slate-900">Account Password</p>
                        <p className="text-[10px] text-slate-400">•••••••••••• · Encrypted with bcrypt</p>
                      </div>
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</p>
                        <p className="text-[10px] text-slate-400">
                          {twoFactorEnabled ? 'Google Authenticator Protection Active' : 'Two-factor protection disabled'}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const nextState = !twoFactorEnabled;
                          setTwoFactorEnabled(nextState);
                          try {
                            await authApi.updateSettings({ twoFactorEnabled: nextState });
                            await refreshUser();
                            toast.success(nextState ? '2FA enabled' : '2FA disabled');
                          } catch (err) {
                            toast.error('Failed to update 2FA setting');
                          }
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${twoFactorEnabled
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                      >
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Sponsor & Network Hierarchy
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {user?.referredBy?.fullName
                      ? `Referred by: ${user.referredBy.fullName} (${user.referredBy.referralCode})`
                      : 'Your upline sponsor link and multi-level commission percentages.'}
                  </p>
                </div>
                <Link
                  href="/referral-tree"
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  View Full Tree →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 block mb-0.5">
                    Level 1 Direct Bonus
                  </span>
                  <p className="text-lg font-extrabold text-blue-900">5.0%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">From direct invites</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 block mb-0.5">
                    Level 2 Indirect Bonus
                  </span>
                  <p className="text-lg font-extrabold text-emerald-900">2.0%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">From 2nd-tier members</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-600 block mb-0.5">
                    Level 3 Indirect Bonus
                  </span>
                  <p className="text-lg font-extrabold text-purple-900">1.0%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">From 3rd-tier members</p>
                </div>
              </div>
              <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="truncate mr-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your Exclusive Referral Invitation URL
                  </span>
                  <span className="text-xs text-blue-600 font-mono font-medium truncate block">
                    {referralLink}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------ Right Column: KYC Verification & Sessions ------------------------------ */}
          <div className="col-span-12 lg:col-span-4 space-y-3.5 sm:space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  KYC Verification
                </h3>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {user?.kyc?.tier || 'Tier 1'} {user?.kyc?.status || 'Active'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Identity Proof:</span>
                  <span className="font-bold text-slate-900">
                    {user?.kyc?.aadhaarLast4 ? `Aadhaar (•• ${user.kyc.aadhaarLast4})` : 'Not linked'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Tax ID:</span>
                  <span className="font-bold text-slate-900">
                    {user?.kyc?.pan ? `PAN (${user.kyc.pan})` : 'Not linked'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Bank A/C:</span>
                  <span className="font-bold text-slate-900">
                    {user?.bankDetails?.bankName
                      ? `${user.bankDetails.bankName.split(' ')[0]} (${user.bankDetails.accountNumberMasked || user.bankDetails.accountNumber?.slice(-4) || ''})`
                      : 'Not linked'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Liveness Photo:</span>
                  <span className="font-bold text-emerald-600">
                    {user?.kyc?.livenessScore ? `Passed (${user.kyc.livenessScore})` : (user?.kyc?.status === 'Approved' ? 'Passed' : 'Pending')}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-3 leading-tight">
                Your account is fully authorized for unlimited investments, instant daily ROI accrual, and bank settlements.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Active Sessions
                </h3>
                <span className="text-[10px] font-bold text-slate-400">1 Device</span>
              </div>

              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0066FF] flex items-center justify-center">
                        <Laptop className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 leading-tight">
                          Current Web Session
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {user?.city ? `${user.city}, ${user.country || ''}` : 'Current Device Session'} · Active now
                        </p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active now" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.success('Terminated other device sessions.')}
                className="w-full mt-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Log Out From Other Devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Modal: Edit Personal Information ------------------------------ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Personal Information"
      >
        <form onSubmit={handleProfileSave} className="space-y-3.5 text-xs">
          <Input
            label="Full Name"
            type="text"
            value={profileData.fullName}
            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
            placeholder="Aman Sagar"
            required
          />

          <Input
            label="Mobile Number"
            type="text"
            value={profileData.mobileNumber}
            onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              type="text"
              value={profileData.city}
              onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              placeholder="New Delhi"
            />
            <Input
              label="Country"
              type="text"
              value={profileData.country}
              onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
              placeholder="India"
            />
          </div>

          <Input
            label="Residential Address"
            type="text"
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            placeholder="Address line"
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------ Modal: Change Password ------------------------------ */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
      >
        <form onSubmit={handlePasswordSave} className="space-y-3.5 text-xs">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            placeholder="Enter current password"
            required
          />

          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            placeholder="Minimum 6 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            placeholder="Re-enter new password"
            required
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
