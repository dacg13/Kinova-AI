import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Activity, Mail, Lock, User, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface DemoAccount {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  label: string;
  desc: string;
  gradient: string;
  emoji: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'patient',
    name: 'Dhruv Patel',
    email: 'dhruv@kinova-ai.com',
    password: 'demo1234',
    label: 'Patient',
    desc: 'Recovery dashboard & AI coach',
    gradient: 'from-violet-500/20 to-violet-600/5',
    emoji: '🧑‍⚕️',
  },
  {
    role: 'therapist',
    name: 'Dr. Robert Hayes',
    email: 'robert@kinova-ai.com',
    password: 'demo1234',
    label: 'Therapist',
    desc: 'Patient roster & protocols',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    emoji: '👨‍⚕️',
  },
  {
    role: 'caregiver',
    name: 'Priya Patel',
    email: 'priya@kinova-ai.com',
    password: 'demo1234',
    label: 'Caregiver',
    desc: 'Compliance & alerts hub',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    emoji: '👩‍👦',
  },
  {
    role: 'admin',
    name: 'Admin User',
    email: 'admin@kinova-ai.com',
    password: 'demo1234',
    label: 'Hospital Admin',
    desc: 'System & registrations',
    gradient: 'from-amber-500/20 to-amber-600/5',
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
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">

      {/* Ambient Background Glows */}
      <div className="absolute top-[10%] left-[15%] w-[50%] h-[50%] bg-radial from-brand-600/8 to-transparent pointer-events-none z-0 rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] right-[15%] w-[50%] h-[50%] bg-radial from-cyan-600/5 to-transparent pointer-events-none z-0 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">

        {/* Judge / Demo Panel */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[24px] border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent backdrop-blur-xl p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-400">
                Judge / Demo Access
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Click any role to instantly sign in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <motion.button
                key={acc.role}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDemoLogin(acc)}
                className={`group flex flex-col items-start p-4 rounded-2xl border border-white/8 bg-gradient-to-br ${acc.gradient} transition-all duration-300 cursor-pointer text-left hover:border-white/15 hover:shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg leading-none">{acc.emoji}</span>
                  <span className="text-[12px] font-bold text-white">{acc.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{acc.desc}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full rounded-[24px] p-8 space-y-7 bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/8 shadow-2xl backdrop-blur-2xl"
        >
          {/* Brand Banner */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 mx-auto border border-white/10">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white pt-3">
              {isSignUp ? 'Create your Account' : 'Welcome to Kinova AI'}
            </h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              Rehabilitation Intelligence Platform
            </p>
          </div>

          {/* Google CTA */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-2xl border border-white/8 hover:border-white/15 hover:bg-white/5 text-sm font-bold text-slate-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="h-4 w-4 text-brand-400 group-hover:rotate-12 transition-transform" />
            Continue with Google
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/6"></div>
            <span className="flex-shrink mx-5 text-[9px] text-slate-600 uppercase tracking-[0.25em] font-bold">Or Use Mail</span>
            <div className="flex-grow border-t border-white/6"></div>
          </div>

          {/* Main form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-sm font-medium">
            
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dhruv Patel"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dhruv@kinova-ai.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => showNotification('Password recovery link sent to your registered email.', 'info')}
                    className="text-[10px] text-brand-400 hover:text-brand-300 cursor-pointer font-semibold transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-3 pt-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold">Choose Platform Persona</label>
              <div className="grid grid-cols-2 gap-3">
                {roleConfigs.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id as UserRole)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                      selectedRole === role.id
                        ? 'border-brand-500/40 bg-brand-500/10 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                        : 'border-white/6 bg-white/3 hover:border-white/12 hover:bg-white/5'
                    }`}
                  >
                    <div className={`font-bold text-[12px] ${selectedRole === role.id ? 'text-brand-300' : 'text-slate-300'} transition-colors`}>{role.label}</div>
                    <div className="text-[10px] text-slate-600 leading-tight pt-0.5">{role.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 cursor-pointer group hover:shadow-brand-500/40 hover:-translate-y-0.5"
            >
              {isSignUp ? 'Create your Account' : 'Authenticate Credentials'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-600 font-medium">
            {isSignUp ? 'Already registered?' : 'Need a new recovery setup?'}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-400 hover:text-brand-300 cursor-pointer font-bold transition-colors"
            >
              {isSignUp ? 'Log in here' : 'Sign up here'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
