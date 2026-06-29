import React from 'react';
import { 
  Building, 
  Users, 
  Key, 
  Server
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminHub: React.FC = () => {
  const hospitalRegistry = [
    { name: 'Mayo Clinic', therapists: 18, patients: 124, license: 'Enterprise', status: 'Active' },
    { name: 'Johns Hopkins', therapists: 24, patients: 188, license: 'Enterprise', status: 'Active' },
    { name: 'MGH Boston', therapists: 12, patients: 84, license: 'Pro Suite', status: 'Pending renewal' }
  ];

  const apiMetrics = [
    { name: '08:00', load: 45 },
    { name: '10:00', load: 82 },
    { name: '12:00', load: 74 },
    { name: '14:00', load: 95 },
    { name: '16:00', load: 60 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">System Administrator Portal</h1>
        <p className="text-xs text-[var(--text-secondary)]">Manage clinical hospital licenses, audit therapist registrations, and monitor API telemetry.</p>
      </div>

      {/* KPI counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Hospitals count */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Connected Clinics</span>
            <Building className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] pt-1">32</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">Registered hospital sites</p>
        </div>

        {/* Users count */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Total Therapists</span>
            <Users className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] pt-1">144</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">Verified DPT professionals</p>
        </div>

        {/* Active Patients */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">Active Patients</span>
            <Users className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-brand-500 pt-1">1,024</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">Performing routines daily</p>
        </div>

        {/* License usage */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">License Health</span>
            <Key className="h-4.5 w-4.5 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-primary)] pt-1">98.4%</div>
          <p className="text-[10px] text-[var(--text-secondary)] pt-1">Compliance safety score</p>
        </div>

      </div>

      {/* Registry Lists and API metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hospital Registry list */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Clinics Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="py-2.5">Institution Name</th>
                  <th>Therapists</th>
                  <th>Patients</th>
                  <th>License Tier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {hospitalRegistry.map((h, idx) => (
                  <tr key={idx} className="text-[var(--text-primary)]">
                    <td className="py-3 font-bold">{h.name}</td>
                    <td>{h.therapists}</td>
                    <td>{h.patients}</td>
                    <td>{h.license}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        h.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Telemetry Load */}
        <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
            <Server className="h-4 w-4 text-brand-500" />
            API Server Telemetry Load
          </h3>
          
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiMetrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="load" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} barSize={20} name="Query Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
