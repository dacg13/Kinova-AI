import React from 'react';
import { ShieldCheck, Heart, AlertTriangle, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const CaregiverHub: React.FC = () => {
  const { user } = useAuth();
  console.log('Active caregiver profile logs for:', user?.name);

  const patientLogs = {
    name: 'Dhruv Patel (Patient)',
    relationship: 'Care Recipient / Son',
    recoveryScore: 84,
    complianceRate: 94,
    lastActive: 'Today, 14:32',
    missedSessions: 0,
    alerts: [
      { id: 1, type: 'info', text: 'Weekly clinical progression summary generated successfully.' },
      { id: 2, type: 'warning', text: 'Dhruv exceeded target pacing speed during squats set 2.' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Caregiver Support Desk</h1>
        <p className="text-xs text-[var(--text-secondary)]">Monitor rehabilitation progression logs, active alerts, and calendars for your care recipient.</p>
      </div>

      {/* Patient info details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recovery status card */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Recipient Recovery</span>
            <Heart className="h-4.5 w-4.5 text-brand-500 fill-current" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] pt-1">{patientLogs.recoveryScore}%</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">{patientLogs.name} ({patientLogs.relationship})</p>
        </div>

        {/* Adherence rates */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Weekly Adherence</span>
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-500 pt-1">{patientLogs.complianceRate}%</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">Active sessions completed vs assigned</p>
        </div>

        {/* Alerts count */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Clinical Warnings</span>
            <AlertTriangle className="h-4.5 w-4.5 text-yellow-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] pt-1">{patientLogs.alerts.length}</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">Recent posture/safety anomalies registered</p>
        </div>

      </div>

      {/* Roster logs & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts logs */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Active System Logs</h3>
          <div className="space-y-3">
            {patientLogs.alerts.map((al) => (
              <div 
                key={al.id} 
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs font-semibold ${
                  al.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/10 text-[var(--text-primary)]' : 'bg-brand-500/5 border-brand-500/10 text-[var(--text-primary)]'
                }`}
              >
                {al.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" /> : <ShieldCheck className="h-4 w-4 text-brand-500 shrink-0" />}
                <p className="leading-relaxed">{al.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact therapist */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Consult Clinician</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
            Directly communicate with Dhruv's physical therapist, **Dr. Robert (DPT)**, regarding targets adjustments.
          </p>
          <button className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            <MessageCircle className="h-4 w-4" />
            Send Secure Message
          </button>
        </div>

      </div>
    </div>
  );
};
