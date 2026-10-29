const Investment = require('../models/Investment');
const User = require('../models/User');
const { INVESTMENT_PLANS, INVESTMENT_STATUS } = require('../constants/businessRules');
const { distributeReferralCommissions } = require('./referralService');
const notificationService = require('./notificationService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ------------------------------ Get Available Investment Plans ------------------------------
const getAvailablePlans = () => {
  return Object.values(INVESTMENT_PLANS);
};

// ------------------------------ Create New Investment ------------------------------
const createInvestment = async (userId, { planId, amount }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const plan = Object.values(INVESTMENT_PLANS).find((p) => p.id === planId);
  if (!plan) {
    throw new AppError('Invalid investment plan selected', 400);
  }

  const numericAmount = Number(amount);
  if (numericAmount < plan.minInvestment) {
    throw new AppError(
      `Minimum investment for ${plan.name} is ₹${plan.minInvestment.toLocaleString()}`,
      400
    );
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  const investment = await Investment.create({
    user: userId,
    investmentAmount: numericAmount,
    planDetails: {
      planId: plan.id,
      planName: plan.name,
      durationDays: plan.durationDays,
      subtitle: plan.subtitle,
      color: plan.color,
    },
    startDate,
    endDate,
    dailyRoiPercentage: plan.dailyRoiPercentage,
    investmentStatus: INVESTMENT_STATUS.ACTIVE,
    totalRoiEarned: 0,
  });

  logger.info(`New investment created: ID ${investment._id}, Amount: ₹${numericAmount} by User ${userId}`);

  // Safely trigger notification
  notificationService.createNotification({
    userId,
    title: 'Investment Activated',
    message: `Your ₹${numericAmount.toLocaleString()} investment in ${plan.name} is active and earning ${plan.dailyRoiPercentage}% daily ROI.`,
    type: 'investment',
    amount: numericAmount,
    actionUrl: '/investments',
  });

  try {
    await distributeReferralCommissions(investment);
  } catch (err) {
    logger.error(`Error distributing referral commissions for investment ${investment._id}:`, err);
  }

  return investment;
};

// ------------------------------ Get User Investments with Filters & Pagination ------------------------------
const getUserInvestments = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: userId };

  if (query.status && query.status !== 'All') {
    filter.investmentStatus = { $regex: new RegExp(`^${query.status}$`, 'i') };
  }

  if (query.search) {
    filter['planDetails.planName'] = { $regex: query.search, $options: 'i' };
  }

  if (query.startDate || query.endDate) {
    filter.startDate = {};
    if (query.startDate) filter.startDate.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.startDate.$lte = end;
    }
  }

  const [records, total] = await Promise.all([
    Investment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Investment.countDocuments(filter),
  ]);

  const allUserInvestments = await Investment.find({ user: userId });
  let totalAmount = 0;
  let activeCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  allUserInvestments.forEach((inv) => {
    totalAmount += inv.investmentAmount;
    if (inv.investmentStatus === INVESTMENT_STATUS.ACTIVE) activeCount++;
    else if (inv.investmentStatus === INVESTMENT_STATUS.COMPLETED) completedCount++;
    else if (inv.investmentStatus === INVESTMENT_STATUS.CANCELLED) cancelledCount++;
  });

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    counts: {
      all: allUserInvestments.length,
      active: activeCount,
      completed: completedCount,
      cancelled: cancelledCount,
      totalInvestedAmount: totalAmount,
    },
  };
};

// ------------------------------ Get Investment By ID ------------------------------
const getInvestmentById = async (userId, investmentId) => {
  const investment = await Investment.findOne({ _id: investmentId, user: userId });
  if (!investment) {
    throw new AppError('Investment not found or unauthorized', 404);
  }
  return investment;
};

module.exports = {
  getAvailablePlans,
  createInvestment,
  getUserInvestments,
  getInvestmentById,
};
