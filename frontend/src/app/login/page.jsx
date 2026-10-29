'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  User,
  Phone,
  Tag,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart2,
  Users,
  ShieldCheck,
  Wallet,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { extractErrorMessage } from '../../utils/errorHandler';

// ------------------------------ Validation Schemas ------------------------------
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^[0-9+-\s]+$/, 'Invalid mobile number format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
});

// ------------------------------ 3D Vector Ribbon Logo Component ------------------------------
function TierFlowRibbonLogo({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="tf-gold-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="tf-bronze-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <rect x="18" y="18" width="64" height="13" rx="6.5" fill="url(#tf-gold-ribbon)" />
      <rect x="37" y="18" width="13.5" height="64" rx="6.5" fill="url(#tf-bronze-ribbon)" />
      <rect x="37" y="39" width="37" height="13" rx="6.5" fill="url(#tf-gold-ribbon)" />
      <circle cx="81" cy="45.5" r="4.5" fill="#FDE68A" />
    </svg>
  );
}


// ------------------------------ Main Auth Page Content ------------------------------
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register: registerAuth } = useAuth();

  const initialMode = searchParams?.get('mode') === 'register' || searchParams?.get('tab') === 'register' ? 'register' : 'login';
  const initialRef = searchParams?.get('ref') || '';

  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ------------------------------ Login Form State ------------------------------
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ------------------------------ Register Form State ------------------------------
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
      referralCode: initialRef,
    },
  });

  // ------------------------------ Form Handlers ------------------------------
  const onLoginSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to TierFlow!');
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to log in. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data) => {
    setLoading(true);
    try {
      await registerAuth({
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        password: data.password,
        referralCode: data.referralCode || undefined,
      });
      toast.success('Registration successful! Welcome to TierFlow.');
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Registration failed. Please check your information.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden relative bg-[#050811] flex flex-col lg:flex-row select-none">
      {/* ------------------------------ Premium Fintech Ambient Background ------------------------------ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#050811]">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-[#D97706]/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-[#F59E0B]/15 rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 right-0 w-[700px] h-[700px] bg-[#92400E]/20 rounded-full blur-[160px]" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M -100 250 C 250 480, 650 120, 1050 480 C 1280 680, 1460 380, 1600 580"
            stroke="url(#silk-glow-1)"
            strokeWidth="110"
            strokeLinecap="round"
            filter="blur(50px)"
          />
          <path
            d="M -50 720 C 380 520, 780 860, 1180 420 C 1380 220, 1480 340, 1600 220"
            stroke="url(#silk-glow-2)"
            strokeWidth="80"
            strokeLinecap="round"
            filter="blur(40px)"
          />
          <defs>
            <linearGradient id="silk-glow-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="silk-glow-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#B45309" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ------------------------------ Left Hero Column: Brand & 3D Dashboard ------------------------------ */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[48%] flex-col justify-between pl-8 sm:pl-12 lg:pl-16 xl:pl-20 pr-4 sm:pr-6 py-6 sm:py-8 lg:py-10 relative z-10 text-white h-full overflow-hidden">
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <TierFlowRibbonLogo className="w-11 h-11 drop-shadow-md" />
            <div>
              <div className="flex items-baseline text-[26px] font-black tracking-tight leading-none">
                <span className="text-white">Tier</span>
                <span className="text-[#F59E0B] ml-0.5 font-black">Flow</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-amber-200/70 tracking-[0.24em] uppercase mt-2 pl-0.5">
            INVEST · EARN · GROW TOGETHER
          </p>
        </div>

        <div className="my-auto py-2 max-w-lg shrink-0">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-black text-white leading-[1.12] tracking-tight">
            Build Your <br />
            Financial Growth <br />
            with <span className="text-[#F59E0B]">TierFlow</span>
          </h1>

          <p className="mt-4 text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal max-w-sm">
            A secure investment and referral platform designed for long-term growth. Invest, earn
            daily ROI and build your network.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-[#0C1220]/80 border border-amber-500/20 backdrop-blur-md shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#1E170C] text-[#F59E0B] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Daily ROI</p>
                <p className="text-[11px] font-medium text-amber-200/70 leading-tight mt-0.5">Earnings</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-[#0C1220]/80 border border-amber-500/20 backdrop-blur-md shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#1E170C] text-[#F59E0B] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Multi-Level</p>
                <p className="text-[11px] font-medium text-amber-200/70 leading-tight mt-0.5">
                  Referral Income
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-[#0C1220]/80 border border-amber-500/20 backdrop-blur-md shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#1E170C] text-[#F59E0B] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Secure &</p>
                <p className="text-[11px] font-medium text-amber-200/70 leading-tight mt-0.5">
                  Transparent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-[#0C1220]/80 border border-amber-500/20 backdrop-blur-md shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#1E170C] text-[#F59E0B] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Track Your</p>
                <p className="text-[11px] font-medium text-amber-200/70 leading-tight mt-0.5">
                  Investments
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative pt-2 max-w-lg shrink-0">
          <div className="relative" style={{ perspective: '1000px' }}>
            <div
              className="relative w-[360px] sm:w-[390px] h-[190px] rounded-[24px] bg-[#07193F]/85 border border-blue-400/25 p-4 shadow-[0_20px_50px_rgba(2,10,35,0.7)] backdrop-blur-xl"
              style={{
                transform: 'rotateX(28deg) rotateY(-18deg) rotateZ(8deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="space-y-1.5 pl-1 pt-1">
                <div className="w-20 h-1.5 rounded-full bg-white/20" />
                <div className="w-14 h-1.5 rounded-full bg-white/10" />
                <div className="w-10 h-1.5 rounded-full bg-white/10" />
              </div>

              <div className="absolute top-4 right-4 w-[210px] sm:w-[230px] h-[115px] rounded-xl bg-[#051433]/70 border border-blue-400/15 overflow-hidden p-2">
                <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-10">
                  <div className="w-[1px] h-full bg-blue-300" />
                  <div className="w-[1px] h-full bg-blue-300" />
                  <div className="w-[1px] h-full bg-blue-300" />
                  <div className="w-[1px] h-full bg-blue-300" />
                  <div className="w-[1px] h-full bg-blue-300" />
                </div>

                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 90">
                  <defs>
                    <linearGradient id="chart-area-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0088FF" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#0055FF" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#003399" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00E5FF" floodOpacity="0.9" />
                    </filter>
                  </defs>
                  <path
                    d="M 5 62 L 35 50 L 65 58 L 100 42 L 135 48 L 170 30 L 195 14 L 195 90 L 5 90 Z"
                    fill="url(#chart-area-fill)"
                  />
                  <path
                    d="M 5 62 L 35 50 L 65 58 L 100 42 L 135 48 L 170 30 L 195 14"
                    stroke="#00D2FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#cyan-glow)"
                  />
                  <circle cx="5" cy="62" r="3" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="1.5" />
                  <circle cx="35" cy="50" r="3" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="1.5" />
                  <circle cx="65" cy="58" r="3" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="1.5" />
                  <circle cx="100" cy="42" r="3" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="1.5" />
                  <circle cx="135" cy="48" r="3" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="1.5" />
                  <circle cx="170" cy="30" r="3.5" fill="#FFFFFF" stroke="#00D2FF" strokeWidth="2" />
                  <circle cx="195" cy="14" r="4" fill="#FFFFFF" stroke="#00A3FF" strokeWidth="2" />
                </svg>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-white/20" />
                  <div className="w-16 h-1.5 rounded-full bg-white/15" />
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-1.5 rounded-full bg-white/20" />
                  <div className="w-14 h-1.5 rounded-full bg-white/15" />
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-3 -left-3 sm:-left-4 w-[190px] sm:w-[205px] rounded-[18px] bg-[#0A245E]/95 border border-blue-400/40 p-3.5 px-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              style={{
                transform: 'rotateX(28deg) rotateY(-18deg) rotateZ(8deg) translateZ(35px)',
              }}
            >
              <p className="text-[11px] text-slate-300 font-medium">Total Earnings</p>
              <h4 className="text-[22px] font-black text-white tracking-tight mt-0.5">₹ 12,750</h4>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <ChevronUp className="w-3.5 h-3.5 stroke-[3]" /> +12%
                </span>
                <div className="flex items-end gap-1 h-4">
                  <span className="w-1 h-2 bg-[#1E74FF] rounded-full" />
                  <span className="w-1 h-3.5 bg-[#1E74FF] rounded-full" />
                  <span className="w-1 h-2.5 bg-[#1E74FF] rounded-full" />
                  <span className="w-1 h-4 bg-[#00D2FF] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Right Column: Unified Floating Auth Card ------------------------------ */}
      <div className="w-full lg:w-[50%] xl:w-[52%] flex items-center justify-center pl-4 sm:pl-6 lg:pl-8 pr-6 sm:pr-10 lg:pr-16 xl:pr-20 py-4 sm:py-6 lg:py-8 relative z-10 h-full overflow-hidden">
        <div className="lg:hidden absolute top-4 left-6 flex items-center gap-2 z-20">
          <TierFlowRibbonLogo className="w-8 h-8" />
          <span className="text-xl font-black text-white">
            Tier<span className="text-[#D97706]">Flow</span>
          </span>
        </div>

        <div className="w-full max-w-[430px] xl:max-w-[450px] max-h-[94vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 lg:p-8 shadow-[0_25px_60px_-15px_rgba(2,15,50,0.35)] border border-white/90 my-auto transition-all">
          <div className="text-center mb-4 sm:mb-5">
            <div className="flex justify-center mb-2">
              <TierFlowRibbonLogo className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md" />
            </div>

            <h2 className="text-2xl sm:text-[25px] font-black text-[#0B132A] tracking-tight leading-tight">
              Tier<span className="text-[#D97706]">Flow</span>
            </h2>

            <div className="mt-3.5 flex items-center bg-slate-100 p-1 rounded-xl max-w-[280px] mx-auto">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Create Account
              </button>
            </div>

            <p className="text-[10px] font-bold tracking-[0.24em] text-slate-400 uppercase mt-2.5">
              {mode === 'login' ? 'WELCOME BACK' : 'JOIN TIERFLOW'}
            </p>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {mode === 'login'
                ? 'Login to your account to continue'
                : 'Enter your details to register and start earning'}
            </p>
          </div>

          {/* ------------------------------ Mode 1: Login Form ------------------------------ */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Email</label>
                <div
                  className={`relative flex items-center rounded-xl border bg-white transition-all ${loginErrors.email
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100'
                    }`}
                >
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                    {...loginRegister('email')}
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{loginErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Password</label>
                <div
                  className={`relative flex items-center rounded-xl border bg-white transition-all ${loginErrors.password
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100'
                    }`}
                >
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full py-2.5 sm:py-3 pl-10 pr-10 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                    {...loginRegister('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{loginErrors.password.message}</p>
                )}

                <div className="flex justify-end mt-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast('Password reset link sent to your registered email address.', {
                        icon: 'ℹ️',
                      });
                    }}
                    className="text-[11px] font-semibold text-[#D97706] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1.5 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-2.5">
              {/* ------------------------------ Mode 2: Registration Form ------------------------------ */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-0.5">Full Name</label>
                <div
                  className={`relative flex items-center rounded-xl border bg-white transition-all ${signupErrors.fullName
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100'
                    }`}
                >
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Aman Sagar"
                    className="w-full py-2 pl-9 pr-3 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                    {...signupRegister('fullName')}
                  />
                </div>
                {signupErrors.fullName && (
                  <p className="mt-0.5 text-[11px] text-rose-500 font-medium">
                    {signupErrors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-0.5">Email</label>
                  <div
                    className={`relative flex items-center rounded-xl border bg-white transition-all ${signupErrors.email
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100'
                      }`}
                  >
                    <div className="absolute left-2.5 text-slate-400 pointer-events-none">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full py-2 pl-8 pr-2.5 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                      {...signupRegister('email')}
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="mt-0.5 text-[10px] text-rose-500 font-medium">
                      {signupErrors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-0.5">Mobile</label>
                  <div
                    className={`relative flex items-center rounded-xl border bg-white transition-all ${signupErrors.mobileNumber
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100'
                      }`}
                  >
                    <div className="absolute left-2.5 text-slate-400 pointer-events-none">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+91 98765..."
                      className="w-full py-2 pl-8 pr-2.5 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                      {...signupRegister('mobileNumber')}
                    />
                  </div>
                  {signupErrors.mobileNumber && (
                    <p className="mt-0.5 text-[10px] text-rose-500 font-medium">
                      {signupErrors.mobileNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-0.5">Password</label>
                <div
                  className={`relative flex items-center rounded-xl border bg-white transition-all ${signupErrors.password
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100'
                    }`}
                >
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className="w-full py-2 pl-9 pr-9 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                    {...signupRegister('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="mt-0.5 text-[11px] text-rose-500 font-medium">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-0.5">
                  Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-200 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-100 bg-white transition-all">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. TFL123456"
                    className="w-full py-2 pl-9 pr-3 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-mono font-medium uppercase"
                    {...signupRegister('referralCode')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ------------------------------ Social Login & Toggle Footer ------------------------------ */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              OR
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              toast('Google OAuth ready for client credentials configuration.', { icon: 'ℹ️' })
            }
            className="w-full flex items-center justify-center gap-2.5 py-2 sm:py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-slate-500 mt-3.5">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-[#D97706] hover:underline ml-1 cursor-pointer"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#D97706] hover:underline ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ------------------------------ Exported Page with Suspense ------------------------------
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#050811] flex items-center justify-center text-white text-xs">
          Loading TierFlow...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
