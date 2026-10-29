const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Investment = require('../src/models/Investment');
const ROIHistory = require('../src/models/ROIHistory');
const ReferralIncome = require('../src/models/ReferralIncome');
const { processDailyROI } = require('../src/services/roiService');
const { INVESTMENT_PLANS, INVESTMENT_STATUS } = require('../src/constants/businessRules');

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('TierFlow - Authentication & Security Tests', () => {
  it('should register a new user successfully and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alice Walker',
        email: 'alice@tierflow.com',
        mobileNumber: '+919876543210',
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('alice@tierflow.com');
    expect(res.body.data.user.referralCode).toBeDefined();
    expect(res.body.data.token).toBeDefined();

    // Verify password is NOT in response
    expect(res.body.data.user.password).toBeUndefined();

    // Verify password in DB is hashed
    const userInDb = await User.findOne({ email: 'alice@tierflow.com' }).select('+password');
    expect(userInDb.password).not.toBe('password123');
  });

  it('should reject registration with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alice Walker',
        email: 'alice@tierflow.com',
        mobileNumber: '+919876543210',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Alice Clone',
        email: 'alice@tierflow.com',
        mobileNumber: '+919876543211',
        password: 'password123',
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already exists');
  });

  it('should authenticate user and return valid token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Bob Smith',
        email: 'bob@tierflow.com',
        mobileNumber: '+919876543210',
        password: 'securepassword',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bob@tierflow.com',
        password: 'securepassword',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.fullName).toBe('Bob Smith');
  });

  it('should protect private routes from unauthenticated access', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });
});

describe('TierFlow - Investment & Referral Multi-Level Commission Tests', () => {
  let parentToken;
  let parentUser;
  let childToken;
  let childUser;

  beforeEach(async () => {
    // 1. Create parent user
    const resParent = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Parent User',
        email: 'parent@tierflow.com',
        mobileNumber: '+919876543210',
        password: 'password123',
      });

    parentToken = resParent.body.data.token;
    parentUser = resParent.body.data.user;

    // 2. Register child user with parent referral code
    const resChild = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Child User',
        email: 'child@tierflow.com',
        mobileNumber: '+919876543211',
        password: 'password123',
        referralCode: parentUser.referralCode,
      });

    childToken = resChild.body.data.token;
    childUser = resChild.body.data.user;
  });

  it('should create investment and distribute Level 1 (5%) commission to referrer', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${childToken}`)
      .send({
        planId: 'growth-a',
        amount: 10000,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.investment.investmentAmount).toBe(10000);
    expect(res.body.data.investment.dailyRoiPercentage).toBe(1.0);

    // Verify parent user received 5% = ₹500
    const updatedParent = await User.findById(parentUser._id);
    expect(updatedParent.walletBalance).toBe(500);
    expect(updatedParent.totalLevelIncomeEarned).toBe(500);

    // Verify ReferralIncome record was created
    const incomeRecord = await ReferralIncome.findOne({ user: parentUser._id });
    expect(incomeRecord).toBeDefined();
    expect(incomeRecord.incomeAmount).toBe(500);
    expect(incomeRecord.referralLevel).toBe(1);
  });

  it('should reject investment if amount is below plan minimum', async () => {
    const res = await request(app)
      .post('/api/investments')
      .set('Authorization', `Bearer ${childToken}`)
      .send({
        planId: 'wealth', // Min: 10000
        amount: 5000,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Minimum investment');
  });

  it('should retrieve complete referral tree hierarchy for parent', async () => {
    const res = await request(app)
      .get('/api/referrals/tree')
      .set('Authorization', `Bearer ${parentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.root.children.length).toBe(1);
    expect(res.body.data.root.children[0].email).toBe('child@tierflow.com');
    expect(res.body.data.summary.directReferrals).toBe(1);
  });
});

describe('TierFlow - Daily ROI Calculation & Idempotency Safeguards', () => {
  it('should process daily ROI and prevent duplicate execution for the same day', async () => {
    // 1. Create a user
    const user = await User.create({
      fullName: 'Investor User',
      email: 'investor@tierflow.com',
      mobileNumber: '+919876543299',
      password: 'password123',
      referralCode: 'TFLINVEST1',
      walletBalance: 0,
      totalRoiEarned: 0,
    });

    // 2. Create active investment of ₹20,000 at 2% daily ROI = ₹400/day
    const now = new Date();
    const investment = await Investment.create({
      user: user._id,
      investmentAmount: 20000,
      planDetails: {
        planId: 'wealth',
        planName: 'Wealth Plan',
        durationDays: 180,
      },
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 178 * 24 * 60 * 60 * 1000),
      dailyRoiPercentage: 2.0,
      investmentStatus: INVESTMENT_STATUS.ACTIVE,
    });

    // Run Daily ROI processing for today
    const firstRun = await processDailyROI(now);
    expect(firstRun.credited).toBe(1);
    expect(firstRun.totalAmountCredited).toBe(400);

    // Verify user balance updated to ₹400
    const userAfterFirstRun = await User.findById(user._id);
    expect(userAfterFirstRun.walletBalance).toBe(400);
    expect(userAfterFirstRun.totalRoiEarned).toBe(400);

    // IDEMPOTENCY TEST: Run the job AGAIN for the same date!
    const secondRun = await processDailyROI(now);
    expect(secondRun.credited).toBe(0);
    expect(secondRun.skipped).toBe(1); // Skipped because already credited!
    expect(secondRun.totalAmountCredited).toBe(0);

    // Verify user balance is STILL ₹400 and NOT doubled to ₹800!
    const userAfterSecondRun = await User.findById(user._id);
    expect(userAfterSecondRun.walletBalance).toBe(400);
    expect(userAfterSecondRun.totalRoiEarned).toBe(400);

    // Verify only 1 ROIHistory record exists in DB for this date
    const historyCount = await ROIHistory.countDocuments({ investment: investment._id });
    expect(historyCount).toBe(1);
  });
});
