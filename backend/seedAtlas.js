const mongoose = require('mongoose');
const env = require('./src/config/env');
const User = require('./src/models/User');
const Investment = require('./src/models/Investment');
const ROIHistory = require('./src/models/ROIHistory');
const ReferralIncome = require('./src/models/ReferralIncome');
const WalletTransaction = require('./src/models/WalletTransaction');
const { INVESTMENT_PLANS, INVESTMENT_STATUS, ROI_STATUS, REFERRAL_INCOME_TYPE } = require('./src/constants/businessRules');

const seedAtlas = async () => {
  try {
    console.log('Connecting to MongoDB Atlas database tierflow...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to Atlas successfully!');

    // Clear existing collections in tierflow
    console.log('Clearing existing collections in tierflow...');
    await Promise.all([
      User.deleteMany({}),
      Investment.deleteMany({}),
      ROIHistory.deleteMany({}),
      ReferralIncome.deleteMany({}),
      WalletTransaction.deleteMany({}),
    ]);

    // Helper to generate dates relative to now
    const daysAgo = (days, hours = 10, mins = 0) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      d.setHours(hours, mins, 0, 0);
      return d;
    };

    console.log('Seeding demo users into tierflow...');

    // 1. Root user: Aman Sagar
    const Aman = await User.create({
      fullName: 'Aman Sagar',
      email: 'Aman@tierflow.com',
      mobileNumber: '+91 98765 43210',
      password: 'password123',
      referralCode: 'TFL123456',
      walletBalance: 12750,
      totalRoiEarned: 12750,
      totalLevelIncomeEarned: 4500,
      accountStatus: 'Active',
      city: 'New Delhi',
      country: 'India',
      address: 'Suite 402, Barakhamba Road, Connaught Place',
      dateOfBirth: '1992-05-18',
      gender: 'Male',
      kyc: {
        status: 'Approved',
        tier: 'Tier 2',
        aadhaarLast4: '5612',
        pan: 'ABCDE1234F',
        livenessScore: '99.8%',
        verifiedAt: daysAgo(14),
      },
      bankDetails: {
        bankName: 'HDFC Bank Ltd.',
        accountNumber: '•••• •••• •••• 9821',
        accountNumberMasked: '•••• 9821',
        holderName: 'Aman Sagar',
        ifsc: 'HDFC0001234',
        branch: 'Connaught Place, New Delhi',
        verified: true,
      },
      settings: {
        notifications: {
          roiAlerts: true,
          referralAlerts: true,
          walletAlerts: true,
          securityAlerts: true,
          weeklyDigest: false,
          marketingUpdates: false,
        },
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        twoFactorEnabled: true,
        sessionTimeout: '30m',
        ipRestricted: false,
        apiKey: 'tfl_live_88f2190b41c9e831207a',
      },
    });

    // 2. Direct referrals (Level 1)
    const u123 = await User.create({
      fullName: 'user123',
      email: 'user123@tierflow.com',
      mobileNumber: '+919876543211',
      password: 'password123',
      referralCode: 'TFL888123',
      referredBy: Aman._id,
      walletBalance: 1800,
      totalRoiEarned: 1800,
      totalLevelIncomeEarned: 600,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-30'),
    });

    const u456 = await User.create({
      fullName: 'user456',
      email: 'user456@tierflow.com',
      mobileNumber: '+919876543212',
      password: 'password123',
      referralCode: 'TFL888456',
      referredBy: Aman._id,
      walletBalance: 1200,
      totalRoiEarned: 1200,
      totalLevelIncomeEarned: 200,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-28'),
    });

    const u789 = await User.create({
      fullName: 'user789',
      email: 'user789@tierflow.com',
      mobileNumber: '+919876543213',
      password: 'password123',
      referralCode: 'TFL888789',
      referredBy: Aman._id,
      walletBalance: 1000,
      totalRoiEarned: 1000,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-25'),
    });

    const u321 = await User.create({
      fullName: 'user321',
      email: 'user321@tierflow.com',
      mobileNumber: '+919876543214',
      password: 'password123',
      referralCode: 'TFL888321',
      referredBy: Aman._id,
      walletBalance: 1500,
      totalRoiEarned: 1500,
      totalLevelIncomeEarned: 300,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-22'),
    });

    const u654 = await User.create({
      fullName: 'user654',
      email: 'user654@tierflow.com',
      mobileNumber: '+919876543215',
      password: 'password123',
      referralCode: 'TFL999654',
      referredBy: Aman._id,
      walletBalance: 500,
      totalRoiEarned: 500,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-20'),
    });

    // 3. Level 2 referrals (under user123)
    const u987 = await User.create({
      fullName: 'user987',
      email: 'user987@tierflow.com',
      mobileNumber: '+919876543216',
      password: 'password123',
      referralCode: 'TFL999987',
      referredBy: u123._id,
      walletBalance: 750,
      totalRoiEarned: 750,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-21'),
    });

    const u111 = await User.create({
      fullName: 'user111',
      email: 'user111@tierflow.com',
      mobileNumber: '+919876543217',
      password: 'password123',
      referralCode: 'TFL999111',
      referredBy: u123._id,
      walletBalance: 250,
      totalRoiEarned: 250,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-18'),
    });

    const u222 = await User.create({
      fullName: 'user222',
      email: 'user222@tierflow.com',
      mobileNumber: '+919876543218',
      password: 'password123',
      referralCode: 'TFL999222',
      referredBy: u456._id,
      walletBalance: 500,
      totalRoiEarned: 500,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-19'),
    });

    const u333 = await User.create({
      fullName: 'user333',
      email: 'user333@tierflow.com',
      mobileNumber: '+919876543219',
      password: 'password123',
      referralCode: 'TFL999333',
      referredBy: u789._id,
      walletBalance: 250,
      totalRoiEarned: 250,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-17'),
    });

    const u444 = await User.create({
      fullName: 'user444',
      email: 'user444@tierflow.com',
      mobileNumber: '+919876543220',
      password: 'password123',
      referralCode: 'TFL999444',
      referredBy: u789._id,
      walletBalance: 250,
      totalRoiEarned: 250,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-16'),
    });

    const u555 = await User.create({
      fullName: 'user555',
      email: 'user555@tierflow.com',
      mobileNumber: '+919876543221',
      password: 'password123',
      referralCode: 'TFL999555',
      referredBy: u321._id,
      walletBalance: 500,
      totalRoiEarned: 500,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-15'),
    });

    const u666 = await User.create({
      fullName: 'user666',
      email: 'user666@tierflow.com',
      mobileNumber: '+919876543222',
      password: 'password123',
      referralCode: 'TFL999666',
      referredBy: u321._id,
      walletBalance: 500,
      totalRoiEarned: 500,
      totalLevelIncomeEarned: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-14'),
    });

    // 4. Level 3 referrals (under u987 & u222 & u333)
    await User.create({
      fullName: 'user777',
      email: 'user777@tierflow.com',
      mobileNumber: '+919876543223',
      password: 'password123',
      referralCode: 'TFL777001',
      referredBy: u987._id,
      walletBalance: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-12'),
    });

    await User.create({
      fullName: 'user888',
      email: 'user888@tierflow.com',
      mobileNumber: '+919876543224',
      password: 'password123',
      referralCode: 'TFL888002',
      referredBy: u987._id,
      walletBalance: 100,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-11'),
    });

    await User.create({
      fullName: 'user999',
      email: 'user999@tierflow.com',
      mobileNumber: '+919876543225',
      password: 'password123',
      referralCode: 'TFL999003',
      referredBy: u222._id,
      walletBalance: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-10'),
    });

    await User.create({
      fullName: 'user1000',
      email: 'user1000@tierflow.com',
      mobileNumber: '+919876543226',
      password: 'password123',
      referralCode: 'TFL100004',
      referredBy: u222._id,
      walletBalance: 100,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-09'),
    });

    await User.create({
      fullName: 'user1010',
      email: 'user1010@tierflow.com',
      mobileNumber: '+919876543227',
      password: 'password123',
      referralCode: 'TFL101005',
      referredBy: u333._id,
      walletBalance: 0,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-08'),
    });

    await User.create({
      fullName: 'user1111',
      email: 'user1111@tierflow.com',
      mobileNumber: '+919876543228',
      password: 'password123',
      referralCode: 'TFL111106',
      referredBy: u333._id,
      walletBalance: 100,
      accountStatus: 'Active',
      createdAt: new Date('2024-10-07'),
    });

    const daysAgoStr = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    };

    // 5. Investments for Aman Sagar (matching UI Design screenshot #2 & #3)
    console.log('Seeding investments into tierflow...');
    const inv1 = await Investment.create({
      user: Aman._id,
      investmentAmount: 25000,
      planDetails: {
        planId: INVESTMENT_PLANS.GROWTH_A.id,
        planName: INVESTMENT_PLANS.GROWTH_A.name,
        durationDays: 90,
        subtitle: INVESTMENT_PLANS.GROWTH_A.subtitle,
        color: INVESTMENT_PLANS.GROWTH_A.color,
      },
      startDate: daysAgo(30),
      endDate: daysAgo(-60),
      dailyRoiPercentage: 1.0,
      totalRoiEarned: 2150,
      investmentStatus: INVESTMENT_STATUS.ACTIVE,
    });

    const inv2 = await Investment.create({
      user: Aman._id,
      investmentAmount: 25000,
      planDetails: {
        planId: INVESTMENT_PLANS.GROWTH_B.id,
        planName: INVESTMENT_PLANS.GROWTH_B.name,
        durationDays: 120,
        subtitle: INVESTMENT_PLANS.GROWTH_B.subtitle,
        color: INVESTMENT_PLANS.GROWTH_B.color,
      },
      startDate: daysAgo(15),
      endDate: daysAgo(-105),
      dailyRoiPercentage: 1.5,
      totalRoiEarned: 1200,
      investmentStatus: INVESTMENT_STATUS.ACTIVE,
    });

    const inv3 = await Investment.create({
      user: Aman._id,
      investmentAmount: 50000,
      planDetails: {
        planId: INVESTMENT_PLANS.WEALTH.id,
        planName: INVESTMENT_PLANS.WEALTH.name,
        durationDays: 180,
        subtitle: INVESTMENT_PLANS.WEALTH.subtitle,
        color: INVESTMENT_PLANS.WEALTH.color,
      },
      startDate: daysAgo(90),
      endDate: daysAgo(1),
      dailyRoiPercentage: 2.0,
      totalRoiEarned: 28500,
      investmentStatus: INVESTMENT_STATUS.COMPLETED,
    });

    const inv4 = await Investment.create({
      user: Aman._id,
      investmentAmount: 10000,
      planDetails: {
        planId: INVESTMENT_PLANS.PREMIUM.id,
        planName: INVESTMENT_PLANS.PREMIUM.name,
        durationDays: 365,
        subtitle: INVESTMENT_PLANS.PREMIUM.subtitle,
        color: INVESTMENT_PLANS.PREMIUM.color,
      },
      startDate: daysAgo(120),
      endDate: daysAgo(30),
      dailyRoiPercentage: 2.5,
      totalRoiEarned: 500,
      investmentStatus: INVESTMENT_STATUS.CANCELLED,
    });

    // 6. Referral Income Records (matching UI Design screenshot #5)
    console.log('Seeding referral income records into tierflow...');
    const referralData = [
      { from: u123, level: 1, amount: 500, type: REFERRAL_INCOME_TYPE.DIRECT, date: daysAgo(0, 8, 45), inv: inv1 },
      { from: u456, level: 2, amount: 250, type: REFERRAL_INCOME_TYPE.LEVEL, date: daysAgo(1, 14, 10), inv: inv2 },
      { from: u789, level: 3, amount: 100, type: REFERRAL_INCOME_TYPE.LEVEL, date: daysAgo(2, 11, 20), inv: inv3 },
      { from: u321, level: 1, amount: 500, type: REFERRAL_INCOME_TYPE.DIRECT, date: daysAgo(4, 9, 15), inv: inv1 },
      { from: u654, level: 2, amount: 250, type: REFERRAL_INCOME_TYPE.LEVEL, date: daysAgo(6, 16, 0), inv: inv2 },
      { from: u987, level: 3, amount: 100, type: REFERRAL_INCOME_TYPE.LEVEL, date: daysAgo(9, 10, 30), inv: inv3 },
      { from: u111, level: 1, amount: 500, type: REFERRAL_INCOME_TYPE.DIRECT, date: daysAgo(12, 12, 0), inv: inv1 },
      { from: u222, level: 2, amount: 250, type: REFERRAL_INCOME_TYPE.LEVEL, date: daysAgo(16, 15, 45), inv: inv2 },
      { from: u333, level: 3, amount: 100, type: REFERRAL_INCOME_TYPE.LEVEL, date: daysAgo(20, 10, 0), inv: inv3 },
      { from: u444, level: 1, amount: 500, type: REFERRAL_INCOME_TYPE.DIRECT, date: daysAgo(25, 9, 0), inv: inv1 },
    ];

    for (const ref of referralData) {
      await ReferralIncome.create({
        user: Aman._id,
        fromUser: ref.from._id,
        referralLevel: ref.level,
        incomeAmount: ref.amount,
        incomeType: ref.type,
        investment: ref.inv._id,
        date: ref.date,
        status: 'Credited',
      });
    }

    // 7. ROI History Records (matching UI Design screenshot #4)
    console.log('Seeding ROI history records into tierflow...');
    const roiData = [
      { date: daysAgo(0), dateStr: daysAgoStr(0), inv: inv1, amount: 250, pct: 1.0 },
      { date: daysAgo(1), dateStr: daysAgoStr(1), inv: inv2, amount: 375, pct: 1.5 },
      { date: daysAgo(2), dateStr: daysAgoStr(2), inv: inv3, amount: 1000, pct: 2.0 },
      { date: daysAgo(3), dateStr: daysAgoStr(3), inv: inv1, amount: 250, pct: 1.0 },
      { date: daysAgo(4), dateStr: daysAgoStr(4), inv: inv2, amount: 375, pct: 1.5 },
      { date: daysAgo(5), dateStr: daysAgoStr(5), inv: inv3, amount: 1000, pct: 2.0 },
      { date: daysAgo(6), dateStr: daysAgoStr(6), inv: inv1, amount: 250, pct: 1.0 },
      { date: daysAgo(7), dateStr: daysAgoStr(7), inv: inv2, amount: 375, pct: 1.5 },
      { date: daysAgo(8), dateStr: daysAgoStr(8), inv: inv3, amount: 1000, pct: 2.0 },
      { date: daysAgo(9), dateStr: daysAgoStr(9), inv: inv1, amount: 250, pct: 1.0 },
      { date: daysAgo(12), dateStr: daysAgoStr(12), inv: inv1, amount: 250, pct: 1.0 },
      { date: daysAgo(15), dateStr: daysAgoStr(15), inv: inv2, amount: 375, pct: 1.5 },
      { date: daysAgo(18), dateStr: daysAgoStr(18), inv: inv3, amount: 1000, pct: 2.0 },
      { date: daysAgo(22), dateStr: daysAgoStr(22), inv: inv1, amount: 250, pct: 1.0 },
      { date: daysAgo(26), dateStr: daysAgoStr(26), inv: inv2, amount: 375, pct: 1.5 },
    ];

    for (const roi of roiData) {
      await ROIHistory.create({
        user: Aman._id,
        investment: roi.inv._id,
        roiAmount: roi.amount,
        dailyRoiPercentage: roi.pct,
        date: roi.date,
        earningDateStr: roi.dateStr,
        status: ROI_STATUS.CREDITED,
        remarks: 'Daily ROI credited successfully',
      });
    }

    // 8. Wallet Transactions (matching UI Design screenshot #6 & Wallet Page)
    console.log('Seeding wallet transactions into tierflow...');
    const walletTxns = [
      {
        transactionId: 'TXN-90218',
        type: 'ROI Payout',
        category: 'roi',
        date: daysAgo(0, 10, 0),
        description: 'Growth Plan B (2.0% Daily ROI)',
        amount: 400,
        isCredit: true,
        status: 'Completed',
        method: 'Automated Daily Payout',
      },
      {
        transactionId: 'TXN-90217',
        type: 'Referral Bonus',
        category: 'referral',
        date: daysAgo(0, 8, 45),
        description: 'Level 1 Commission from user123',
        amount: 500,
        isCredit: true,
        status: 'Completed',
        method: 'Direct Referral Bonus',
      },
      {
        transactionId: 'TXN-90216',
        type: 'Withdrawal',
        category: 'withdrawal',
        date: daysAgo(1, 15, 20),
        description: 'Settlement to HDFC Bank •••• 9821',
        amount: 2000,
        isCredit: false,
        status: 'Completed',
        method: 'IMPS Bank Transfer',
      },
      {
        transactionId: 'TXN-90215',
        type: 'ROI Payout',
        category: 'roi',
        date: daysAgo(1, 10, 0),
        description: 'Growth Plan B (2.0% Daily ROI)',
        amount: 400,
        isCredit: true,
        status: 'Completed',
        method: 'Automated Daily Payout',
      },
      {
        transactionId: 'TXN-90214',
        type: 'Referral Bonus',
        category: 'referral',
        date: daysAgo(2, 14, 10),
        description: 'Level 2 Commission from user654',
        amount: 250,
        isCredit: true,
        status: 'Completed',
        method: 'Level 2 Referral Bonus',
      },
      {
        transactionId: 'TXN-90213',
        type: 'ROI Payout',
        category: 'roi',
        date: daysAgo(2, 10, 0),
        description: 'Wealth Plan (2.5% Daily ROI)',
        amount: 625,
        isCredit: true,
        status: 'Completed',
        method: 'Automated Daily Payout',
      },
      {
        transactionId: 'TXN-90212',
        type: 'Deposit',
        category: 'deposit',
        date: daysAgo(3, 18, 30),
        description: 'Wallet Top-Up via UPI Instant',
        amount: 5000,
        isCredit: true,
        status: 'Completed',
        method: 'Google Pay UPI',
      },
      {
        transactionId: 'TXN-90211',
        type: 'Withdrawal',
        category: 'withdrawal',
        date: daysAgo(4, 11, 0),
        description: 'Settlement to HDFC Bank •••• 9821',
        amount: 1200,
        isCredit: false,
        status: 'Completed',
        method: 'IMPS Bank Transfer',
      },
      {
        transactionId: 'TXN-90210',
        type: 'Referral Bonus',
        category: 'referral',
        date: daysAgo(4, 9, 15),
        description: 'Level 1 Commission from user321',
        amount: 500,
        isCredit: true,
        status: 'Completed',
        method: 'Direct Referral Bonus',
      },
      {
        transactionId: 'TXN-90209',
        type: 'ROI Payout',
        category: 'roi',
        date: daysAgo(5, 10, 0),
        description: 'Growth Plan A (1.5% Daily ROI)',
        amount: 300,
        isCredit: true,
        status: 'Completed',
        method: 'Automated Daily Payout',
      },
    ];

    for (const txn of walletTxns) {
      await WalletTransaction.create({
        user: Aman._id,
        ...txn,
      });
    }

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Database name: tierflow on MongoDB Atlas');
    console.log('Demo Login: Aman@tierflow.com | password: password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedAtlas();
