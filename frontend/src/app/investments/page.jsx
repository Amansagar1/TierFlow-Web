'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sprout,
  TrendingUp,
  Diamond,
  Star,
  Calendar,
  Wallet,
  Search,
  Plus,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Crown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '../../components/layout/AppLayout';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { investmentsApi } from '../../features/investments/investmentsApi';
import { walletApi } from '../../features/wallet/walletApi';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { extractErrorMessage } from '../../utils/errorHandler';

const PLAN_STYLES = {
  'growth-a': { themeColor: '#00B074', themeBg: '#E8F8F0', iconType: 'sprout' },
  'growth-b': { themeColor: '#D97706', themeBg: '#FEF3C7', iconType: 'trending' },
  'wealth': { themeColor: '#7B2CBF', themeBg: '#F3E8FF', iconType: 'diamond' },
  'premium': { themeColor: '#FF7A00', themeBg: '#FFF4E6', iconType: 'star' },
};

export default function InvestmentsPage() {
  const { user, refreshUser, updateUserBalance } = useAuth();
  const [plans, setPlans] = useState([]);
  const [investmentsData, setInvestmentsData] = useState({
    records: [],
    counts: { all: 0, active: 0, completed: 0, cancelled: 0 },
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingInvestment, setViewingInvestment] = useState(null);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('10000');

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, invRes] = await Promise.all([
        investmentsApi.getPlans(),
        investmentsApi.getInvestments({
          status: statusFilter,
          search: searchQuery,
          page,
          limit: 10,
        }),
      ]);

      const apiPlans = plansRes.data?.data?.plans || [];
      setPlans(
        apiPlans.map((p) => {
          const style = PLAN_STYLES[p.id] || {
            themeColor: p.color || '#D97706',
            themeBg: '#EBF3FF',
            iconType: 'trending',
          };
          return { ...p, ...style };
        })
      );

      const invData = invRes.data?.data;
      if (invData) {
        setInvestmentsData(invData);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load investments. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleOpenInvestModal = (plan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.minInvestment.toString());
    setIsModalOpen(true);
  };

  const handleCreateInvestment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const amount = Number(investAmount);
    if (isNaN(amount) || amount < selectedPlan.minInvestment) {
      toast.error(`Minimum investment amount is ${formatINR(selectedPlan.minInvestment)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await investmentsApi.createInvestment({
        planId: selectedPlan.id,
        amount,
      });

      toast.success(`Successfully invested ${formatINR(amount)} in ${selectedPlan.name}!`);
      setIsModalOpen(false);
      await fetchInvestments();
      await refreshUser();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to create investment.'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderPlanIcon = (type, className = 'w-4 h-4') => {
    switch (type) {
      case 'sprout':
        return <Sprout className={className} />;
      case 'trending':
        return <TrendingUp className={className} />;
      case 'diamond':
        return <Diamond className={className} />;
      case 'star':
        return <Star className={className} />;
      default:
        return <TrendingUp className={className} />;
    }
  };

  return (
    <AppLayout searchPlaceholder="Search investments, plans, etc...">
      <div className="space-y-3.5 sm:space-y-4 select-none">
        {/* ------------------------------ Header & Wallet Balance ------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Investments
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5">
              Choose a plan, invest and start earning daily ROI.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
              <span>Dashboard</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-slate-500">Investments</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-100 shadow-xs self-start sm:self-auto">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400">
                Wallet Balance
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {formatINR(user?.walletBalance ?? 0)}
              </p>
            </div>
            <button
              onClick={() => setAddFundsOpen(true)}
              className="ml-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Add Funds
            </button>
          </div>
        </div>

        {/* ------------------------------ Investment Plans Grid ------------------------------ */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Investment Plans
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Select a plan that suits your goals and start your investment journey.
              </p>
            </div>
            <button
              onClick={() => plans.length > 0 && handleOpenInvestModal(plans[0])}
              className="text-xs font-semibold text-[#D97706] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Plan Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {plans.map((plan) => {
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all duration-150 flex flex-col justify-between relative ${
                    isPopular
                      ? 'border-2 border-[#D97706]'
                      : 'border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#D97706] text-white rounded-md shadow-xs">
                      <Crown className="w-3 h-3" /> Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: plan.themeBg || '#E8F8F0',
                          color: plan.themeColor || '#00B074',
                        }}
                      >
                        {renderPlanIcon(plan.iconType, 'w-4 h-4 stroke-[2.2]')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {isPopular ? (
                            <>
                              Growth <span className="text-[#D97706]">Plan B</span>
                            </>
                          ) : (
                            plan.name
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          {plan.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="my-2.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-none">
                          {plan.dailyRoiPercentage}%
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Daily ROI</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-t border-slate-50">
                      <div className="bg-[#F8FAFC] p-2 rounded-xl flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {plan.durationDays} Days
                          </p>
                          <p className="text-[9px] text-slate-400 leading-tight">Duration</p>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFC] p-2 rounded-xl flex items-center gap-2">
                        <span
                          className="font-bold text-xs"
                          style={{ color: plan.themeColor || '#00B074' }}
                        >
                          ₹
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {formatINR(plan.minInvestment)}
                          </p>
                          <p className="text-[9px] text-slate-400 leading-tight">Min Investment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenInvestModal(plan)}
                    className="w-full mt-2.5 py-2 px-3 rounded-xl text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                    style={{
                      backgroundColor: plan.themeColor || '#D97706',
                    }}
                  >
                    Invest Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------ My Investments Table ------------------------------ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                My Investments
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                View and manage your investment history.
              </p>
            </div>

            <button
              onClick={() => handleOpenInvestModal(plans[1] || plans[0])}
              className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:brightness-110 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Investment</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { label: 'All', count: investmentsData.counts?.all ?? 0 },
                { label: 'Active', count: investmentsData.counts?.active ?? 0 },
                { label: 'Completed', count: investmentsData.counts?.completed ?? 0 },
                { label: 'Cancelled', count: investmentsData.counts?.cancelled ?? 0 },
              ].map((tab) => {
                const isActive = statusFilter.toLowerCase() === tab.label.toLowerCase();
                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setStatusFilter(tab.label);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-amber-200/80 font-bold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-xs text-slate-700 font-medium cursor-pointer hover:bg-slate-50">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>All Time</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search investments..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#F9FAFC] border border-slate-200/70 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#D97706] outline-none transition-all w-44 sm:w-52"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-8">
              <LoadingState message="Loading investments..." />
            </div>
          ) : error ? (
            <div className="py-8">
              <ErrorState message={error} onRetry={fetchInvestments} />
            </div>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                    <th className="py-2.5 px-3 font-medium">#</th>
                    <th className="py-2.5 px-3 font-medium">Plan Name</th>
                    <th className="py-2.5 px-3 font-medium">Amount</th>
                    <th className="py-2.5 px-3 font-medium">Daily ROI</th>
                    <th className="py-2.5 px-3 font-medium">Start Date</th>
                    <th className="py-2.5 px-3 font-medium">End Date</th>
                    <th className="py-2.5 px-3 font-medium">Total Earned</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {investmentsData.records && investmentsData.records.length > 0 ? (
                    investmentsData.records.map((inv, idx) => {
                      const rowNum = (page - 1) * 10 + idx + 1;
                      const planName = inv.planDetails?.planName || 'Growth Plan';
                      const isGrowthA = planName.includes('Plan A');
                      const isGrowthB = planName.includes('Plan B');
                      const isWealth = planName.includes('Wealth');

                      const statusUpper = inv.investmentStatus?.toUpperCase();
                      const isActive = statusUpper === 'ACTIVE';
                      const isCompleted = statusUpper === 'COMPLETED';

                      return (
                        <tr key={inv._id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-slate-500 font-normal">{rowNum}</td>
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
                            {formatINR(inv.investmentAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-normal">
                            {inv.dailyRoiPercentage}%
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-normal">
                            {formatDate(inv.startDate)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-normal">
                            {inv.endDate === 'Cancelled' ? 'Cancelled' : formatDate(inv.endDate)}
                          </td>
                          <td className="py-2.5 px-3 font-normal text-slate-800">
                            {formatINR(inv.totalRoiEarned || 0)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                                isActive
                                  ? 'bg-[#E8F8F0] text-[#00B074]'
                                  : isCompleted
                                  ? 'bg-[#FEF3C7] text-[#D97706]'
                                  : 'bg-[#FEECEC] text-[#FF3B30]'
                              }`}
                            >
                              {inv.investmentStatus || 'Active'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2 text-slate-400">
                              <button
                                onClick={() => {
                                  setViewingInvestment(inv);
                                  setDetailsModalOpen(true);
                                }}
                                className="p-1 hover:text-[#D97706] hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setViewingInvestment(inv);
                                  setDetailsModalOpen(true);
                                }}
                                className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                title="More Options"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                        No investments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 text-xs">
            <p className="text-slate-400 font-medium">
              Showing {investmentsData.records?.length > 0 ? (page - 1) * 10 + 1 : 0} to {(page - 1) * 10 + (investmentsData.records?.length || 0)} of {investmentsData.pagination?.total || 0} results
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button className="w-7 h-7 rounded-lg bg-[#D97706] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {page}
              </button>

              <button
                disabled={page >= (investmentsData.pagination?.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Modal: Investment Creation ------------------------------ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Invest in ${selectedPlan?.name || 'Plan'}`}
      >
        <form onSubmit={handleCreateInvestment} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Plan Duration:</span>
              <span className="font-bold text-slate-800">{selectedPlan?.durationDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Daily Return:</span>
              <span className="font-bold text-emerald-600">{selectedPlan?.dailyRoiPercentage}% Daily</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Minimum Amount:</span>
              <span className="font-bold text-slate-800">{formatINR(selectedPlan?.minInvestment || 0)}</span>
            </div>
          </div>

          <Input
            label="Investment Amount (₹)"
            type="number"
            min={selectedPlan?.minInvestment || 1000}
            step="500"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
            helperText={`Minimum ₹${selectedPlan?.minInvestment?.toLocaleString()}`}
            required
          />
          {Number(investAmount) > 0 && selectedPlan && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-blue-100 text-xs space-y-1.5">
              <p className="font-bold text-blue-900">Projected Returns:</p>
              <div className="flex justify-between text-blue-800">
                <span>Daily ROI Return:</span>
                <span className="font-bold">
                  {formatINR((Number(investAmount) * selectedPlan.dailyRoiPercentage) / 100, true)}/day
                </span>
              </div>
              <div className="flex justify-between text-blue-800">
                <span>Estimated Total ROI ({selectedPlan.durationDays} Days):</span>
                <span className="font-bold text-emerald-600">
                  {formatINR(
                    ((Number(investAmount) * selectedPlan.dailyRoiPercentage) / 100) *
                      selectedPlan.durationDays
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Confirm Investment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------ Modal: View Investment Details ------------------------------ */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Investment Details"
      >
        {viewingInvestment && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-bold text-slate-800">
                  {viewingInvestment.planDetails?.planName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Investment Amount:</span>
                <span className="font-extrabold text-slate-900">
                  {formatINR(viewingInvestment.investmentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Return:</span>
                <span className="font-bold text-emerald-600">
                  {viewingInvestment.dailyRoiPercentage}% / day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="text-slate-800">{formatDate(viewingInvestment.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maturity / End Date:</span>
                <span className="text-slate-800">
                  {viewingInvestment.endDate === 'Cancelled'
                    ? 'Cancelled'
                    : formatDate(viewingInvestment.endDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total ROI Credited:</span>
                <span className="font-extrabold text-emerald-600">
                  {formatINR(viewingInvestment.totalRoiEarned || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Status:</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                    viewingInvestment.investmentStatus === 'ACTIVE'
                      ? 'bg-[#E8F8F0] text-[#00B074]'
                      : viewingInvestment.investmentStatus === 'COMPLETED'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-[#FEECEC] text-[#FF3B30]'
                  }`}
                >
                  {viewingInvestment.investmentStatus}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ------------------------------ Modal: Add Funds ------------------------------ */}
      <Modal
        isOpen={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
        title="Add Funds to Wallet"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            For demonstration and assessment testing, enter an amount to credit to your wallet
            balance:
          </p>
          <Input
            label="Amount (₹)"
            type="number"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddFundsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const amt = Number(fundAmount);
                if (!amt || amt <= 0) {
                  toast.error('Please enter a valid amount');
                  return;
                }
                try {
                  const res = await walletApi.deposit({ amount: amt, method: 'UPI' });
                  if (res.data?.data?.walletBalance !== undefined) {
                    updateUserBalance(res.data.data.walletBalance);
                  }
                  await refreshUser();
                  toast.success(`Capital funds of ${formatINR(amt)} deposited successfully!`);
                  setAddFundsOpen(false);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Deposit failed');
                }
              }}
            >
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
