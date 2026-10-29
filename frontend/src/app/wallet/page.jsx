'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  Plus,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  TrendingUp,
  Network,
  QrCode,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { walletApi } from '../../features/wallet/walletApi';
import { authApi } from '../../features/auth/authApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

// ------------------------------ Custom Cashflow Chart Tooltip ------------------------------
function CustomCashflowTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/50 text-xs min-w-[150px]">
        <p className="font-bold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700/60">
          {label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              Inflow:
            </span>
            <span className="font-extrabold text-white">
              {formatINR(payload[0]?.value || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-[#00C48C]" />
              Balance:
            </span>
            <span className="font-extrabold text-white">
              {formatINR(payload[1]?.value || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function WalletPage() {
  const { user, updateUserBalance, refreshUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('5000');
  const [depositMethod, setDepositMethod] = useState('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState('2000');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('30D');
  const [page, setPage] = useState(1);
  const [bankInfo, setBankInfo] = useState({
    bankName: user?.bankDetails?.bankName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    holderName: user?.bankDetails?.holderName || user?.fullName || '',
    ifsc: user?.bankDetails?.ifsc || '',
    branch: user?.bankDetails?.branch || '',
  });

  useEffect(() => {
    if (user?.bankDetails) {
      setBankInfo({
        bankName: user.bankDetails.bankName || '',
        accountNumber: user.bankDetails.accountNumber || '',
        holderName: user.bankDetails.holderName || user.fullName || '',
        ifsc: user.bankDetails.ifsc || '',
        branch: user.bankDetails.branch || '',
      });
    }
  }, [user]);
  const fetchOverview = useCallback(async () => {
    try {
      const res = await walletApi.getOverview();
      if (res.data?.data) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Wallet overview error:', err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);
  const fetchTransactions = useCallback(async () => {
    setLoadingTxns(true);
    try {
      const res = await walletApi.getTransactions({
        category: activeTab !== 'all' ? activeTab : undefined,
        search: searchQuery || undefined,
        page,
        limit: 8,
      });
      if (res.data?.data) {
        setTransactions(res.data.data.records || []);
        setTotalRecords(res.data.data.pagination?.total || 0);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Wallet transactions error:', err);
    } finally {
      setLoadingTxns(false);
    }
  }, [activeTab, searchQuery, page]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const availableBalance = overview?.walletBalance ?? user?.walletBalance ?? 0;
  const totalRoi = overview?.totalRoiEarned ?? user?.totalRoiEarned ?? 0;
  const totalLevel = overview?.totalLevelIncomeEarned ?? user?.totalLevelIncomeEarned ?? 0;
  const totalWithdrawn = overview?.totalWithdrawn ?? 0;
  const liveCashflow = overview?.cashflow || [];
  const handleDepositSubmit = async () => {
    const val = Number(depositAmount);
    if (!val || val <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }
    try {
      const res = await walletApi.deposit({ amount: val, method: depositMethod });
      if (res.data?.data?.walletBalance !== undefined) {
        updateUserBalance(res.data.data.walletBalance);
      }
      toast.success(`Deposit request of ${formatINR(val)} via ${depositMethod} completed!`);
      setDepositModalOpen(false);
      fetchOverview();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdrawSubmit = async () => {
    const val = Number(withdrawAmount);
    if (!val || val <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (val > availableBalance) {
      toast.error('Insufficient available balance');
      return;
    }
    try {
      const res = await walletApi.withdraw({
        amount: val,
        destination: `${bankInfo.bankName} (${bankInfo.accountNumber})`,
      });
      if (res.data?.data?.walletBalance !== undefined) {
        updateUserBalance(res.data.data.walletBalance);
      }
      toast.success(`Withdrawal of ${formatINR(val)} submitted! Processing to bank...`);
      setWithdrawModalOpen(false);
      fetchOverview();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  return (
    <AppLayout searchPlaceholder="Search transactions, deposits, withdrawals...">
      <div className="space-y-4">
        {/* ------------------------------ Header & Navigation ------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Wallet & Earnings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your capital, deposits, withdrawals, and payout methods.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
              <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-500 font-medium">Wallet</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setDepositModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit Funds</span>
            </button>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* ------------------------------ Core KPI Metric Cards ------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#D97706] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-slate-500">Available Balance</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {formatINR(availableBalance)}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 14.8%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Withdrawable anytime</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#00C48C] flex items-center justify-center text-white shrink-0 shadow-xs">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-slate-500">Total ROI Income</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {formatINR(totalRoi)}
                </h3>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  Daily
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">From active plans</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#7B2CBF] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium text-slate-500">Total Referral Income</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {formatINR(totalLevel)}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 18%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">From referral network</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FF8A00] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Total Withdrawn</p>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {formatINR(totalWithdrawn)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {overview?.completedWithdrawalsCount ?? 0} Completed &nbsp;|&nbsp; {overview?.pendingWithdrawalsCount ?? 0} Pending
              </p>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-12 gap-3.5 sm:gap-4">
          {/* ------------------------------ Left Column: Cashflow Chart & Transactions ------------------------------ */}
          <div className="col-span-12 lg:col-span-8 space-y-3.5 sm:space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Cashflow & Balance Growth
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Monthly credits, ROI payouts, and net wallet trajectory.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      Inflow
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00C48C]" />
                      Balance
                    </span>
                  </div>
                  <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50/50 text-[11px] font-semibold text-slate-600">
                    {['7D', '30D', '90D', 'All'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                          timeframe === t
                            ? 'bg-white text-[#D97706] shadow-2xs font-bold'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-60 sm:h-64 mt-3 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liveCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="walletInflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="walletBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C48C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00C48C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip content={<CustomCashflowTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="inflow"
                      name="Inflow"
                      stroke="#D97706"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#walletInflowGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke="#00C48C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#walletBalanceGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Transaction History
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Detailed log of all credits, earnings, deposits, and bank settlements.
                  </p>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-b border-slate-100 text-xs">
                {[
                  { key: 'all', label: 'All Transactions' },
                  { key: 'roi', label: 'ROI Payouts' },
                  { key: 'referral', label: 'Referral Bonuses' },
                  { key: 'deposit', label: 'Deposits' },
                  { key: 'withdrawal', label: 'Withdrawals' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-amber-50 text-[#D97706] border border-amber-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Transaction</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Method / Source</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {loadingTxns ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                          Loading transactions...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((txn) => {
                        const txnId = txn.transactionId || txn.id || 'TXN-00000';
                        return (
                          <tr key={txn._id || txnId} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3">
                              <p className="font-extrabold text-slate-900 font-mono text-[11px]">
                                {txnId}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                {txn.description}
                              </p>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  txn.category === 'roi'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : txn.category === 'referral'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                    : txn.category === 'deposit'
                                    ? 'bg-amber-50 text-amber-700 border border-blue-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}
                              >
                                {txn.type}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                              {formatDate(txn.date)}
                            </td>

                            <td className="py-3 px-3 text-slate-600 text-[11px]">
                              {txn.method}
                            </td>

                            <td className="py-3 px-3 text-right font-extrabold whitespace-nowrap">
                              <span className={txn.isCredit ? 'text-emerald-600' : 'text-slate-900'}>
                                {txn.isCredit ? '+' : '-'}
                                {formatINR(txn.amount)}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" />
                                {txn.status || 'Completed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs">
                <p className="text-[11px] text-slate-400">
                  Showing 1 to {transactions.length} of {totalRecords} entries
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold text-[#D97706] bg-amber-50 rounded-md">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------ Right Column: Virtual Card, Limits & Bank Payout ------------------------------ */}
          <div className="col-span-12 lg:col-span-4 space-y-3.5 sm:space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12151E] via-[#211B10] to-[#0D1017] p-5 text-white shadow-xl shadow-amber-950/40 border border-amber-500/30">
              <div className="absolute -right-12 -top-12 w-44 h-44 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide text-white">
                    Tier<span className="text-amber-400 font-black">Flow</span>
                  </h4>
                  <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">
                    Fintech Digital Wallet
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </div>
              <div className="relative z-10 w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/60 shadow-xs mb-4 flex items-center justify-around px-1">
                <span className="w-px h-3 bg-amber-700/40" />
                <span className="w-px h-3 bg-amber-700/40" />
              </div>
              <div className="relative z-10 font-mono tracking-widest text-sm text-slate-200 font-bold mb-4">
                •••• &nbsp; •••• &nbsp; •••• &nbsp; {user?._id ? user._id.toString().slice(-4).toUpperCase() : '4289'}
              </div>
              <div className="relative z-10 flex items-end justify-between text-xs pt-1 border-t border-white/10">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Card Holder</p>
                  <p className="font-bold text-white text-xs tracking-wider">
                    {user?.fullName?.toUpperCase() || 'MEMBER'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Expires</p>
                  <p className="font-bold text-white text-xs tracking-wider">09/29</p>
                </div>
                <div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
                Quick Transfer & Limits
              </h3>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Daily Limit Used</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(totalWithdrawn)} / {formatINR(50000)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#D97706] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalWithdrawn / 50000) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Remaining daily quota: {formatINR(Math.max(0, 50000 - totalWithdrawn))}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setDepositModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Deposit
                </button>
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  Withdraw
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Payout Bank Account
                </h3>
                <button
                  onClick={() => setBankModalOpen(true)}
                  className="text-[11px] font-semibold text-[#D97706] border border-slate-200 hover:bg-slate-50 rounded-lg px-2.5 py-0.5 transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 leading-tight">
                        {bankInfo.bankName || 'No bank linked'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {bankInfo.accountNumber || 'Click edit to configure'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Verified
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-slate-400">Holder: </span>
                    <span className="font-bold text-slate-800">{bankInfo.holderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">IFSC: </span>
                    <span className="font-bold text-slate-800 font-mono">{bankInfo.ifsc}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[10px] text-slate-400 leading-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  All payout requests are processed via Instant IMPS with automated ledger settlement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Modal: Deposit Capital ------------------------------ */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title="Deposit Capital to Wallet"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Select or enter the amount you want to add to your TierFlow investment wallet.
          </p>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Quick Select Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1000', '5000', '10000', '25000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    depositAmount === amt
                      ? 'bg-amber-50 border-blue-600 text-[#D97706]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ₹{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Deposit Amount (₹)"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="e.g. 5000"
          />
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'UPI', label: 'UPI / QR', icon: QrCode },
                { key: 'IMPS', label: 'Net Banking', icon: Building },
                { key: 'USDT', label: 'USDT TRC20', icon: CreditCard },
              ].map((m) => {
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setDepositMethod(m.key)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      depositMethod === m.key
                        ? 'bg-amber-50 border-blue-600 text-[#D97706] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Estimated Credit Time:</span>
            <span className="font-bold text-amber-700">Instant (0% Fee)</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDepositSubmit}>
              Proceed to Pay {formatINR(Number(depositAmount) || 0)}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ------------------------------ Modal: Withdraw Capital ------------------------------ */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Request Wallet Settlement"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Available Balance:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatINR(availableBalance)}
            </span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Select Percentage
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setWithdrawAmount(String(Math.floor((availableBalance * pct) / 100)))}
                  className="py-1.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Withdrawal Amount (₹)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="e.g. 2000"
          />

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Destination:</span>
              <span className="font-bold text-slate-900">
                {bankInfo.bankName} ({bankInfo.accountNumber})
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Processing Fee:</span>
              <span className="font-bold text-emerald-600">₹ 0 (Free)</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 font-bold">
              <span className="text-slate-800">Net Settlement:</span>
              <span className="text-[#D97706]">{formatINR(Number(withdrawAmount) || 0)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleWithdrawSubmit}>
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>

      {/* ------------------------------ Modal: Edit Bank Account ------------------------------ */}
      <Modal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        title="Update Payout Bank Details"
      >
        <div className="space-y-3.5 text-xs">
          <Input
            label="Bank Name"
            type="text"
            value={bankInfo.bankName}
            onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
            placeholder="e.g. HDFC Bank Ltd."
          />
          <Input
            label="Account Holder Name"
            type="text"
            value={bankInfo.holderName}
            onChange={(e) => setBankInfo({ ...bankInfo, holderName: e.target.value })}
            placeholder="As on passbook"
          />
          <Input
            label="Account Number"
            type="text"
            value={bankInfo.accountNumber}
            onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
            placeholder="Account number"
          />
          <Input
            label="IFSC Code"
            type="text"
            value={bankInfo.ifsc}
            onChange={(e) => setBankInfo({ ...bankInfo, ifsc: e.target.value.toUpperCase() })}
            placeholder="e.g. HDFC0001234"
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setBankModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const rawAcc = String(bankInfo.accountNumber || '').replace(/\s+/g, '');
                  const masked = rawAcc.length >= 4 ? '•••• ' + rawAcc.slice(-4) : rawAcc;
                  await authApi.updateProfile({
                    bankDetails: {
                      ...bankInfo,
                      accountNumberMasked: masked,
                      verified: true,
                    },
                  });
                  if (refreshUser) await refreshUser();
                  toast.success('Payout bank details updated and saved!');
                  setBankModalOpen(false);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to update bank details');
                }
              }}
            >
              Save Bank Details
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
