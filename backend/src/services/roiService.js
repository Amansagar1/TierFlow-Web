
const User = require('../models/User');
const Investment = require('../models/Investment');
const ROIHistory = require('../models/ROIHistory');
const { INVESTMENT_STATUS, ROI_STATUS } = require('../constants/businessRules');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

// ------------------------------ Helper: Format Date String ------------------------------
const getDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ------------------------------ Daily ROI Calculation Processor ------------------------------
const processDailyROI = async (targetDate = new Date()) => {
  const earningDateStr = getDateString(targetDate);
  const now = new Date(targetDate);

  logger.info(`Starting Daily ROI processing for date: ${earningDateStr}`);
  const activeInvestments = await Investment.find({
    investmentStatus: INVESTMENT_STATUS.ACTIVE,
  }).populate('user', 'accountStatus');

  let processed = 0;
  let credited = 0;
  let skipped = 0;
  let completed = 0;
  let totalAmountCredited = 0;
  const errors = [];

  for (const investment of activeInvestments) {
    processed++;

    try {
      if (!investment.user || investment.user.accountStatus !== 'Active') {
        skipped++;
        continue;
      }
      if (now > investment.endDate) {
        investment.investmentStatus = INVESTMENT_STATUS.COMPLETED;
        await investment.save();
        completed++;
        notificationService.createNotification({
          userId: investment.user._id,
          title: 'Investment Matured',
          message: `Your ${investment.planDetails?.planName || 'investment'} has completed its tenure. Total ROI earned: ₹${(investment.totalRoiEarned || 0).toLocaleString()}.`,
          type: 'investment',
          actionUrl: '/investments',
        });
        continue;
      }
      if (now < investment.startDate) {
        skipped++;
        continue;
      }
      const existingROI = await ROIHistory.findOne({
        investment: investment._id,
        earningDateStr,
      });

      if (existingROI) {
        skipped++;
        continue;
      }
      const calculatedRoi =
        Math.round((investment.investmentAmount * investment.dailyRoiPercentage) / 100 * 100) / 100;

      if (calculatedRoi <= 0) {
        skipped++;
        continue;
      }
      try {
        await ROIHistory.create({
          user: investment.user._id,
          investment: investment._id,
          roiAmount: calculatedRoi,
          dailyRoiPercentage: investment.dailyRoiPercentage,
          date: now,
          earningDateStr,
          status: ROI_STATUS.CREDITED,
          remarks: 'Daily ROI credited successfully',
        });
      } catch (insertErr) {
        if (insertErr.code === 11000) {
          skipped++;
          continue;
        }
        throw insertErr;
      }
      await User.findByIdAndUpdate(investment.user._id, {
        $inc: {
          walletBalance: calculatedRoi,
          totalRoiEarned: calculatedRoi,
        },
      });

      investment.totalRoiEarned = (investment.totalRoiEarned || 0) + calculatedRoi;
      await investment.save();

      credited++;
      totalAmountCredited += calculatedRoi;

      // Safe notification for ROI payout
      notificationService.createNotification({
        userId: investment.user._id,
        title: 'Daily ROI Credited',
        message: `₹${calculatedRoi.toLocaleString()} ROI earnings credited for ${investment.planDetails?.planName || 'Plan'}.`,
        type: 'roi',
        amount: calculatedRoi,
        actionUrl: '/roi-history',
      });
    } catch (err) {
      logger.error(`Error processing ROI for investment ${investment._id}:`, err);
      errors.push({ investmentId: investment._id, error: err.message });
    }
  }

  logger.info(
    `Daily ROI processing completed: ${credited} credited, ${skipped} skipped, ${completed} completed, Total: ₹${totalAmountCredited}`
  );

  return {
    earningDateStr,
    processed,
    credited,
    skipped,
    completed,
    totalAmountCredited: Math.round(totalAmountCredited * 100) / 100,
    errors,
  };
};

// ------------------------------ Get Paginated ROI History ------------------------------
const getUserROIHistory = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: userId };

  if (query.investmentId) {
    filter.investment = query.investmentId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  const [records, total] = await Promise.all([
    ROIHistory.find(filter)
      .populate('investment', 'investmentAmount planDetails startDate endDate')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    ROIHistory.countDocuments(filter),
  ]);
  const allUserRoi = await ROIHistory.find({ user: userId })
    .populate('investment', 'planDetails investmentAmount')
    .sort({ date: 1 });

  let totalRoiEarned = 0;
  const uniqueDates = new Set();
  const planDistributionMap = {};
  const dailyTrendMap = {};

  allUserRoi.forEach((item) => {
    totalRoiEarned += item.roiAmount;
    uniqueDates.add(item.earningDateStr);

    const planName = item.investment?.planDetails?.planName || 'Standard Plan';
    planDistributionMap[planName] = (planDistributionMap[planName] || 0) + item.roiAmount;

    dailyTrendMap[item.earningDateStr] = (dailyTrendMap[item.earningDateStr] || 0) + item.roiAmount;
  });

  const totalRoiDays = uniqueDates.size;
  const averageDailyRoi = totalRoiDays > 0 ? Math.round((totalRoiEarned / totalRoiDays) * 100) / 100 : 0;

  const activeInvestmentsCount = await Investment.countDocuments({
    user: userId,
    investmentStatus: INVESTMENT_STATUS.ACTIVE,
  });

  const colors = ['#0066FF', '#00C48C', '#7B2CBF', '#FF7A00'];
  const distribution = Object.keys(planDistributionMap).map((planName, index) => ({
    name: planName,
    amount: planDistributionMap[planName],
    percentage:
      totalRoiEarned > 0
        ? Math.round((planDistributionMap[planName] / totalRoiEarned) * 100)
        : 0,
    color: colors[index % colors.length],
  }));

  const trend = Object.keys(dailyTrendMap)
    .sort()
    .map((dateStr) => {
      const d = new Date(dateStr);
      const displayLabel = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : dateStr;
      return {
        date: dateStr,
        displayDate: displayLabel,
        amount: dailyTrendMap[dateStr],
      };
    });

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    metrics: {
      totalRoiEarned: Math.round(totalRoiEarned * 100) / 100,
      totalRoiDays,
      averageDailyRoi,
      activeInvestmentsCount,
      distribution,
      trend,
    },
  };
};

module.exports = {
  processDailyROI,
  getUserROIHistory,
  getDateString,
};
