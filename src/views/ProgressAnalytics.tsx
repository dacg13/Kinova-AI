import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Calendar, Heart } from 'lucide-react';

export const ProgressAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const weeklyData = [
    { name: 'Mon', rom: 82, pain: 6, adherence: 100 },
    { name: 'Tue', rom: 85, pain: 6, adherence: 50 },
    { name: 'Wed', rom: 90, pain: 5, adherence: 100 },
    { name: 'Thu', rom: 92, pain: 4, adherence: 100 },
    { name: 'Fri', rom: 98, pain: 3, adherence: 100 },
    { name: 'Sat', rom: 105, pain: 3, adherence: 0 },
    { name: 'Sun', rom: 110, pain: 2, adherence: 100 },
  ];

  const monthlyData = [
    { name: 'Week 1', rom: 80, pain: 7, adherence: 80 },
    { name: 'Week 2', rom: 92, pain: 5, adherence: 90 },
    { name: 'Week 3', rom: 104, pain: 3, adherence: 100 },
    { name: 'Week 4', rom: 115, pain: 2, adherence: 95 },
  ];

  const currentData = timeframe === 'week' ? weeklyData : monthlyData;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Progress & Clinical Analytics</h1>
          <p className="text-xs text-[var(--text-secondary)]">Historical analysis of range of motion, pain logs, and adherence metrics.</p>
        </div>
        
        {/* Timeframe Switcher Switcher */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <button 
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${timeframe === 'week' ? 'bg-brand-500 text-white shadow' : 'text-[var(--text-secondary)]'}`}
          >
            Weekly View
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${timeframe === 'month' ? 'bg-brand-500 text-white shadow' : 'text-[var(--text-secondary)]'}`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Peak Range of Motion</span>
          <div className="text-3xl font-extrabold text-brand-500 pt-1">112°</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1.5 font-semibold">Left Shoulder Abduction (+22° from baseline)</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Adherence Accuracy</span>
          <div className="text-3xl font-extrabold text-emerald-500 pt-1">94%</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1.5 font-semibold">Evaluated from 14 physical therapy sessions</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Pain Regression Index</span>
          <div className="text-3xl font-extrabold text-brand-500 pt-1">-66%</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1.5 font-semibold">Pain index fell from 6 (moderate) to 2 (mild)</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROM Trend */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Range of Motion Progression (ROM)
          </h3>
          <div className="h-[230px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="rom" stroke="#10b981" fillOpacity={0.1} fill="#10b981" strokeWidth={2.5} name="ROM (Degrees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pain Trend */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-brand-500" />
            Subjective Pain Index Trend
          </h3>
          <div className="h-[230px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="pain" stroke="#d946ef" strokeWidth={2.5} activeDot={{ r: 6 }} name="Pain level (0-10)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Compliance Bar Chart */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-brand-500" />
          Routines Compliance Rates
        </h3>
        <div className="h-[180px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px' }} />
              <Bar dataKey="adherence" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} barSize={28} name="Session Compliance (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
