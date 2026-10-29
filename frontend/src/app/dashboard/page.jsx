'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Coins,
  TrendingUp,
  Users,
  Wallet,
  Copy,
  Check,
  ChevronRight,
  ArrowUp,
  Sprout,
  BarChart2,
  Clock,
  Layers,
  User,
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
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { dashboardApi } from '../../features/dashboard/dashboardApi';
import { investmentsApi } from '../../features/investments/investmentsApi';
import { ROUTES } from '../../constants/routes';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('30D');
  const [chartData, setChartData] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, chartRes, plansRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getEarnings(chartPeriod.toLowerCase()),
        investmentsApi.getPlans().catch(() => ({ data: { data: { plans: [] } } })),
      ]);
      setSummary(sumRes.data.data);
      setChartData(chartRes.data?.data?.data || []);
      setAvailablePlans(plansRes.data?.data?.plans || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  }, [chartPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const referralCode =
    summary?.referralSummary?.referralCode ||
    summary?.user?.referralCode ||
    '';

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const topDirects = summary?.referralSummary?.topDirectReferrals || [];

  return (
    <AppLayout>
      {loading ? (
        <LoadingState message="Loading your investment dashboard..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="space-y-3.5 sm:space-y-4 select-none">
          {/* ------------------------------ Dashboard Header & Referral Badges ------------------------------ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                Dashboard
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
                Welcome back, {summary?.user?.fullName?.split(' ')[0] || 'User'}! Here&apos;s your investment overview.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3 px-3.5 py-1.5 bg-[#EAF2FF] border border-blue-100 rounded-xl">
                <div>
                  <p className="text-[10px] font-medium text-slate-500">
                    Your Referral Code
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 tracking-wider">
                    {referralCode || '—'}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-lg text-[#D97706] hover:bg-amber-100/70 transition-transform active:scale-95 cursor-pointer ml-0.5"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-100 rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-[#D97706] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">Total Referrals</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {summary?.referralSummary?.totalReferrals ?? 0}{' '}
                    <span className="text-[11px] font-normal text-slate-400 ml-1">Direct</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------ Core Metric KPI Cards ------------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
            <div
              onClick={() => router.push(ROUTES.INVESTMENTS)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                  <Coins className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500">Total Investments</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {formatINR(summary?.kpis?.totalInvestments?.amount ?? 0)}
                    </h3>
                    <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 12%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2.5 border-t border-slate-50 text-xs font-normal text-slate-400">
                <span>{summary?.kpis?.totalInvestments?.activePlansCount ?? 0} Active Plans</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
            <div
              onClick={() => router.push(ROUTES.ROI_HISTORY)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C48C] text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                  <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500">Daily ROI</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {formatINR(summary?.kpis?.dailyRoi?.amount ?? 0)}
                    </h3>
                    <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 5%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2.5 border-t border-slate-50 text-xs font-normal text-slate-400">
                <span>From active investments</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
            <div
              onClick={() => router.push(ROUTES.REFERRAL_INCOME)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7B2CBF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500">Total Level Income</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {formatINR(summary?.kpis?.totalLevelIncome?.amount ?? 0)}
                    </h3>
                    <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 18%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2.5 border-t border-slate-50 text-xs font-normal text-slate-400">
                <span>From 3 levels</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
            <div
              onClick={() => router.push(ROUTES.WALLET)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                  <Wallet className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500">Wallet Balance</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {formatINR(summary?.kpis?.walletBalance?.amount ?? 0)}
                    </h3>
                    <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 8%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2.5 border-t border-slate-50 text-xs font-normal text-slate-400">
                <span>Available balance</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          </div>

          {/* ------------------------------ Analytics & Network Body Grid ------------------------------ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
            {/* ------------------------------ Left 7 Cols: Earnings Overview & Network Tree ------------------------------ */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Earnings Overview
                    </h3>
                    <div className="flex items-center gap-3.5 text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                        ROI Earnings
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00C48C]" />
                        Referral Income
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 self-start sm:self-auto">
                    {['7D', '30D', '3M', '1Y'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          chartPeriod === p
                            ? 'bg-[#D97706] text-white font-bold shadow-xs'
                            : 'bg-[#F1F4F9] text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-56 sm:h-60 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="roi-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D97706" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="ref-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00C48C" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#00C48C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="displayDate"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        ticks={[0, 500, 1000, 1500, 2000]}
                        tickFormatter={(v) => (v === 0 ? '0' : v.toLocaleString())}
                      />
                      <Tooltip
                        formatter={(val, name) => [
                          formatINR(val),
                          name === 'roiEarnings' ? 'ROI Earnings' : 'Referral Income',
                        ]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 8px 20px -4px rgba(0,0,0,0.06)',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="roiEarnings"
                        stroke="#D97706"
                        strokeWidth={2.5}
                        fill="url(#roi-grad)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="referralIncome"
                        stroke="#00C48C"
                        strokeWidth={2.5}
                        fill="url(#ref-grad)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#00C48C', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Your Referral Network
                  </h3>
                  <Link
                    href={ROUTES.REFERRAL_TREE}
                    className="text-xs font-semibold text-[#D97706] hover:underline"
                  >
                    View Tree
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3.5">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0F5FF] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Total Referrals
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {summary?.referralSummary?.totalReferrals ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#F0FDF4] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#00C48C] flex items-center justify-center shrink-0">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Direct Referrals
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {summary?.referralSummary?.directReferrals ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAF5FF] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#7B2CBF] flex items-center justify-center shrink-0">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500">
                        Total Level Income
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {formatINR(summary?.referralSummary?.totalLevelIncome ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#F9FBFC] border border-slate-100 flex flex-col items-center">
                  <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white flex items-center gap-2 shadow-xs">
                    <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-white">
                      <User className="w-3 h-3" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold leading-tight">
                        {summary?.user?.fullName || 'User'}
                      </span>
                      <span className="text-[10px] text-blue-200 ml-1.5 leading-tight">You</span>
                    </div>
                  </div>

                  {topDirects.length > 0 ? (
                    <>
                      <div className="w-[1.5px] h-3 bg-slate-300" />
                      <div className="w-48 sm:w-60 h-[1.5px] bg-slate-300 relative">
                        <div className="absolute -left-[1px] top-0 w-[1.5px] h-2.5 bg-slate-300" />
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[1.5px] h-2.5 bg-slate-300" />
                        <div className="absolute -right-[1px] top-0 w-[1.5px] h-2.5 bg-slate-300" />
                      </div>
                      <div className="flex items-center justify-between w-56 sm:w-72 pt-2.5">
                        {topDirects.map((child, idx) => (
                          <div key={child._id || idx} className="flex flex-col items-center text-center">
                            <div
                              className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs"
                              style={{
                                backgroundColor: ['#00B4D8', '#FF8A00', '#7B2CBF'][idx % 3],
                              }}
                            >
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-xs font-bold text-slate-900 mt-1 leading-tight max-w-[85px] truncate">
                              {child.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              {child.directReferralsCount ?? 0} Referrals
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="pt-3 text-center">
                      <p className="text-xs text-slate-400">No direct referrals joined yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ------------------------------ Right 5 Cols: Recent Investments & Plans ------------------------------ */}
            <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-slate-900">Recent Investments</h4>
                  <Link
                    href={ROUTES.INVESTMENTS}
                    className="text-xs font-semibold text-[#D97706] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                        <th className="pb-2 font-medium">Plan Name</th>
                        <th className="pb-2 font-medium">Amount</th>
                        <th className="pb-2 font-medium hidden sm:table-cell">Start Date</th>
                        <th className="pb-2 font-medium hidden md:table-cell">End Date</th>
                        <th className="pb-2 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {summary?.recentInvestments && summary.recentInvestments.length > 0 ? (
                        summary.recentInvestments.map((inv, idx) => {
                          const isActive = inv.status?.toUpperCase() === 'ACTIVE';
                          return (
                            <tr key={inv._id || idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2 font-normal text-slate-800">{inv.planName}</td>
                              <td className="py-2 font-normal text-slate-800">{formatINR(inv.amount)}</td>
                              <td className="py-2 text-slate-400 hidden sm:table-cell">
                                {formatDate(inv.startDate)}
                              </td>
                              <td className="py-2 text-slate-400 hidden md:table-cell">
                                {formatDate(inv.endDate)}
                              </td>
                              <td className="py-2 text-right">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                                    isActive
                                      ? 'bg-[#E8F8F0] text-[#00B074]'
                                      : 'bg-[#FEF3C7] text-[#D97706]'
                                  }`}
                                >
                                  {inv.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                            No recent investments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-slate-900">Recent Earnings</h4>
                  <Link
                    href={ROUTES.ROI_HISTORY}
                    className="text-xs font-semibold text-[#D97706] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">Amount</th>
                        <th className="pb-2 font-medium hidden sm:table-cell">Date</th>
                        <th className="pb-2 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {summary?.recentEarnings && summary.recentEarnings.length > 0 ? (
                        summary.recentEarnings.map((earn, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                    earn.type?.includes('ROI')
                                      ? 'bg-[#FEF3C7] text-[#D97706]'
                                      : 'bg-[#FFF4E6] text-[#FF8A00]'
                                  }`}
                                >
                                  <User className="w-3 h-3" />
                                </div>
                                <span className="font-normal text-slate-800">{earn.type}</span>
                              </div>
                            </td>
                            <td className="py-2 font-normal text-slate-800">{formatINR(earn.amount)}</td>
                            <td className="py-2 text-slate-400 hidden sm:table-cell">
                              {formatDate(earn.date)}
                            </td>
                            <td className="py-2 text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E8F8F0] text-[#00B074]">
                                {earn.status || 'Credited'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                            No recent earnings recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">Investment Plans</h4>
                  <Link
                    href={ROUTES.INVESTMENTS}
                    className="text-xs font-semibold text-[#D97706] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availablePlans.slice(0, 2).map((plan, idx) => (
                    <div
                      key={plan.id || idx}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-[#F9FBFC] flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                            idx === 0
                              ? 'bg-[#E8F8F0] text-[#00B074]'
                              : 'bg-[#F3E8FF] text-[#7B2CBF]'
                          }`}
                        >
                          {idx === 0 ? (
                            <Sprout className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">{plan.name}</h5>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {plan.dailyRoiPercentage}% Daily ROI
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          {idx !== 0 && <Clock className="w-3 h-3 text-slate-400" />}
                          {plan.durationDays} Days
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(ROUTES.INVESTMENTS)}
                        className="mt-3 w-full py-1.5 px-3 rounded-xl border border-[#D97706] text-[#D97706] hover:bg-amber-50 text-xs font-bold transition-colors cursor-pointer text-center block"
                      >
                        Invest Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
