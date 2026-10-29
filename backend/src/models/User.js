const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,

        'Please enter a valid email address',
      ],
      index: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not expose password by default
    },
    referralCode: {
      type: String,
      required: [true, 'Referral code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
    },
    totalRoiEarned: {
      type: Number,
      default: 0,
      min: [0, 'Total ROI cannot be negative'],
    },
    totalLevelIncomeEarned: {
      type: Number,
      default: 0,
      min: [0, 'Total level income cannot be negative'],
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
      index: true,
    },
    city: {
      type: String,
      trim: true,
      default: 'New Delhi',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    address: {
      type: String,
      trim: true,
      default: 'Suite 402, Barakhamba Road, Connaught Place',
    },
    dateOfBirth: {
      type: String,
      trim: true,
      default: '1992-05-18',
    },
    gender: {
      type: String,
      trim: true,
      default: 'Male',
    },
    kyc: {
      status: { type: String, default: 'Approved' },
      tier: { type: String, default: 'Tier 2' },
      aadhaarLast4: { type: String, default: '5612' },
      pan: { type: String, default: 'ABCDE1234F' },
      livenessScore: { type: String, default: '99.8%' },
      verifiedAt: { type: Date, default: () => new Date() },
    },
    bankDetails: {
      bankName: { type: String, default: 'HDFC Bank Ltd.' },
      accountNumber: { type: String, default: '•••• •••• •••• 9821' },
      accountNumberMasked: { type: String, default: '•••• 9821' },
      holderName: { type: String, default: 'Aman Sagar' },
      ifsc: { type: String, default: 'HDFC0001234' },
      branch: { type: String, default: 'Connaught Place, New Delhi' },
      verified: { type: Boolean, default: true },
    },
    settings: {
      notifications: {
        roiAlerts: { type: Boolean, default: true },
        referralAlerts: { type: Boolean, default: true },
        walletAlerts: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
        marketingUpdates: { type: Boolean, default: false },
      },
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      theme: { type: String, default: 'light' },
      twoFactorEnabled: { type: Boolean, default: true },
      sessionTimeout: { type: String, default: '30m' },
      ipRestricted: { type: Boolean, default: false },
      apiKey: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------ Password Hashing Middleware ------------------------------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ------------------------------ Password Comparison Method ------------------------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ------------------------------ Referral Code Generator ------------------------------
userSchema.statics.generateReferralCode = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TFL';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
