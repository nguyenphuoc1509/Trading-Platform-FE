'use client';

import { TrendingUp, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg text-foreground">TradeX</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.fullName ?? user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      {/* Placeholder */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Dashboard — trading UI coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}