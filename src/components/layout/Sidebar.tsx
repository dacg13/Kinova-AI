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
  MessageSquare
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
    onClose();
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

    return [];
  };

  const menuItems = getMenuItems();

  const getLinkClass = (isActive: boolean) => {
    const base = isActive ? 'sidebar-active font-bold text-[var(--text-primary)]' : 'sidebar-inactive text-[var(--text-secondary)]';
    return `${base} flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group
      px-4 md:px-2 lg:px-4 md:justify-center lg:justify-start
      ${isOpen ? '!px-4 !justify-start' : ''}`;
  };

  return (
    <>
      {/* Mobile/Tablet Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-45 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 glass-panel
          md:static md:translate-x-0
          ${isOpen 
            ? 'translate-x-0 w-72' 
            : '-translate-x-full md:translate-x-0 w-72 md:w-20 lg:w-72'}`}
      >
        {/* Mobile Header Close button */}
        <div className={`h-16 items-center justify-between px-6 border-b border-[var(--border-color)] md:hidden ${isOpen ? 'flex' : 'hidden'}`}>
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
        <nav className="flex-1 space-y-1 px-4 md:px-2 lg:px-4 py-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <div className={`flex flex-col text-left md:hidden lg:flex ${isOpen ? '!flex' : ''}`}>
                <span className="text-sm tracking-wide">{item.name}</span>
                <span className="text-[10px] opacity-70 font-normal leading-tight">
                  {item.desc}
                </span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 md:p-2 lg:p-4 border-t border-[var(--border-color)]">
          <button 
            onClick={handleSignOut}
            className={`flex w-full items-center gap-3 py-3 rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold hover:border-l-4 hover:border-red-500 transition-all duration-200 cursor-pointer
              px-4 md:px-0 lg:px-4 md:justify-center lg:justify-start ${isOpen ? '!px-4 !justify-start' : ''}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <div className={`flex flex-col text-left md:hidden lg:flex ${isOpen ? '!flex' : ''}`}>
              <span className="text-sm">Sign Out</span>
              <span className="text-[10px] opacity-70 font-normal">Close active profile</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

