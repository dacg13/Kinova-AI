import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Play, 
  Award,
  Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const username = user?.name || 'Dhruv';

  // Sample analytics data for the progress chart
  const weeklyTrends = [
    { name: 'Mon', rom: 85, pain: 6 },
    { name: 'Tue', rom: 90, pain: 5 },
    { name: 'Wed', rom: 92, pain: 5 },
    { name: 'Thu', rom: 95, pain: 4 },
    { name: 'Fri', rom: 102, pain: 3 },
    { name: 'Sat', rom: 108, pain: 3 },
    { name: 'Sun', rom: 112, pain: 2 },
  ];

  const assignedExercises = [
    {
      id: 'squat',
      name: 'Squat Stability',
      target: '90° Knee Flexion',
      reps: '15 Reps x 3 Sets',
      difficulty: 'Moderate',
      clinician: 'Robert (DPT)',
      icon: Activity
    },
    {
      id: 'shoulder_raise',
      name: 'Shoulder Abduction',
      target: '130° Arm Raise',
      reps: '12 Reps x 3 Sets',
      difficulty: 'Easy',
      clinician: 'Robert (DPT)',
      icon: Activity
    },
    {
      id: 'sit_to_stand',
      name: 'Sit-To-Stand Pacing',
      target: '180° Hip Extension',
      reps: '10 Reps x 2 Sets',
      difficulty: 'Easy',
      clinician: 'Robert (DPT)',
      icon: Activity
    }
  ];

  const handleStartWorkout = (id: string) => {
    localStorage.setItem('kinova_active_exercise', id);
    navigate('/patient/workout');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Hero Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Welcome back, {username}
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            Here is your clinical recovery snapshot for today.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 md:mx-0 md:px-0">
        
        {/* Recovery Score Card */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group shrink-0 w-[280px] snap-center md:shrink md:w-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold">Recovery Score</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black tracking-tight text-[var(--text-primary)] group-hover:text-brand-400 transition-colors">84</span>
            <span className="text-xs text-brand-500 font-bold bg-brand-500/10 px-2 py-1 rounded-lg">+2.4%</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--text-secondary)] relative z-10">Based on ROM & Form Accuracy</span>
        </div>

        {/* Daily Goals */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group shrink-0 w-[280px] snap-center md:shrink md:w-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold">Daily Routine</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black tracking-tight text-[var(--text-primary)]">2<span className="text-3xl text-[var(--text-secondary)]">/3</span></span>
          </div>
          <span className="text-[11px] font-medium text-[var(--text-secondary)] relative z-10">Targeting left shoulder flexion</span>
        </div>

        {/* Active Streak */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group shrink-0 w-[280px] snap-center md:shrink md:w-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold">Active Streak</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Flame className="h-5 w-5 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black tracking-tight text-[var(--text-primary)] group-hover:text-orange-400 transition-colors">5</span>
            <span className="text-xs text-orange-500 font-bold">days</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--text-secondary)] relative z-10">7-day milestone approaching</span>
        </div>

        {/* Pain Level index */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group shrink-0 w-[280px] snap-center md:shrink md:w-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold">Subjective Pain</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black tracking-tight text-[var(--text-primary)]">2</span>
            <span className="text-xs text-cyan-500 font-bold bg-cyan-500/10 px-2 py-1 rounded-lg">-40%</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--text-secondary)] relative z-10">From initial baseline log</span>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Weekly Trend Chart */}
        <div className="glass-card rounded-[24px] p-7 space-y-6 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500">
                <TrendingUp className="h-4 w-4" />
              </div>
              Recovery Velocity
            </h3>
            <div className="flex gap-2">
              <span className="text-[10px] px-3 py-1 rounded-full bg-brand-500 text-white font-bold tracking-widest uppercase">7 Days</span>
            </div>
          </div>

          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--glass-bg)', 
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }} 
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="rom" stroke="#818cf8" fillOpacity={1} fill="url(#colorRom)" strokeWidth={3} name="Range of Motion (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Prescription Exercises */}
      <div className="space-y-6 pt-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Assigned Routines</h3>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Click Start to initiate your tracking session</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedExercises.map((ex) => (
            <div key={ex.id} className="glass-card p-6 rounded-[24px] flex flex-col justify-between h-[210px] sm:h-[190px] group cursor-pointer hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
                      <ex.icon className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-[15px] text-[var(--text-primary)]">{ex.name}</span>
                  </div>
                  <span className="text-[9px] px-2.5 py-1 rounded-full bg-slate-500/10 text-[var(--text-secondary)] uppercase font-bold tracking-widest border border-white/5">
                    {ex.difficulty}
                  </span>
                </div>
                <div className="mt-5 space-y-1.5">
                  <div className="text-xs text-[var(--text-primary)] font-semibold flex justify-between">
                    <span className="text-[var(--text-secondary)]">Target</span>
                    {ex.target}
                  </div>
                  <div className="text-xs text-[var(--text-primary)] font-semibold flex justify-between">
                    <span className="text-[var(--text-secondary)]">Volume</span>
                    {ex.reps}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-[var(--border-color)] mt-2">
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">Prescribed by {ex.clinician}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWorkout(ex.id);
                  }}
                  className="w-full sm:w-10 h-10 rounded-xl sm:rounded-full bg-brand-500 text-white flex items-center justify-center hover:scale-105 sm:hover:scale-110 hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer gap-2 font-bold text-xs"
                  aria-label="Start Workout"
                >
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                  <span className="sm:hidden">Start Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
