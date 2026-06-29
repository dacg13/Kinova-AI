import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const Reports: React.FC = () => {
  const { showNotification } = useNotifications();

  const handleDownload = (name: string) => {
    showNotification(`Downloading ${name} Report as PDF...`, 'success');
  };

  const reportsList = [
    {
      name: 'Weekly Recovery Summary',
      desc: 'Summary of joint angle increments, pain ratings, and daily completions.',
      date: 'June 28, 2026',
      size: '240 KB'
    },
    {
      name: 'Clinical Orthopedic Report',
      desc: 'Rigorous detail logging joint range of motion (ROM) progress and compensatory alignment mistakes for therapist reviews.',
      date: 'June 20, 2026',
      size: '1.2 MB'
    },
    {
      name: 'Insurance Compliance Sheet',
      desc: 'Compliance calendar logs verifying exercise completion for insurance coverage.',
      date: 'June 15, 2026',
      size: '180 KB'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Clinical Reports Export</h1>
        <p className="text-xs text-[var(--text-secondary)]">Download formatted PDF/CSV logs for therapists, insurance review committees, or records.</p>
      </div>

      {/* Reports deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportsList.map((rep, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between h-[210px]">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] text-[var(--text-secondary)] font-bold">{rep.size}</span>
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-[var(--text-primary)]">{rep.name}</h3>
                <p className="text-[10px] text-[var(--text-secondary)] pt-1.5 leading-relaxed font-semibold">{rep.desc}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)] mt-2">
              <span className="text-[9px] text-[var(--text-secondary)] font-bold">Created: {rep.date}</span>
              <button 
                onClick={() => handleDownload(rep.name)}
                className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer"
                aria-label="Download report"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical document preview sheet */}
      <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)] space-y-4 bg-slate-900/10 max-w-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Active Document Preview</h3>
            <span className="text-[10px] text-brand-500 font-bold block pt-0.5">Kinova AI Orthopedic Summary</span>
          </div>
          <button 
            onClick={() => showNotification('Opening print dialog...', 'info')}
            className="p-2 hover:bg-slate-500/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>

        {/* Paper replica layout */}
        <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[10px] text-[var(--text-secondary)] space-y-4 font-semibold leading-relaxed">
          <div className="flex justify-between border-b border-[var(--border-color)] pb-2 text-[var(--text-primary)]">
            <div>
              <div className="font-black">Patient: Dhruv Patel</div>
              <div>Diagnosis: Left Shoulder Abduction Cuff Strain</div>
            </div>
            <div className="text-right">
              <div>Clinician: Robert, DPT</div>
              <div>Report Date: June 29, 2026</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-[var(--text-primary)]">Skeletal Joint Mobility ROM Index:</div>
            <div>Peak Shoulder Flexion Angle achieved: **132°** (Target: 130°)</div>
            <div>Baseline mobility comparison: **+11.8%** improvement registered over 14 days.</div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-[var(--text-primary)]">Form Compliance & Pacing:</div>
            <div>Overall adherence rate: **94.2%** compliance on prescribed schedule.</div>
            <div>Compensative mistake triggers: 2 alerts registered for trapezius shrugging.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
