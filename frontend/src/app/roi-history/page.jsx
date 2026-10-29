'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Calendar,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Diamond,
  Star,
  Play,
  ArrowUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { roiApi } from '../../features/roi/roiApi';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function ROIHistoryPage() {
  const [data, setData] = useState({
    records: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    metrics: {
      totalRoiEarned: 0,
      totalRoiDays: 0,
      averageDailyRoi: 0,
      activeInvestmentsCount: 0,
      distribution: [],
      trend: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [chartPeriod, setChartPeriod] = useState('30D');
  const [investmentFilter, setInvestmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingCron, setIsProcessingCron] = useState(false);

  const fetchRoi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roiApi.getRoiHistory({
        page,
        limit: 10,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });

      const resData = res.data?.data;
      if (resData) {
        setData({
          records: resData.records || [],
          pagination: resData.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
          metrics: resData.metrics || {
            totalRoiEarned: 0,
            totalRoiDays: 0,
            averageDailyRoi: 0,
            activeInvestmentsCount: 0,
            distribution: [],
            trend: [],
          },
        });
      }
    } catch (err) {
      console.error('Fetch ROI history error:', err);
      setError('Failed to load ROI records. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchRoi();
  }, [fetchRoi]);

  const handleTriggerDailyCron = async () => {
    setIsProcessingCron(true);
    try {
      const res = await roiApi.triggerDailyRoi();
      const info = res.data.data;
      toast.success(
        `Daily ROI executed! Credited: ${info.credited}, Total: ${formatINR(info.totalAmountCredited)}`
      );
      await fetchRoi();
    } catch (err) {
      toast.error('Failed to trigger Daily ROI process.');
    } finally {
      setIsProcessingCron(false);
    }
  };

  const trendData = data.metrics?.trend || [];
  const distributionData = data.metrics?.distribution || [];
  const displayRecords = data.records.filter((rec) => {
    const pName = rec.investment?.planDetails?.planName || rec.planName || '';
    if (investmentFilter !== 'All' && !pName.toLowerCase().includes(investmentFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDate = formatDate(rec.date).toLowerCase().includes(q);
      const matchAmount = (rec.roiAmount || 0).toString().includes(q);
      const matchPlan = pName.toLowerCase().includes(q);
      return matchDate || matchAmount || matchPlan;
    }
    return true;
  });

  return (
    <AppLayout searchPlaceholder="Search investments, users, etc...">
      <div className="space-y-3.5 sm:space-y-4 select-none">
        {/* ------------------------------ Header & Date Filter ------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              ROI History
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
              View your daily ROI earnings from your investments.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
              <span>Dashboard</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-slate-500">ROI History</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleTriggerDailyCron}
              disabled={isProcessingCron}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl text-xs font-semibold text-[#D97706] transition-all cursor-pointer disabled:opacity-50"
              title="Manually trigger daily ROI check"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isProcessingCron ? 'Processing...' : 'Run Cron'}</span>
            </button>
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium shadow-xs cursor-pointer hover:bg-slate-50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>All Time</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* ------------------------------ ROI Metric KPI Cards ------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <Coins className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Total ROI Earned</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {formatINR(data.metrics?.totalRoiEarned ?? 0)}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> +12%
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C48C] text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Total ROI Days</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {data.metrics?.totalRoiDays ?? 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">out of 30 days</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7B2CBF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
              <Coins className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Average Daily ROI</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {formatINR(data.metrics?.averageDailyRoi ?? 0)}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-semibold text-[#00C48C] flex items-center gap-0.5">
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" /> +8%
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">Active Investments</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {data.metrics?.activeInvestmentsCount ?? 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">generating ROI</p>
            </div>
          </div>
        </div>

        {/* ------------------------------ ROI Earnings Trend & Distribution Charts ------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                ROI Earnings Trend
              </h3>
              <div className="flex items-center gap-1">
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
                  data={trendData}
                  margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="roiTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
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
                    ticks={[0, 250, 500, 750, 1000]}
                    tickFormatter={(v) => (v === 0 ? '0' : v.toLocaleString())}
                  />
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Daily ROI']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 8px 20px -4px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    fill="url(#roiTrendGrad)"
                    dot={{ r: 3.5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-2">
              Earnings Distribution
            </h3>
            <div className="relative h-44 flex items-center justify-center my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || (index === 0 ? '#D97706' : index === 1 ? '#00C48C' : '#7B2CBF')}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(val)} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute text-center pointer-events-none">
                <p className="text-base font-black text-slate-900 tracking-tight leading-tight">
                  {formatINR(data.metrics?.totalRoiEarned ?? 0)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Total Earnings</p>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-50 text-xs">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          item.color || (idx === 0 ? '#D97706' : idx === 1 ? '#00C48C' : '#7B2CBF'),
                      }}
                    />
                    <span className="font-normal text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900">{formatINR(item.amount)}</span>
                    <span className="text-slate-400 font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------ ROI History Details Table ------------------------------ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              ROI History Details
            </h3>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="relative">
                <select
                  value={investmentFilter}
                  onChange={(e) => setInvestmentFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-slate-700 font-medium outline-none cursor-pointer hover:bg-slate-50 focus:border-[#D97706]"
                >
                  <option value="All">All Investments</option>
                  <option value="Growth Plan A">Growth Plan A</option>
                  <option value="Growth Plan B">Growth Plan B</option>
                  <option value="Wealth Plan">Wealth Plan</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-slate-700 font-medium outline-none cursor-pointer hover:bg-slate-50 focus:border-[#D97706]"
                >
                  <option value="All">All Status</option>
                  <option value="Credited">Credited</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by date, amount..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#D97706] outline-none transition-all w-44 sm:w-52"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-8">
              <LoadingState message="Loading ROI history records..." />
            </div>
          ) : error ? (
            <div className="py-8">
              <ErrorState message={error} onRetry={fetchRoi} />
            </div>
          ) : displayRecords.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No ROI records match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                    <th className="py-2.5 px-3 font-medium">#</th>
                    <th className="py-2.5 px-3 font-medium">Date</th>
                    <th className="py-2.5 px-3 font-medium">Investment Plan</th>
                    <th className="py-2.5 px-3 font-medium">Investment Amount</th>
                    <th className="py-2.5 px-3 font-medium">Daily ROI (%)</th>
                    <th className="py-2.5 px-3 font-medium">ROI Amount</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {displayRecords.map((item, idx) => {
                    const rowNum = (page - 1) * 10 + idx + 1;
                    const planName =
                      item.investment?.planDetails?.planName || item.planName || 'Growth Plan A';
                    const isGrowthA = planName.includes('Plan A');
                    const isGrowthB = planName.includes('Plan B');
                    const isWealth = planName.includes('Wealth');

                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 font-normal">{rowNum}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-normal">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                isGrowthA
                                  ? 'bg-[#E8F8F0] text-[#00B074]'
                                  : isGrowthB
                                  ? 'bg-[#FEF3C7] text-[#D97706]'
                                  : isWealth
                                  ? 'bg-[#F3E8FF] text-[#7B2CBF]'
                                  : 'bg-[#FFF4E6] text-[#FF8A00]'
                              }`}
                            >
                              {isGrowthA ? (
                                <Sprout className="w-3 h-3" />
                              ) : isGrowthB ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : isWealth ? (
                                <Diamond className="w-3 h-3" />
                              ) : (
                                <Star className="w-3 h-3" />
                              )}
                            </div>
                            <span className="font-normal text-slate-800">{planName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-normal text-slate-800">
                          {formatINR(item.investment?.investmentAmount || item.investmentAmount || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-normal">
                          {item.dailyRoiPercentage ?? 0}%
                        </td>
                        <td className="py-2.5 px-3 font-normal text-slate-800">
                          {formatINR(item.roiAmount ?? 0)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#E8F8F0] text-[#00B074]">
                            Credited
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-normal">
                          {item.remarks || 'Daily ROI credited successfully'}
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
              Showing {displayRecords.length > 0 ? (page - 1) * 10 + 1 : 0} to {(page - 1) * 10 + displayRecords.length} of {data.pagination?.total || 0} results
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, data.pagination?.totalPages || 1) }, (_, i) => i + 1).map((pageNum) => (
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
      </div>
    </AppLayout>
  );
}
