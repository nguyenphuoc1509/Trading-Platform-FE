'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, TrendingUp, Loader2, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

type AuthStep = 'login' | '2fa' | 'forgot-email' | 'forgot-otp';

interface FormState {
  email: string;
  password: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const TICKER_ITEMS = [
  { symbol: 'BTC/USDT', price: '67,420.50', change: '+2.34%', up: true },
  { symbol: 'ETH/USDT', price: '3,521.80', change: '+1.87%', up: true },
  { symbol: 'BNB/USDT', price: '584.20',   change: '-0.43%', up: false },
  { symbol: 'SOL/USDT', price: '172.40',   change: '+4.12%', up: true },
  { symbol: 'XRP/USDT', price: '0.5821',   change: '-1.05%', up: false },
  { symbol: 'ADA/USDT', price: '0.4489',   change: '+0.78%', up: true },
  { symbol: 'AVAX/USDT', price: '38.74',   change: '+3.21%', up: true },
  { symbol: 'DOGE/USDT', price: '0.1632',  change: '-0.91%', up: false },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuthStore();

  const [step, setStep] = useState<AuthStep>('login');
  const [sessionId, setSessionId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const redirectTo = searchParams.get('from') ?? '/';

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  // ── Login Mutation ──────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: () => authApi.login(form.email, form.password),
    onSuccess: (data) => {
      if (data.isTwoFactorAuthEnabled) {
        setSessionId(data.session);
        setStep('2fa');
        setErrorMsg('');
      } else if (data.accessToken) {
        setToken(data.accessToken);
        router.push(redirectTo);
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Invalid email or password.';
      setErrorMsg(msg);
    },
  });

  // ── 2FA Mutation ────────────────────────────────────────────────────────────
  const twoFaMutation = useMutation({
    mutationFn: () => authApi.verifyTwoFactorOtp(form.otp, sessionId),
    onSuccess: (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
        router.push(redirectTo);
      }
    },
    onError: () => setErrorMsg('Invalid OTP. Please try again.'),
  });

  // ── Send Reset OTP ──────────────────────────────────────────────────────────
  const sendOtpMutation = useMutation({
    mutationFn: () =>
      authApi.sendPasswordResetOtp({ sendTo: form.email, verificationType: 'EMAIL' }),
    onSuccess: (data) => {
      setSessionId(data.session);
      setStep('forgot-otp');
      setSuccessMsg('OTP sent to your email.');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Could not send OTP. Check the email address.';
      setErrorMsg(msg);
    },
  });

  // ── Reset Password ──────────────────────────────────────────────────────────
  const resetPasswordMutation = useMutation({
    mutationFn: () =>
      authApi.verifyPasswordResetOtp(sessionId, {
        otp: form.otp,
        password: form.newPassword,
      }),
    onSuccess: () => {
      setSuccessMsg('Password reset! You can now log in.');
      setTimeout(() => {
        setStep('login');
        setSuccessMsg('');
        setForm((p) => ({ ...p, otp: '', newPassword: '', confirmPassword: '' }));
      }, 1800);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Invalid OTP or expired.';
      setErrorMsg(msg);
    },
  });

