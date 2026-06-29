import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Play, 
  Stethoscope, 
  Settings, 
  X, 
  LogOut,
  Dumbbell,
  TrendingUp,
  Heart,
  Sparkles,
  FileText,
  MessageSquare,
  Building
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
    if (window.innerWidth < 1024) onClose();
  };

  const getMenuItems = () => {
    if (!user) return [];

    if (user.role === 'patient') {
      return [
        {
          name: 'Dashboard',
          path: '/patient/dashboard',
          icon: LayoutDashboard,
          desc: 'Overall recovery status',
        },
        {
          name: 'Exercise Library',
          path: '/patient/exercises',
          icon: Dumbbell,
          desc: 'Assigned routines gallery',
        },
        {
          name: 'Live AI Session',
          path: '/patient/workout',
          icon: Play,
          desc: 'AI guided exercises',
        },
        {
          name: 'Progress Analytics',
          path: '/patient/progress',
          icon: TrendingUp,
          desc: 'Clinical stats charts',
        },
        {
          name: 'Digital Twin',
          path: '/patient/twin',
          icon: Heart,
          desc: '3D skeletal twin visualizer',
        },
        {
          name: 'AI Coach',
          path: '/patient/coach',
          icon: Sparkles,
          desc: 'Consult AI recovery coach',
        },
        {
          name: 'Reports',
          path: '/patient/reports',
          icon: FileText,
          desc: 'Download clinical sheets',
        },
        {
          name: 'Messages',
          path: '/patient/messages',
          icon: MessageSquare,
          desc: 'Secure clinical chat',
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
          desc: 'Platform configuration',
        },
      ];
    }

    if (user.role === 'therapist') {
      return [
        {
          name: 'Therapist Hub',
          path: '/therapist/dashboard',
          icon: LayoutDashboard,
          desc: 'Clinician monitoring',
        },
        {
          name: 'Protocol Builder',
          path: '/therapist/protocol',
          icon: Stethoscope,
          desc: 'Custom prescription forms',
        },
        {
          name: 'Messages',
          path: '/therapist/messages',
          icon: MessageSquare,
          desc: 'Patient messaging',
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
          desc: 'Platform configuration',
        },
      ];
    }

    if (user.role === 'caregiver') {
      return [
        {
          name: 'Caregiver Hub',
          path: '/caregiver/dashboard',
          icon: Heart,
          desc: 'Monitor care recipient',
        },
        {
          name: 'Messages',
          path: '/caregiver/messages',
          icon: MessageSquare,
          desc: 'Secure caregiver chat',
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
          desc: 'Platform configuration',
        },
      ];
    }

    if (user.role === 'admin') {
      return [
        {
          name: 'Admin Hub',
          path: '/admin/dashboard',
          icon: Building,
          desc: 'Hospital administrations',
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
          desc: 'Platform configuration',
        },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  const activeClass =
    'flex items-center gap-3 px-3.5 py-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-200 border-l-4 border-brand-500 font-semibold shadow-sm transition-all duration-200';
  const inactiveClass =
    'flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-l-4 border-transparent font-medium transition-all duration-200';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-45 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close button */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--border-color)] lg:hidden">
          <span className="font-bold text-brand-600 dark:text-brand-400">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-sm tracking-wide">{item.name}</span>
                <span className="text-[10px] opacity-70 font-normal leading-tight">
                  {item.desc}
                </span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold hover:border-l-4 hover:border-red-500 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <div className="flex flex-col text-left">
              <span className="text-sm">Sign Out</span>
              <span className="text-[10px] opacity-70 font-normal">Close active profile</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
