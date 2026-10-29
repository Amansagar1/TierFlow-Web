const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const ROIHistory = require('../models/ROIHistory');
const ReferralIncome = require('../models/ReferralIncome');
const AppError = require('../utils/AppError');
const notificationService = require('./notificationService');

// ------------------------------ Deposit Capital to Wallet ------------------------------
const depositFunds = async (userId, { amount, method = 'UPI' }) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new AppError('Invalid deposit amount', 400);
  }

  const transactionId = WalletTransaction.generateTransactionId('TXN');

  const txn = await WalletTransaction.create({
    user: userId,
    transactionId,
    type: 'Deposit',
    category: 'deposit',
    amount: numericAmount,
    isCredit: true,
    status: 'Completed',
    method: method === 'UPI' ? 'Google Pay UPI' : method === 'IMPS' ? 'Net Banking IMPS' : 'USDT TRC20',
    description: `Wallet Capital Top-Up via ${method}`,
    date: new Date(),
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: numericAmount } },
    { new: true }
  );

  notificationService.createNotification({
    userId,
    title: 'Deposit Successful',
    message: `₹${numericAmount.toLocaleString()} has been added to your TierFlow wallet via ${method}.`,
    type: 'wallet',
    amount: numericAmount,
    actionUrl: '/wallet',
  });

  return { transaction: txn, walletBalance: updatedUser.walletBalance };
};

// ------------------------------ Request Capital Withdrawal ------------------------------
const withdrawFunds = async (userId, { amount, destination = 'Verified Bank Payout' }) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new AppError('Invalid withdrawal amount', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.walletBalance < numericAmount) {
    throw new AppError('Insufficient wallet balance for this withdrawal', 400);
  }

  const transactionId = WalletTransaction.generateTransactionId('TXN');

  const txn = await WalletTransaction.create({
    user: userId,
    transactionId,
    type: 'Withdrawal',
    category: 'withdrawal',
    amount: numericAmount,
    isCredit: false,
    status: 'Completed',
    method: 'IMPS Bank Transfer',
    description: `Settlement to ${destination}`,
    date: new Date(),
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: -numericAmount } },
    { new: true }
  );

  notificationService.createNotification({
    userId,
    title: 'Withdrawal Processed',
    message: `₹${numericAmount.toLocaleString()} withdrawal has been processed to ${destination}.`,
    type: 'wallet',
    amount: numericAmount,
    actionUrl: '/wallet',
  });

  return { transaction: txn, walletBalance: updatedUser.walletBalance };
};

// ------------------------------ Get Paginated Wallet Transactions ------------------------------
const getTransactions = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }
  if (query.search) {
    filter.$or = [
      { transactionId: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { type: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [records, total] = await Promise.all([
    WalletTransaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    WalletTransaction.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

// ------------------------------ Get Wallet Overview & Cashflow Metrics ------------------------------
const getWalletOverview = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const withdrawalTxns = await WalletTransaction.find({
    user: userId,
    category: 'withdrawal',
  });
  const completedWithdrawals = withdrawalTxns.filter((t) => t.status === 'Completed');
  const pendingWithdrawals = withdrawalTxns.filter((t) => t.status === 'Pending');
  const totalWithdrawn = completedWithdrawals.reduce((sum, t) => sum + t.amount, 0);

  const allTxns = await WalletTransaction.find({ user: userId }).sort({ date: 1 });
  const cashflowMap = {};
  let runningBalance = 0;

  allTxns.forEach((txn) => {
    const d = new Date(txn.date);
    const key = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!cashflowMap[key]) {
      cashflowMap[key] = { date: displayDate, rawDate: key, inflow: 0, outflow: 0, balance: 0 };
    }

    if (txn.isCredit) {
      cashflowMap[key].inflow += txn.amount;
      runningBalance += txn.amount;
    } else {
      cashflowMap[key].outflow += txn.amount;
      runningBalance -= txn.amount;
    }
    cashflowMap[key].balance = Math.max(0, runningBalance);
  });

  const cashflow = Object.values(cashflowMap).sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  if (cashflow.length === 0) {
    cashflow.push({
      date: 'Today',
      inflow: 0,
      outflow: 0,
      balance: user.walletBalance || 0,
    });
  }

  return {
    walletBalance: user.walletBalance || 0,
    totalRoiEarned: user.totalRoiEarned || 0,
    totalLevelIncomeEarned: user.totalLevelIncomeEarned || 0,
    totalWithdrawn: totalWithdrawn,
    completedWithdrawalsCount: completedWithdrawals.length,
    pendingWithdrawalsCount: pendingWithdrawals.length,
    cashflow,
  };
};

module.exports = {
  depositFunds,
  withdrawFunds,
  getTransactions,
  getWalletOverview,
};


