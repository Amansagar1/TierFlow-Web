const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/database');
const { initRoiScheduler } = require('./jobs/roiScheduler');
const logger = require('./utils/logger');
const User = require('./models/User');
const Investment = require('./models/Investment');
const Notification = require('./models/Notification');
const { INVESTMENT_PLANS, INVESTMENT_STATUS } = require('./constants/businessRules');

// ------------------------------ Initial Data Seeder ------------------------------
const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database empty. Seeding initial demo data for evaluation...');

      const Aman = await User.create({
        fullName: 'Aman Sagar',
        email: 'Aman@tierflow.com',
        mobileNumber: '+919876543210',
        password: 'password123',
        referralCode: 'TFL123456',
        walletBalance: 12750,
        totalRoiEarned: 12750,
        totalLevelIncomeEarned: 4500,
        accountStatus: 'Active',
      });

      const u123 = await User.create({
        fullName: 'User 123',
        email: 'user123@tierflow.com',
        mobileNumber: '+919876543211',
        password: 'password123',
        referralCode: 'TFL888123',
        referredBy: Aman._id,
        walletBalance: 1800,
        totalRoiEarned: 1200,
        totalLevelIncomeEarned: 600,
        accountStatus: 'Active',
      });

      const u456 = await User.create({
        fullName: 'User 456',
        email: 'user456@tierflow.com',
        mobileNumber: '+919876543212',
        password: 'password123',
        referralCode: 'TFL888456',
        referredBy: Aman._id,
        walletBalance: 1200,
        totalRoiEarned: 1000,
        totalLevelIncomeEarned: 200,
        accountStatus: 'Active',
      });

      const u789 = await User.create({
        fullName: 'User 789',
        email: 'user789@tierflow.com',
        mobileNumber: '+919876543213',
        password: 'password123',
        referralCode: 'TFL888789',
        referredBy: Aman._id,
        walletBalance: 1000,
        totalRoiEarned: 1000,
        totalLevelIncomeEarned: 0,
        accountStatus: 'Active',
      });

      const u321 = await User.create({
        fullName: 'User 321',
        email: 'user321@tierflow.com',
        mobileNumber: '+919876543214',
        password: 'password123',
        referralCode: 'TFL888321',
        referredBy: Aman._id,
        walletBalance: 1500,
        totalRoiEarned: 1200,
        totalLevelIncomeEarned: 300,
        accountStatus: 'Active',
      });

      const u654 = await User.create({
        fullName: 'User 654',
        email: 'user654@tierflow.com',
        mobileNumber: '+919876543215',
        password: 'password123',
        referralCode: 'TFL999654',
        referredBy: u123._id,
        walletBalance: 500,
        totalRoiEarned: 500,
        totalLevelIncomeEarned: 0,
        accountStatus: 'Active',
      });

      const u987 = await User.create({
        fullName: 'User 987',
        email: 'user987@tierflow.com',
        mobileNumber: '+919876543216',
        password: 'password123',
        referralCode: 'TFL999987',
        referredBy: u123._id,
        walletBalance: 750,
        totalRoiEarned: 750,
        totalLevelIncomeEarned: 0,
        accountStatus: 'Active',
      });

      await User.create({
        fullName: 'User 777',
        email: 'user777@tierflow.com',
        mobileNumber: '+919876543217',
        password: 'password123',
        referralCode: 'TFL777001',
        referredBy: u654._id,
        walletBalance: 0,
        accountStatus: 'Active',
      });

      await User.create({
        fullName: 'User 888',
        email: 'user888@tierflow.com',
        mobileNumber: '+919876543218',
        password: 'password123',
        referralCode: 'TFL888002',
        referredBy: u654._id,
        walletBalance: 100,
        accountStatus: 'Active',
      });

      // ------------------------------ Seed Active Investments ------------------------------
      const now = new Date();
      const planA = INVESTMENT_PLANS.GROWTH_A;
      const planB = INVESTMENT_PLANS.GROWTH_B;

      await Investment.create({
        user: Aman._id,
        investmentAmount: 25000,
        planDetails: {
          planId: planA.id,
          planName: planA.name,
          durationDays: planA.durationDays,
          subtitle: planA.subtitle,
          color: planA.color,
        },
        startDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000),
        dailyRoiPercentage: planA.dailyRoiPercentage,
        totalRoiEarned: 6250,
        investmentStatus: INVESTMENT_STATUS.ACTIVE,
      });

      await Investment.create({
        user: Aman._id,
        investmentAmount: 25000,
        planDetails: {
          planId: planB.id,
          planName: planB.name,
          durationDays: planB.durationDays,
          subtitle: planB.subtitle,
          color: planB.color,
        },
        startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 105 * 24 * 60 * 60 * 1000),
        dailyRoiPercentage: planB.dailyRoiPercentage,
        totalRoiEarned: 5625,
        investmentStatus: INVESTMENT_STATUS.ACTIVE,
      });

      await Notification.create([
        {
          user: Aman._id,
          title: 'Daily ROI Payout Credited',
          message: '₹375.00 has been credited to your TierFlow wallet for Growth Plan A.',
          type: 'roi',
          amount: 375,
          isRead: false,
          actionUrl: '/roi-history',
        },
        {
          user: Aman._id,
          title: 'Level 1 Referral Bonus Received',
          message: 'You earned ₹1,000.00 direct referral commission from user123.',
          type: 'referral',
          amount: 1000,
          isRead: false,
          actionUrl: '/referrals',
        },
        {
          user: Aman._id,
          title: 'Capital Deposit Confirmed',
          message: '₹10,000.00 deposited successfully via Google Pay UPI.',
          type: 'wallet',
          amount: 10000,
          isRead: true,
          actionUrl: '/wallet',
        },
      ]);

      logger.info('Demo data seeded successfully. Demo credentials: Aman@tierflow.com / password123');
    }
  } catch (err) {
    logger.warn('Error during demo data seeding:', err.message);
  }
};

// ------------------------------ Start Application Server ------------------------------
const startServer = async () => {
  try {
    await connectDB();
    await seedDemoData();
    initRoiScheduler();

    const server = app.listen(env.PORT, () => {
      logger.info(`TierFlow Server listening on port ${env.PORT} [ENV: ${env.NODE_ENV}]`);
      logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
