import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Activity, Mail, Lock, User, Sparkles, Zap } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface DemoAccount {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  emoji: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'patient',
    name: 'Dhruv Patel',
    email: 'dhruv@kinova-ai.com',
    password: 'demo1234',
    label: 'Patient',
    desc: 'Recovery dashboard, exercises, AI coach',
    color: 'text-violet-300',
    bg: 'bg-violet-500/10 hover:bg-violet-500/20',
    border: 'border-violet-500/40 hover:border-violet-400/70',
    emoji: '🧑‍⚕️',
  },
  {
    role: 'therapist',
    name: 'Dr. Robert Hayes',
    email: 'robert@kinova-ai.com',
    password: 'demo1234',
    label: 'Therapist',
    desc: 'Patient roster, protocol builder',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    border: 'border-cyan-500/40 hover:border-cyan-400/70',
    emoji: '👨‍⚕️',
  },
  {
    role: 'caregiver',
    name: 'Priya Patel',
    email: 'priya@kinova-ai.com',
    password: 'demo1234',
    label: 'Caregiver',
    desc: 'Family compliance & alerts hub',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    border: 'border-emerald-500/40 hover:border-emerald-400/70',
    emoji: '👩‍👦',
  },
  {
    role: 'admin',
    name: 'Admin User',
    email: 'admin@kinova-ai.com',
    password: 'demo1234',
    label: 'Hospital Admin',
    desc: 'System telemetry & registrations',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    border: 'border-amber-500/40 hover:border-amber-400/70',
    emoji: '🏥',
  },
];

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();
  const { showNotification } = useNotifications();

  const isSignUpMode = searchParams.get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignUpMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        navigate(user.onboardingCompleted ? '/patient/dashboard' : '/patient/onboarding');
      } else if (user.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else if (user.role === 'caregiver') {
        navigate('/caregiver/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !email) {
      showNotification('Please enter a username or email to proceed.', 'warning');
      return;
    }
    const username = name || email.split('@')[0] || 'User';
    login(username, selectedRole);
    showNotification(`Logged in successfully as ${username} (${selectedRole})`, 'success');
  };

  const handleGoogleLogin = () => {
    login('Dhruv Patel', 'patient');
    showNotification('Google authentication successful! Logged in as Dhruv Patel.', 'success');
  };

  const handleDemoLogin = (account: DemoAccount) => {
    login(account.name, account.role);
    showNotification(`🚀 Demo login successful! Welcome, ${account.name}.`, 'success');
  };

  const roleConfigs = [
    { id: 'patient', label: 'Patient', desc: 'Perform recovery routines' },
    { id: 'therapist', label: 'Therapist', desc: 'Prescribe & track diagnostics' },
    { id: 'caregiver', label: 'Caregiver', desc: 'Monitor patient compliance' },
    { id: 'admin', label: 'Hospital/Admin', desc: 'Manage clinic credentials' },
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">

      {/* Background Decorative Glows */}
      <div className="absolute top-[20%] left-[20%] w-[45%] h-[45%] bg-radial from-violet-600/10 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[20%] w-[45%] h-[45%] bg-radial from-brand-600/5 to-transparent pointer-events-none z-0" />

      <div className="w-full max-w-md space-y-4 relative z-10">

        {/* ── JUDGE / DEMO PANEL ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                Judge / Demo Access
              </p>
              <p className="text-[9px] text-slate-500 font-medium">
                Click any role below to instantly sign in — no password required
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <motion.button
                key={acc.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDemoLogin(acc)}
                className={`group flex flex-col items-start p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left ${acc.bg} ${acc.border}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base leading-none">{acc.emoji}</span>
                  <span className={`text-[11px] font-black ${acc.color}`}>{acc.label}</span>
                </div>
                <span className="text-[9px] text-slate-500 leading-tight">{acc.desc}</span>
                <span className="text-[8.5px] text-slate-600 mt-1 font-mono truncate w-full">{acc.email}</span>
              </motion.button>
            ))}
          </div>

          <div className="border-t border-slate-800/60 pt-2 space-y-0.5">
            <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Demo Credentials (for manual entry)</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <span key={acc.role} className="text-[9px] text-slate-500 font-mono">
                  <span className={`font-bold ${acc.color}`}>{acc.label}:</span> {acc.email} / {acc.password}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── MAIN LOGIN CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full glass-card rounded-3xl p-6 md:p-8 space-y-6 bg-slate-900/35 border border-slate-800/60 shadow-2xl backdrop-blur-xl"
        >
          {/* Brand Banner */}
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white pt-2">
              {isSignUp ? 'Create your Account' : 'Welcome to Kinova AI'}
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Rehabilitation Intelligence Platform
            </p>
          </div>

          {/* Google Mock CTA */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-xl border border-slate-800/60 hover:bg-slate-800/40 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-brand-400" />
            Continue with Google
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-850"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-black">Or Use Mail</span>
            <div className="flex-grow border-t border-slate-850"></div>
          </div>

          {/* Main form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold leading-normal">

            {/* Name Field in signup mode */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dhruv Patel"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/65 border border-slate-850 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dhruv@kinova-ai.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/65 border border-slate-850 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => showNotification('Password recovery link sent to your registered email.', 'info')}
                    className="text-[9px] text-brand-400 hover:text-brand-350 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/65 border border-slate-850 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Persona Role Card Selectors */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Choose your Platform Persona</label>
              <div className="grid grid-cols-2 gap-2">
                {roleConfigs.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      selectedRole === role.id
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-slate-850 bg-slate-950/30 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-slate-200">{role.label}</div>
                    <div className="text-[9px] text-slate-500 leading-tight pt-0.5">{role.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 pt-4 cursor-pointer"
            >
              {isSignUp ? 'Create your Account' : 'Authenticate Credentials'}
            </button>
          </form>

          <div className="text-center text-[10px] text-slate-500 font-bold">
            {isSignUp ? 'Already registered?' : 'Need a new recovery setup?'}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-400 hover:underline cursor-pointer"
            >
              {isSignUp ? 'Log in here' : 'Sign up here'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
