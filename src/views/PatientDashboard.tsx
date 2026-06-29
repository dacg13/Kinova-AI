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
  CircleDot
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

export const PatientDashboard: React.FC = () => {
  const navigate = navigateTo();
  const { user } = useAuth();

  function navigateTo() {
    try {
      return useNavigate();
    } catch {
      return (path: string) => { window.location.href = path; };
    }
  }

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
      clinician: 'Robert (DPT)'
    },
    {
      id: 'shoulder_raise',
      name: 'Shoulder Abduction',
      target: '130° Arm Raise',
      reps: '12 Reps x 3 Sets',
      difficulty: 'Easy',
      clinician: 'Robert (DPT)'
    },
    {
      id: 'sit_to_stand',
      name: 'Sit-To-Stand Pacing',
      target: '180° Hip Extension',
      reps: '10 Reps x 2 Sets',
      difficulty: 'Easy',
      clinician: 'Robert (DPT)'
    }
  ];

  const handleStartWorkout = (id: string) => {
    // Store selected exercise in localStorage so WorkoutArena loads it dynamically
    localStorage.setItem('kinova_active_exercise', id);
    navigate('/patient/workout');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Welcome back, {username}!</h1>
          <p className="text-xs text-[var(--text-secondary)]">Here is your clinical recovery snapshot for today.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-350 text-[10px] uppercase font-bold tracking-wider">
          <CircleDot className="h-3.5 w-3.5 animate-pulse" />
          Active Recovery Protocol v2.4
        </div>
      </div>

      {/* Fitbit + Apple Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Recovery Score Card */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between h-[150px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Recovery Score</span>
            <Award className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">84</span>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">+2.4% this week</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Calculated from ROM, Form Accuracy, and adherence consistency</span>
        </div>

        {/* Daily Goals */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Daily Routine</span>
            <Calendar className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">2 / 3</span>
            <span className="text-xs text-[var(--text-secondary)] font-semibold">completed</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Targeting left shoulder flexion and quad strengthening</span>
        </div>

        {/* Active Streak */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Active Streak</span>
            <Flame className="h-4.5 w-4.5 text-orange-500 fill-current" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">5</span>
            <span className="text-xs text-orange-500 font-bold">days active</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Next milestone: 7-day adherence achievement badge</span>
        </div>

        {/* Pain Level index */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Subjective Pain</span>
            <AlertTriangle className="h-4.5 w-4.5 text-yellow-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">2</span>
            <span className="text-xs text-emerald-500 font-bold">-40% from baseline</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Calculated from daily pain logs and post-workout checks</span>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              Recovery & Pain Velocity
            </h3>
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Weekly Log</span>
          </div>

          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '11px' 
                  }} 
                />
                <Area type="monotone" dataKey="rom" stroke="#10b981" fillOpacity={1} fill="url(#colorRom)" strokeWidth={2} name="Range of Motion (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Feed */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-500 animate-pulse" />
              Kinova AI Insights
            </h3>

            <div className="space-y-3.5 text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
              <p>
                📈 <strong>ROM Progression:</strong> Your left shoulder abduction angle reached a peak of <strong>132°</strong> yesterday, yielding a 12% improvement over your baseline measurement of 118°.
              </p>
              <p>
                ⚖️ <strong>Alignment Symmetry:</strong> Shoulder height imbalance was within 4% during squats, indicating high spinal alignment symmetry.
              </p>
              <p>
                ⚠️ <strong>Pacing Check:</strong> You completed your squats at a pace of 3.8s per rep. Ensure you do not descend faster than 4 seconds to protect knee joints.
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/patient/coach')} 
            className="w-full py-2.5 rounded-xl border border-brand-500/20 text-brand-600 dark:text-brand-350 text-[11px] font-extrabold hover:bg-brand-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            Consult AI Recovery Coach
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Active Prescription Exercises */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Assigned Rehabilitation Routines</h3>
          <p className="text-[10px] text-[var(--text-secondary)]">Click Start to initiate tracking session</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assignedExercises.map((ex) => (
            <div key={ex.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between h-[160px]">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-[var(--text-primary)]">{ex.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-350 uppercase font-black tracking-wider">
                    {ex.difficulty}
                  </span>
                </div>
                <div className="text-[10px] text-brand-500 font-bold pt-2">{ex.target}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold pt-1">{ex.reps}</div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)] mt-2">
                <span className="text-[9px] text-[var(--text-secondary)]">Dr. {ex.clinician}</span>
                <button 
                  onClick={() => handleStartWorkout(ex.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Play className="h-3 w-3 fill-current" />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
