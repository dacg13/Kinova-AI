import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Bell, Activity, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors lg:hidden text-[var(--text-secondary)]"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-500 dark:to-brand-200 bg-clip-text text-transparent">
            Kinova AI
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-200">
            v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)] cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 transition-transform duration-300 rotate-0 hover:rotate-12" />
          ) : (
            <Sun className="h-5 w-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
          )}
        </button>

        <div className="h-6 w-[1px] bg-[var(--border-color)] mx-1"></div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Sarah Jenkins</span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">Patient #4928</span>
          </div>
          <div className="w-8.5 h-8.5 rounded-full border border-brand-500/20 bg-brand-500/10 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-200">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
};
