'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Coins,
  Network,
  Wallet,
  ArrowRight,
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { referralsApi } from '../../features/referrals/referralsApi';
import { walletApi } from '../../features/wallet/walletApi';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function ReferralIncomePage() {
  const { user, updateUserBalance } = useAuth();
  const [data, setData] = useState({
    records: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    metrics: {
      totalLevelIncome: 0,
      directIncome: 0,
      totalReferrals: 0,
      directReferrals: 0,
      indirectReferrals: 0,
      l1Income: 0,
      l2Income: 0,
      l3Income: 0,
      barData: [],
      pieData: [],
    },
  });
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('All');
  const [chartPeriod, setChartPeriod] = useState('30D');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomeRes, directRes] = await Promise.all([
        referralsApi.getReferralIncome({
          level: levelFilter !== 'All' ? levelFilter.replace('L', '') : undefined,
          page,
          limit: 10,
        }),
        referralsApi.getDirectReferrals().catch(() => ({ data: { data: [] } })),
      ]);

      const resData = incomeRes.data?.data;
      if (resData) {
        setData({
          records: resData.records || [],
          pagination: resData.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
          metrics: {
            totalLevelIncome: resData.metrics?.totalLevelIncome || 0,
            directIncome: resData.metrics?.directIncome || 0,
            totalReferrals: resData.metrics?.totalReferrals || 0,
            directReferrals: resData.metrics?.directReferrals || 0,
            indirectReferrals: resData.metrics?.indirectReferrals || 0,
            l1Income: resData.metrics?.l1Income || 0,
            l2Income: resData.metrics?.l2Income || 0,
            l3Income: resData.metrics?.l3Income || 0,
            barData: resData.metrics?.barData || [],
            pieData: resData.metrics?.pieData || [],
          },
        });
      }
      const directList = directRes.data?.data || [];
      if (directList.length > 0) {
        const mappedRecent = directList.slice(0, 5).map((u, i) => ({
          username: u.fullName || u.email?.split('@')[0] || `User`,
          date: `Joined on ${formatDate(u.createdAt)}`,
          level: 'Level 1',
          color: i % 4 === 0 ? 'blue' : i % 4 === 1 ? 'green' : i % 4 === 2 ? 'orange' : 'teal',
        }));
        setRecentReferrals(mappedRecent);
      } else {
        setRecentReferrals([]);
      }
    } catch (err) {
      console.error('Fetch referral income error:', err);
      setError('Failed to load referral income records. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [levelFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayRecords = data.records.filter((rec) => {
    if (levelFilter !== 'All') {
      const targetLvl = levelFilter.replace('L', '');
      if (rec.referralLevel?.toString() !== targetLvl && rec.level !== levelFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const uName = rec.fromUser?.fullName || rec.fromUser || '';
      return (
        uName.toLowerCase().includes(q) ||
        rec.incomeAmount?.toString().includes(q) ||
        rec.incomeType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppLayout searchPlaceholder="Search users, investments, referrals...">
      <div className="space-y-3.5 sm:space-y-4 select-none">
        {/* ------------------------------ Header & Navigation ------------------------------ */}
        <div>
          <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Referral Income
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
            Track your referral earnings and level wise income.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
            <span>Dashboard</span>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-500">Referral Income</span>
          </div>
        </div>

        {/* ------------------------------ Referral Metric KPI Cards ------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7B2CBF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
              <Coins className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Total Level Income</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {formatINR(data.metrics?.totalLevelIncome ?? 0)}
                </h3>
                <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 18%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">From 3 levels</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C48C] text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Direct Referral Income</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {formatINR(data.metrics?.directIncome ?? 0)}
                </h3>
                <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> 12%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                From {data.metrics?.directReferrals ?? 0} direct referrals
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <Network className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Total Referrals</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {data.metrics?.totalReferrals ?? 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {data.metrics?.directReferrals ?? 0} Direct &nbsp;|&nbsp; {data.metrics?.indirectReferrals ?? 0} Indirect
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Available Balance</p>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {formatINR(user?.walletBalance ?? 0)}
                </h3>
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>Withdraw</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------ Referral Income Trend & Distribution Charts ------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Referral Income Trend
                </h3>
                <div className="flex items-center gap-3.5 mt-1.5 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    Direct Income
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C48C]" />
                    Level Income
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
                <BarChart
                  data={data.metrics?.barData || []}
                  margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                  barCategoryGap={8}
                >
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
                    ticks={[0, 200, 400, 600, 800, 1000]}
                    tickFormatter={(v) => (v === 0 ? '0' : v.toLocaleString())}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      formatINR(val),
                      name === 'Direct' ? 'Direct Income' : 'Level Income',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 20px -4px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Direct" stackId="a" fill="#D97706" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Level" stackId="a" fill="#00C48C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-2">
              Level Wise Income
            </h3>
            <div className="relative h-44 flex items-center justify-center my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.metrics?.pieData || []}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(data.metrics?.pieData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(val)} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute text-center pointer-events-none">
                <p className="text-base font-black text-slate-900 tracking-tight leading-tight">
                  {formatINR(data.metrics?.totalLevelIncome ?? 0)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Total Income</p>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-50 text-xs">
              {(data.metrics?.pieData || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-normal text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatINR(item.value ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------ Referral Income Table & Recent Referrals ------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Referral Income History
              </h3>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <div className="relative">
                  <select
                    value={levelFilter}
                    onChange={(e) => {
                      setLevelFilter(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-slate-700 font-medium outline-none cursor-pointer hover:bg-slate-50 focus:border-[#D97706]"
                  >
                    <option value="All">All Levels</option>
                    <option value="L1">Level 1 (Direct)</option>
                    <option value="L2">Level 2</option>
                    <option value="L3">Level 3</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-xs text-slate-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>All Time</span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by user, amount..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#D97706] outline-none transition-all w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>
            {loading ? (
              <div className="py-8">
                <LoadingState message="Loading referral income..." />
              </div>
            ) : error ? (
              <div className="py-8">
                <ErrorState message={error} onRetry={fetchData} />
              </div>
            ) : displayRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No referral income records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                      <th className="py-2.5 px-3 font-medium">#</th>
                      <th className="py-2.5 px-3 font-medium">Date</th>
                      <th className="py-2.5 px-3 font-medium">From User</th>
                      <th className="py-2.5 px-3 font-medium">Level</th>
                      <th className="py-2.5 px-3 font-medium">Income Amount</th>
                      <th className="py-2.5 px-3 font-medium">Type</th>
                      <th className="py-2.5 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {displayRecords.map((item, idx) => {
                      const rowNum = (page - 1) * 10 + idx + 1;
                      const fromUser = item.fromUser?.fullName || item.fromUser?.email?.split('@')[0] || (typeof item.fromUser === 'string' ? item.fromUser : 'N/A');
                      const lvl = item.level || `L${item.referralLevel || 1}`;

                      return (
                        <tr key={item._id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 font-normal">{rowNum}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-normal">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-2.5 px-3 font-normal text-slate-800">{fromUser}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-normal">{lvl}</td>
                          <td className="py-2.5 px-3 font-normal text-slate-800">
                            {formatINR(item.incomeAmount ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-normal">
                            {item.incomeType || (lvl === 'L1' ? 'Direct Income' : 'Level Income')}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E8F8F0] text-[#00B074]">
                              Credited
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 text-xs">
              <p className="text-slate-400 font-medium">
                Showing {displayRecords.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
                {Math.min(page * 10, data.pagination?.total || 0)} of {data.pagination?.total || 0} results
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(data.pagination?.totalPages || 1, 5) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      page === pageNum
                        ? 'bg-[#D97706] text-white shadow-xs'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={page >= (data.pagination?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Recent Referrals
                </h4>
                <Link
                  href={ROUTES.REFERRAL_TREE}
                  className="text-xs font-semibold text-[#D97706] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentReferrals.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent referrals found.</p>
                ) : (
                  recentReferrals.map((userItem, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            userItem.color === 'blue'
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : userItem.color === 'green'
                              ? 'bg-[#E8F8F0] text-[#00B074]'
                              : userItem.color === 'orange'
                              ? 'bg-[#FFF4E6] text-[#FF8A00]'
                              : 'bg-[#E6F8F6] text-[#00A389]'
                          }`}
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {userItem.username}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            {userItem.date}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          userItem.level === 'Level 1'
                            ? 'bg-[#FEF3C7] text-[#D97706]'
                            : userItem.level === 'Level 2'
                            ? 'bg-[#E8F8F0] text-[#00B074]'
                            : 'bg-[#F3E8FF] text-[#7B2CBF]'
                        }`}
                      >
                        {userItem.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Link
              href={ROUTES.REFERRAL_TREE}
              className="mt-5 w-full py-2 rounded-xl border border-[#D97706] text-[#D97706] hover:bg-amber-50 text-xs font-bold text-center block transition-colors cursor-pointer"
            >
              View All Referrals &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------ Modal: Withdrawal Settlement ------------------------------ */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Withdraw Funds"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Available wallet balance:{' '}
            <span className="font-bold text-slate-800">
              {formatINR(user?.walletBalance ?? 0)}
            </span>
          </p>
          <Input
            label="Withdrawal Amount (₹)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const amt = Number(withdrawAmount);
                if (!amt || amt <= 0) {
                  toast.error('Please enter a valid amount');
                  return;
                }
                if (amt > (user?.walletBalance ?? 0)) {
                  toast.error('Insufficient available balance');
                  return;
                }
                try {
                  const res = await walletApi.withdraw({ amount: amt });
                  if (res.data?.data?.walletBalance !== undefined) {
                    updateUserBalance(res.data.data.walletBalance);
                  }
                  toast.success(`Withdrawal request of ${formatINR(amt)} placed!`);
                  setWithdrawModalOpen(false);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Withdrawal failed');
                }
              }}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
