import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Calendar, 
  Award, 
  Play, 
  ChevronRight, 
  Sparkles, 
  CheckCircle,
  MessageSquareDot
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { motion } from 'framer-motion';
import { CardSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/Skeleton';

const mockChartData = [
  { day: 'Mon', rom: 65, target: 90 },
  { day: 'Tue', rom: 72, target: 90 },
  { day: 'Wed', rom: 78, target: 90 },
  { day: 'Thu', rom: 75, target: 90 },
  { day: 'Fri', rom: 84, target: 90 },
  { day: 'Sat', rom: 88, target: 90 },
  { day: 'Sun', rom: 92, target: 90 },
];

const mockRecentLogs = [
  {
    id: 's-103',
    date: 'Today, 10:15 AM',
    exercise: 'Shoulder Abduction',
    reps: '15 / 15 reps',
    accuracy: 94,
    rom: '92° (Target 90°)',
    status: 'success',
    geminiSummary: 'Fantastic progress today! Your left shoulder abduction showed a smooth extension curve with a peak range of motion of 92°, beating your target. Minor shoulder elevation was noted during reps 11 and 12, likely due to fatigue. Focus on keeping your neck relaxed during tomorrow\'s set.'
  },
  {
    id: 's-102',
    date: 'Yesterday, 4:30 PM',
    exercise: 'Shoulder Abduction',
    reps: '12 / 15 reps',
    accuracy: 82,
    rom: '88° (Target 90°)',
    status: 'warning',
    geminiSummary: 'Good performance overall. You completed 12 correct reps before reaching fatigue. Joint angles were steady, but we detected minor compensatory torso leaning towards the left side in the final few movements. Try sitting upright or performing the set slower next time.'
  },
  {
    id: 's-101',
    date: 'June 26, 2026',
    exercise: 'Rotator Cuff Stretch',
    reps: '10 / 10 reps',
    accuracy: 100,
    rom: '45° (Target 45°)',
    status: 'success',
    geminiSummary: 'Perfect compliance! Angles matched the prescriptive curve exactly. Stretches were held for the target 5-second increments without compensation. Keep up this pacing.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
};

export const Dashboard: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  const toggleLogDetails = (id: string) => {
    setSelectedLog((prev) => (prev === id ? null : id));
  };

  const statCards = [
    {
      title: 'Session Compliance',
      value: '93.5%',
      sub: '+2.4% vs last week',
      icon: Calendar,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Current Streak',
      value: '5 Days',
      sub: 'Personal record: 12 days',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Mean Flex ROM',
      value: '92.4°',
      sub: 'Goal: 90° reached!',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Recovery Level',
      value: 'Tier 2',
      sub: '920 pts • 80 XP to Tier 3',
      icon: Award,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse bg-slate-300 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <CardSkeleton />
        </div>
        <ListSkeleton rows={3} />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-950 via-brand-800 to-brand-700 text-white p-6 md:p-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/30 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            AI Recovery Coach Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Keep up the momentum, Sarah!
          </h1>
          <p className="text-sm md:text-base text-brand-100 font-semibold leading-relaxed">
            You completed today's Shoulder Abduction target with an outstanding <span className="font-extrabold text-white">94% accuracy score</span>. Let's maintain this posture tomorrow.
          </p>
          <div className="pt-4 flex gap-3">
            <a 
              href="/workout"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-950 font-bold text-xs hover:bg-brand-50 transition-colors shadow-lg shadow-black/10 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Workout Arena
            </a>
          </div>
        </div>
      </motion.div>

      {/* Grid Stats */}
      <motion.div 
        variants={itemVariants}
        className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 shrink-0 w-[280px] snap-center md:shrink md:w-auto h-[150px] md:h-auto"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)]">{card.title}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">{card.value}</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold">{card.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recovery Line Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Range of Motion (ROM) Trend</h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Left Shoulder Abduction Peak vs Target Goal</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                <span className="text-[var(--text-secondary)]">Your ROM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-[var(--text-secondary)]">Target (90°)</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <YAxis domain={[50, 100]} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--border-color)', 
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="rom" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRom)" />
                <Area type="monotone" dataKey="target" stroke="var(--border-color)" strokeWidth={1} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Compliance Heatmap Calendar */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Compliance Calendar</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Assigned task adherence profile</p>
          </div>

          <div className="grid grid-cols-7 gap-2.5 pt-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <span key={idx} className="text-center text-xs font-bold text-[var(--text-secondary)] mb-1">
                {day}
              </span>
            ))}
            
            {/* Week 1 (Past) */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`w1-${i}`} className="aspect-square rounded-lg flex items-center justify-center bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
              </div>
            ))}
            
            {/* Week 2 (Current) */}
            <div className="aspect-square rounded-lg flex items-center justify-center bg-emerald-500 text-white font-bold text-xs">15</div>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-emerald-500 text-white font-bold text-xs">16</div>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-emerald-500 text-white font-bold text-xs">17</div>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-amber-500 text-white font-bold text-xs">18</div>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-emerald-500 text-white font-bold text-xs">19</div>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-emerald-500 text-white font-bold text-xs">20</div>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-brand-500 text-white font-bold text-xs ring-4 ring-brand-500/30 animate-pulse">21</div>
          </div>
          
          <div className="pt-2 space-y-2 text-xs font-semibold text-[var(--text-secondary)]">
            <div className="flex items-center justify-between text-[11px] border-t border-[var(--border-color)] pt-3">
              <span>Weekly Prescriptions Assigned</span>
              <span className="font-bold text-[var(--text-primary)]">6 Routines</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Completed Adhered Sessions</span>
              <span className="font-bold text-emerald-500">5 Sessions</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Missed / Flagged Sessions</span>
              <span className="font-bold text-amber-500">1 Session</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Session Logs */}
      <motion.div 
        variants={itemVariants}
        className="glass-card rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-base font-bold text-[var(--text-primary)]">Historical Session Registry</h2>
        <div className="divide-y divide-[var(--border-color)]">
          {mockRecentLogs.map((log) => (
            <div key={log.id} className="py-3.5 first:pt-0 last:pb-0">
              <div 
                onClick={() => toggleLogDetails(log.id)}
                className="flex items-center justify-between cursor-pointer hover:bg-black/2.5 dark:hover:bg-white/2.5 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{log.exercise}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">{log.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:grid grid-cols-3 gap-6 text-right text-xs">
                    <div>
                      <span className="text-[10px] block text-[var(--text-secondary)] font-medium">ROM Achieved</span>
                      <span className="font-bold text-[var(--text-primary)]">{log.rom.split(' ')[0]}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block text-[var(--text-secondary)] font-medium">Rep Count</span>
                      <span className="font-bold text-[var(--text-primary)]">{log.reps.split(' ')[0]}</span>
                    </div>
                    <div>
                      <span className="text-[10px] block text-[var(--text-secondary)] font-medium">Accuracy</span>
                      <span className={`font-bold ${log.status === 'success' ? 'text-emerald-500' : 'text-amber-500'}`}>{log.accuracy}%</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-[var(--text-secondary)] transition-transform ${selectedLog === log.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expandable Gemini Summary Panel */}
              {selectedLog === log.id && (
                <div className="mt-3 mx-2 p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-300">
                    <MessageSquareDot className="h-4 w-4" />
                    AI Coach Summary Notes
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
                    {log.geminiSummary}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
