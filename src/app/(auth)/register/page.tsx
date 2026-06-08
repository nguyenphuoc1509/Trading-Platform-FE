'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, TrendingUp, Loader2, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function getPasswordStrength(pw: string): PasswordStrength {
  if (pw.length < 6) return 'weak';
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'fair';
  if (score === 2) return 'good';
  return 'strong';
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; bars: number }> = {
  weak:   { label: 'Too short',  color: 'bg-destructive',   bars: 1 },
  fair:   { label: 'Weak',       color: 'bg-[hsl(40,90%,55%)]', bars: 2 },
  good:   { label: 'Good',       color: 'bg-primary/70',    bars: 3 },
  strong: { label: 'Strong',     color: 'bg-primary',       bars: 4 },
};

export default function RegisterPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const setField =
    (key: keyof Omit<FormState, 'agreed'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrorMsg('');
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const strength = useMemo(
    () => (form.password ? getPasswordStrength(form.password) : null),
    [form.password]
  );
  const strengthInfo = strength ? strengthConfig[strength] : null;

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      }),
    onSuccess: (data) => {
      if (data.accessToken) {
        setToken(data.accessToken);
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setErrorMsg('Full name is required.'); return; }
    if (!form.email.trim())    { setErrorMsg('Email is required.'); return; }
    if (form.password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    if (!form.agreed) { setErrorMsg('Please agree to the terms.'); return; }
    registerMutation.mutate();
  };

  const requirements = [
    { label: 'At least 6 characters', met: form.password.length >= 6 },
    { label: 'Uppercase letter',       met: /[A-Z]/.test(form.password) },
    { label: 'Number',                 met: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col overflow-hidden">
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
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-[oklch(0.65_0.15_210/8%)] blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-[oklch(0.72_0.18_162/6%)] blur-3xl" />

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

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-16 pb-16">
          <div className="opacity-0 animate-float-up">
            <h1 className="font-heading text-5xl font-semibold leading-tight text-foreground mb-4">
              Start your<br />
              <span className="text-primary">trading journey.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Join thousands of traders. Free account, instant access to live markets.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-12 space-y-4 opacity-0 animate-float-up delay-200">
            {[
              'Real-time market data & candlestick charts',
              'Secure JWT-based authentication',
              'Portfolio tracking & order history',
              'Two-factor authentication support',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feat}</span>
              </div>
            ))}
          </div>

          {/* Order book decorative */}
<div className="mt-10 opacity-0 animate-float-up delay-300">
  <div className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm max-w-xs">
    <p className="text-xs text-muted-foreground mb-3 font-mono">Order Book — BTC/USDT</p>
    <div className="space-y-1">
      {[
        { price: '67,425.00', qty: '0.341', side: 'ask', width: 72 },
        { price: '67,422.50', qty: '0.892', side: 'ask', width: 45 },
        { price: '67,420.50', qty: '1.203', side: 'ask', width: 58 },
      ].map((row) => (
        <div key={row.price} className="flex items-center justify-between text-xs font-mono">
          <span className="text-destructive">{row.price}</span>
          <span className="text-muted-foreground">{row.qty}</span>
          <div className="h-1.5 rounded-sm bg-destructive/15 w-16 relative overflow-hidden">
            <div
              className="absolute right-0 top-0 h-full bg-destructive/30 rounded-sm"
              style={{ width: `${row.width}%` }}
            />
          </div>
        </div>
      ))}

      <div className="my-2 border-t border-border" />

      {[
        { price: '67,418.00', qty: '2.041', side: 'bid', width: 85 },
        { price: '67,415.50', qty: '0.567', side: 'bid', width: 33 },
        { price: '67,412.00', qty: '1.789', side: 'bid', width: 61 },
      ].map((row) => (
        <div key={row.price} className="flex items-center justify-between text-xs font-mono">
          <span className="text-primary">{row.price}</span>
          <span className="text-muted-foreground">{row.qty}</span>
          <div className="h-1.5 rounded-sm bg-primary/15 w-16 relative overflow-hidden">
            <div
              className="absolute right-0 top-0 h-full bg-primary/30 rounded-sm"
              style={{ width: `${row.width}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
        </div>
      </div>

      {/* ── Right panel (form) ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div
          className="absolute inset-0 lg:hidden"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-7">
              <h2 className="font-heading text-2xl font-semibold text-foreground">Create account</h2>
              <p className="text-muted-foreground text-sm mt-1">Free forever. No credit card needed.</p>
            </div>

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={setField('fullName')}
                placeholder="Alex Johnson"
                autoComplete="name"
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={setField('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  placeholder="••••••••"
                  autoComplete="new-password"
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

              {/* Strength bar */}
              {form.password && strengthInfo && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          i <= strengthInfo.bars ? strengthInfo.color : 'bg-border'
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('text-xs font-medium', strengthInfo.bars >= 3 ? 'text-primary' : 'text-muted-foreground')}>
                      {strengthInfo.label}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      {requirements.map((req) => (
                        <span
                          key={req.label}
                          className={cn(
                            'text-[10px] transition-colors',
                            req.met ? 'text-primary' : 'text-muted-foreground/50'
                          )}
                        >
                          {req.met ? '✓' : '·'} {req.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setErrorMsg('');
                    setForm((p) => ({ ...p, confirmPassword: e.target.value }));
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(
                    inputCls,
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-destructive/50 focus:ring-destructive/40'
                      : form.confirmPassword && form.password === form.confirmPassword
                      ? 'border-primary/40'
                      : ''
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => {
                  setErrorMsg('');
                  setForm((p) => ({ ...p, agreed: e.target.checked }));
                }}
                className="mt-0.5 w-3.5 h-3.5 accent-primary rounded"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <span className="text-primary hover:text-primary/80 cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary hover:text-primary/80 cursor-pointer">Privacy Policy</span>
              </span>
            </label>

            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                <p className="text-xs text-destructive leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full h-10 rounded-lg border border-border bg-input/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all';