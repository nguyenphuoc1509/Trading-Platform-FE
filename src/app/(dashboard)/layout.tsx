'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp, LayoutGrid, BarChart2, Briefcase, Wallet, ClipboardList, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const NAV = [
  { href: '/dashboard',           icon: LayoutGrid,    label: 'Markets'   },
  { href: '/dashboard/portfolio', icon: Briefcase,     label: 'Portfolio' },
  { href: '/dashboard/wallet',    icon: Wallet,        label: 'Wallet'    },
  { href: '/dashboard/orders',    icon: ClipboardList, label: 'Orders'    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Clear cookie
    document.cookie = 'access_token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="flex flex-col w-[220px] shrink-0 border-r border-border bg-[var(--sidebar)] py-5">
        <div className="flex items-center gap-2.5 px-5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg text-foreground tracking-tight">
            TradeX
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-primary')} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-4 border-t border-border mt-auto">
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-foreground truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}