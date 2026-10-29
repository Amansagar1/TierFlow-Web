// ------------------------------ Business Rules & Constants ------------------------------

const INVESTMENT_PLANS = {
  GROWTH_A: {
    id: 'growth-a',
    name: 'Growth Plan A',
    subtitle: 'Best for beginners',
    dailyRoiPercentage: 1.0,
    durationDays: 90,
    minInvestment: 1000,
    popular: false,
    color: '#10B981',
  },
  GROWTH_B: {
    id: 'growth-b',
    name: 'Growth Plan B',
    subtitle: 'Most Popular',
    dailyRoiPercentage: 1.5,
    durationDays: 120,
    minInvestment: 5000,
    popular: true,
    color: '#D97706',
  },
  WEALTH: {
    id: 'wealth',
    name: 'Wealth Plan',
    subtitle: 'Higher returns',
    dailyRoiPercentage: 2.0,
    durationDays: 180,
    minInvestment: 10000,
    popular: false,
    color: '#8B5CF6',
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Plan',
    subtitle: 'For long-term growth',
    dailyRoiPercentage: 2.5,
    durationDays: 365,
    minInvestment: 25000,
    popular: false,
    color: '#F59E0B',
  },
};

// ------------------------------ Referral Commission Rates ------------------------------
const REFERRAL_COMMISSION_RATES = {
  1: 0.05,
  2: 0.03,
  3: 0.02,
};

const MAX_REFERRAL_DEPTH = 3;

const INVESTMENT_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

const ROI_STATUS = {
  CREDITED: 'Credited',
  PENDING: 'Pending',
  FAILED: 'Failed',
};

const REFERRAL_INCOME_TYPE = {
  DIRECT: 'Direct Income',
  LEVEL: 'Level Income',
};

module.exports = {
  INVESTMENT_PLANS,
  REFERRAL_COMMISSION_RATES,
  MAX_REFERRAL_DEPTH,
  INVESTMENT_STATUS,
  USER_STATUS,
  ROI_STATUS,
  REFERRAL_INCOME_TYPE,
};
