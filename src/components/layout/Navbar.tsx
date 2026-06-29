import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Activity, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between transition-colors duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all lg:hidden text-[var(--text-secondary)]"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 border border-white/10">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[17px] tracking-tight text-[var(--text-primary)]">
              Kinova AI
            </span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[var(--text-secondary)]">
              Intelligence Platform
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">


        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[var(--text-secondary)] group cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="h-4.5 w-4.5 transition-transform duration-300 rotate-0 group-hover:rotate-12 group-hover:text-[var(--text-primary)]" />
          ) : (
            <Sun className="h-4.5 w-4.5 transition-transform duration-300 rotate-0 group-hover:-rotate-12 group-hover:text-[var(--text-primary)]" />
          )}
        </button>

        <div className="h-8 w-[1px] bg-[var(--border-color)] mx-2"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-brand-500 transition-colors">Sarah Jenkins</span>
            <span className="text-[10px] text-[var(--text-secondary)] font-medium">Patient #4928</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-brand-500/30 bg-brand-500/10 flex items-center justify-center font-bold text-xs text-brand-500 shadow-inner transition-transform group-hover:scale-105">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
};
