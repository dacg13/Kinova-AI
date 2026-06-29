import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Smartphone, 
  TrendingUp, 
  ChevronDown, 
  Play, 
  Video
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const Landing: React.FC = () => {
  const navigate = navigateTo();
  const { showNotification } = useNotifications();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  function navigateTo() {
    try {
      return useNavigate();
    } catch {
      return (path: string) => { window.location.href = path; };
    }
  }

  const handleBookDemo = () => {
    showNotification('Demo request registered! Our clinical integration team will contact you within 24 hours.', 'success');
  };

  const faqItems = [
    {
      q: 'Do I need special cameras or sensors to run Kinova AI?',
      a: 'No. Kinova AI runs entirely client-side using any standard laptop, tablet, or smartphone webcam. No special depth sensors or markers are required.'
    },
    {
      q: 'Is the platform HIPAA compliant?',
      a: 'Yes. All computer vision mapping and coordinate calculations occur locally inside your browser. No raw video feed is ever uploaded to the cloud, ensuring patient privacy.'
    },
    {
      q: 'How does the AI identify movement errors?',
      a: 'Our kinematics math engine calculates joint angles at 30 FPS. The state machines evaluate movement pathways, detecting faults like knee collapse (valgus), shrugging, or poor depth relative to therapist prescriptions.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 overflow-x-hidden font-sans relative selection:bg-brand-500/30">
      
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-radial from-violet-600/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-radial from-emerald-500/5 to-transparent pointer-events-none z-0" />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070913]/60 border-b border-slate-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-400 to-brand-100 bg-clip-text text-transparent">
            Kinova AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="px-4 py-2 text-xs font-extrabold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth?signup=true')} 
            className="px-5 py-2.5 text-xs font-black rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-lg shadow-brand-500/20 cursor-pointer"
          >
            Start Recovery
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-[10px] uppercase tracking-widest font-black text-brand-300 backdrop-blur-md"
        >
          <Brain className="h-3.5 w-3.5" />
          AI-Powered Rehabilitation Intelligence
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
        >
          Recover Smarter.<br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
            Move Better.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Kinova AI uses computer vision, real-time pose estimation, and explainable AI to help patients perform physical therapy safely at home while providing therapists with clinical recovery insights.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <button 
            onClick={() => navigate('/auth?signup=true')} 
            className="px-7 py-3.5 text-xs font-black rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-xl shadow-brand-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Recovery Flow
          </button>
          <button 
            onClick={handleBookDemo} 
            className="px-7 py-3.5 text-xs font-black rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Book Clinical Demo
          </button>
        </motion.div>
      </section>

      {/* Core Highlights Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 z-10 relative">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-white">Full-Spectrum Vision Coaching</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Built to optimize physical therapy accuracy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Edge Computer Vision</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Tracks 33 skeletal coordinates locally at 30 FPS. Captures movements in real-time without uploading sensitive video feeds to cloud databases.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Real-Time Vocal Feedback</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Generates natural spoken coaching cues to adjust alignment mid-rep (e.g., "Keep your neck straight"), throttled to prevent verbal spam.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Clinical Telemetry Logs</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Compiles reps accuracy scores, joint flexion range (ROM), consistency variances, and registers them directly in therapist portals.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 z-10 relative">
        <h2 className="text-xl sm:text-2xl font-black text-center text-white mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="border border-slate-800/60 rounded-2xl bg-slate-900/35 overflow-hidden">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white cursor-pointer select-none"
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <p className="px-6 pb-4 text-[11px] text-slate-400 leading-relaxed font-semibold">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Footer */}
      <footer className="border-t border-slate-850 bg-[#04060d]/80 py-12 px-6 text-center z-10 relative">
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-lg font-black text-white">Start Your Rehabilitation Journey Today</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Begin custom, precision-monitored exercises with visual feedback, fully connected with your therapist.
          </p>
          <button 
            onClick={() => navigate('/auth?signup=true')} 
            className="w-full py-3 text-xs font-black rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-lg shadow-brand-500/20 cursor-pointer"
          >
            Create Your Active Account
          </button>
        </div>
        <div className="pt-10 text-[10px] text-slate-500 font-semibold">
          &copy; {new Date().getFullYear()} Kinova AI. AI-Powered Rehabilitation Intelligence Platform.
        </div>
      </footer>
    </div>
  );
};
