import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Play, 
  Heart, 
  Sparkles, 
  MoreHorizontal,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Menu
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  // Determine bottom nav items based on persona
  const getBottomNavItems = () => {
    if (user.role === 'patient') {
      return [
        { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
        { name: 'Exercises', path: '/patient/exercises', icon: Dumbbell },
        { name: 'Live Session', path: '/patient/workout', icon: Play },
        { name: 'Digital Twin', path: '/patient/twin', icon: Heart },
        { name: 'AI Coach', path: '/patient/coach', icon: Sparkles },
        { name: 'More', isMore: true, icon: MoreHorizontal }
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/therapist/dashboard', icon: LayoutDashboard },
        { name: 'Protocol', path: '/therapist/protocol', icon: Dumbbell },
        { name: 'Messages', path: '/therapist/messages', icon: MessageSquare },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
        { name: 'More', isMore: true, icon: MoreHorizontal }
      ];
    }
  };

  // Determine more menu options
  const getMoreMenuOptions = () => {
    if (user.role === 'patient') {
      return [
        { name: 'Progress Analytics', path: '/patient/progress', icon: TrendingUp },
        { name: 'Reports', path: '/patient/reports', icon: FileText },
        { name: 'Messages', path: '/patient/messages', icon: MessageSquare },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
        { name: 'Sign Out', action: handleSignOut, icon: LogOut, isRed: true }
      ];
    } else {
      return [
        { name: 'Sign Out', action: handleSignOut, icon: LogOut, isRed: true }
      ];
    }
  };

  const bottomNavItems = getBottomNavItems();
  const moreMenuOptions = getMoreMenuOptions();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden">
      {/* Premium Dashboard Silhouette Background */}
      <div 
        className="fixed inset-y-0 right-0 left-0 md:left-20 lg:left-72 z-0 bg-cover bg-center pointer-events-none opacity-20 dark:opacity-35 mix-blend-screen transition-opacity duration-500"
        style={{ backgroundImage: 'url("/dashboard-bg.png")' }}
      />

      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Content Outlet Frame */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 lg:px-12 pb-24 md:pb-10 focus:outline-none relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating Hamburger Menu Button (Mobile/Tablet) */}
      <button 
        onClick={toggleSidebar}
        className="fixed bottom-20 right-4 z-40 p-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-xl shadow-brand-500/35 transition-all md:hidden flex items-center justify-center border border-white/10 active:scale-95 cursor-pointer"
        aria-label="Open sidebar drawer"
      >
        <Menu className="h-5.5 w-5.5" />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[var(--glass-bg)] border-t border-[var(--border-color)] md:hidden flex items-center justify-around px-2 pb-safe shadow-2xl backdrop-blur-[var(--glass-blur)]">
        {bottomNavItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMore) {
            return (
              <button
                key={index}
                onClick={() => setIsMoreOpen(true)}
                className="flex flex-col items-center justify-center w-12 h-12 text-[var(--text-secondary)] hover:text-brand-500 transition-colors active:scale-95 cursor-pointer"
                aria-label="Open more menu"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-bold tracking-tight mt-0.5">{item.name}</span>
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => navigate(item.path || '/')}
              className={`flex flex-col items-center justify-center w-12 h-12 transition-colors active:scale-95 cursor-pointer relative ${
                isActive ? 'text-brand-500' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-bold tracking-tight mt-0.5">{item.name}</span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* More Options Bottom Sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Sheet Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 z-45 bg-black/50 backdrop-blur-xs md:hidden"
            />
            {/* Sheet Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-[32px] p-6 pb-10 border-t border-[var(--border-color)] md:hidden flex flex-col gap-4 shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              {/* Drag bar indicator */}
              <div className="w-12 h-1.5 bg-slate-500/20 rounded-full mx-auto mb-2" />
              
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-2">
                <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)] tracking-widest">Kinova Platform Settings</span>
                <button 
                  onClick={() => setIsMoreOpen(false)}
                  className="text-xs font-bold text-brand-500 hover:text-brand-400 cursor-pointer"
                >
                  Done
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {moreMenuOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsMoreOpen(false);
                      if (opt.action) {
                        opt.action();
                      } else if (opt.path) {
                        navigate(opt.path);
                      }
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-left transition-all active:scale-95 cursor-pointer hover:bg-white/10 ${
                      opt.isRed 
                        ? 'text-red-500 border-red-500/10 hover:bg-red-500/5' 
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <opt.icon className={`h-5 w-5 shrink-0 ${opt.isRed ? 'text-red-500' : 'text-brand-500'}`} />
                    <span className="text-xs font-extrabold">{opt.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

