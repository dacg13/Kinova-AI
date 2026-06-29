import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
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
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-card">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[var(--text-primary)]">
            Active Protocol v2.4
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Recovery Score Card */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group">
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
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group">
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
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group">
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
        <div className="glass-card rounded-[24px] p-6 flex flex-col justify-between h-[180px] relative overflow-hidden group">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 glass-card rounded-[24px] p-7 space-y-6 flex flex-col">
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
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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

        {/* AI Insight Feed */}
        <div className="glass-card rounded-[24px] p-7 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="space-y-6 relative z-10">
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              Kinova AI Insights
            </h3>

            <div className="space-y-4 text-[13px] text-[var(--text-secondary)] font-medium">
              <div className="flex gap-3">
                <div className="mt-0.5 text-brand-400 text-lg">📈</div>
                <p><strong className="text-[var(--text-primary)]">ROM Progression:</strong> Left shoulder abduction reached <strong>132°</strong> yesterday, a 12% improvement.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 text-emerald-400 text-lg">⚖️</div>
                <p><strong className="text-[var(--text-primary)]">Alignment Symmetry:</strong> Shoulder imbalance was within 4% during squats, showing high symmetry.</p>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 text-orange-400 text-lg">⚠️</div>
                <p><strong className="text-[var(--text-primary)]">Pacing Check:</strong> Squats performed at 3.8s per rep. Ensure you do not descend faster than 4s.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/patient/coach')} 
            className="w-full mt-8 py-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all flex items-center justify-center gap-2 shadow-sm relative z-10 group/btn cursor-pointer"
          >
            Consult AI Recovery Coach
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Active Prescription Exercises */}
      <div className="space-y-6 pt-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Assigned Routines</h3>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Click Start to initiate your tracking session</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assignedExercises.map((ex) => (
            <div key={ex.id} className="glass-card p-6 rounded-[24px] flex flex-col justify-between h-[190px] group cursor-pointer hover:-translate-y-1 transition-all duration-300">
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

              <div className="flex justify-between items-center pt-4 mt-2">
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">Prescribed by {ex.clinician}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWorkout(ex.id);
                  }}
                  className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center hover:scale-110 hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
                  aria-label="Start Workout"
                >
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
