import { forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PieChart, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: PieChart },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/profile', label: 'Profile', icon: User },
];

export const BottomNav = forwardRef<HTMLElement, Record<string, never>>(
  function BottomNav(_, ref) {
    const location = useLocation();

    return (
      <nav
        ref={ref}
        className="fixed inset-x-0 bottom-3 md:bottom-6 z-40 pointer-events-none"
      >
        <div
          className="pointer-events-auto mx-auto w-full max-w-2xl px-4"
        >
          <div
            className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl shadow-black/10 supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-black/25 pb-[max(env(safe-area-inset-bottom),0.25rem)]"
          >
            <div className="flex items-center justify-between py-2 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/20 to-primary/10 border border-primary/20"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={cn(
                  'h-5 w-5 relative z-10 transition-colors drop-shadow-sm',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'text-xs font-medium relative z-10 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
            </div>
          </div>
        </div>
      </nav>
    );
  }
);