  const isPending =
    loginMutation.isPending ||
    twoFaMutation.isPending ||
    sendOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  // ── Submit handlers 
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErrorMsg('Please fill in all fields.'); return; }
    loginMutation.mutate();
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp) { setErrorMsg('Enter the OTP.'); return; }
    twoFaMutation.mutate();
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) { setErrorMsg('Enter your email address.'); return; }
    sendOtpMutation.mutate();
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp || !form.newPassword) { setErrorMsg('Fill in all fields.'); return; }
    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    resetPasswordMutation.mutate();
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px),
              linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[oklch(0.72_0.18_162/8%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[oklch(0.65_0.15_210/6%)] blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight text-foreground">
              TradeX
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-16 pb-16">
          <div className="opacity-0 animate-float-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Market Live</span>
            </div>
            <h1 className="font-heading text-5xl font-semibold leading-tight text-foreground mb-4">
              Trade smarter.<br />
              <span className="text-primary">Execute faster.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Access real-time charts, instant order execution, and deep market data — all in one platform.
            </p>
          </div>

          {/* Fake chart SVG */}
          <div className="mt-12 opacity-0 animate-float-up delay-200">
            <div className="relative rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">BTC / USDT</p>
                  <p className="font-heading font-semibold text-2xl text-foreground font-mono mt-0.5">
                    $67,420.50
                  </p>
                </div>
                <span className="text-sm font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  +2.34%
                </span>
              </div>
              <svg viewBox="0 0 360 80" className="w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 162)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 162)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 L30,55 L60,58 L90,45 L120,42 L150,38 L180,43 L210,30 L240,25 L270,20 L300,15 L330,18 L360,10 L360,80 L0,80 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,60 L30,55 L60,58 L90,45 L120,42 L150,38 L180,43 L210,30 L240,25 L270,20 L300,15 L330,18 L360,10"
                  fill="none"
                  stroke="oklch(0.72 0.18 162)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-chart-draw"
                />
              </svg>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-3 opacity-0 animate-float-up delay-300">
            {[
              { label: 'Daily Volume', value: '$4.2B' },
              { label: 'Active Traders', value: '128K+' },
              { label: 'Listed Assets', value: '350+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card/40 p-3 text-center backdrop-blur-sm"
              >
                <p className="font-heading font-semibold text-foreground font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div className="relative z-10 border-t border-border overflow-hidden py-3">
          <div className="flex animate-ticker whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-6 font-mono text-xs">
                <span className="text-muted-foreground">{item.symbol}</span>
                <span className="text-foreground font-medium">{item.price}</span>
                <span className={item.up ? 'text-primary' : 'text-destructive'}>{item.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `linear-gradient(oklch(1 0 0 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2%) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 w-full max-w-sm opacity-0 animate-slide-right delay-100">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-lg text-foreground">TradeX</span>
          </div>

          {/* Step: Login */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="mb-8">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to your trading account</p>
              </div>

              <InputField
                label="Email address"
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={setField('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-primary rounded" />
                  <span className="text-xs text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setStep('forgot-email'); setErrorMsg(''); }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {errorMsg && <ErrorBanner message={errorMsg} />}

              <SubmitButton loading={isPending} label="Sign in" />

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Create account
                </Link>
              </p>
            </form>
          )}

          {/* Step: 2FA OTP */}
          {step === '2fa' && (
            <form onSubmit={handle2FA} className="space-y-5">
              <button
                type="button"
                onClick={() => { setStep('login'); setErrorMsg(''); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-semibold text-foreground">Two-factor auth</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter the 6-digit OTP sent to your email.
                </p>
              </div>

              <OtpInput value={form.otp} onChange={setField('otp')} />

              {errorMsg && <ErrorBanner message={errorMsg} />}
              <SubmitButton loading={isPending} label="Verify OTP" />
            </form>
          )}

          {/* Step: Forgot — enter email */}
          {step === 'forgot-email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <button
                type="button"
                onClick={() => { setStep('login'); setErrorMsg(''); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back to login
              </button>
              <div className="mb-8">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Reset password</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  We&apos;ll send an OTP to your email.
                </p>
              </div>

              <InputField
                label="Email address"
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
              />

              {errorMsg && <ErrorBanner message={errorMsg} />}
              {successMsg && <SuccessBanner message={successMsg} />}
              <SubmitButton loading={isPending} label="Send OTP" />
            </form>
          )}

          {/* Step: Forgot — enter OTP + new password */}
          {step === 'forgot-otp' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <button
                type="button"
                onClick={() => { setStep('forgot-email'); setErrorMsg(''); setSuccessMsg(''); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="mb-8">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Set new password</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter the OTP and your new password.
                </p>
              </div>

              <OtpInput value={form.otp} onChange={setField('otp')} />

              <PasswordField
                label="New password"
                value={form.newPassword}
                onChange={setField('newPassword')}
                show={showNewPassword}
                onToggle={() => setShowNewPassword((p) => !p)}
              />
              <InputField
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                placeholder="••••••••"
              />

              {errorMsg && <ErrorBanner message={errorMsg} />}
              {successMsg && <SuccessBanner message={successMsg} />}
              <SubmitButton loading={isPending} label="Reset Password" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────

const inputCls =
  'w-full h-10 rounded-lg border border-border bg-input/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all';

function InputField({
  label, type, value, onChange, placeholder, autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type ?? 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputCls}
      />
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className={inputCls}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">One-time password</label>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={onChange}
        placeholder="000000"
        className={cn(inputCls, 'text-center tracking-[0.4em] font-mono text-base')}
      />
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed animate-pulse-glow"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
      <p className="text-xs text-destructive leading-relaxed">{message}</p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/8 px-3.5 py-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
      <p className="text-xs text-primary leading-relaxed">{message}</p>
    </div>
  );
}