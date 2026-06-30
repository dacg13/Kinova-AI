import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Smartphone, 
  TrendingUp, 
  ChevronDown, 
  Play, 
  Video,
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { ShaderGradient, ShaderGradientCanvas } from 'shadergradient';

const fadeUp = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
};

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  const features = [
    {
      icon: Video,
      title: 'Edge Computer Vision',
      desc: 'Tracks 33 skeletal coordinates locally at 30 FPS. No sensitive video data is ever uploaded.',
      gradient: 'from-brand-500/20 to-brand-600/5',
      iconColor: 'text-brand-400',
    },
    {
      icon: Smartphone,
      title: 'Real-Time Vocal Feedback',
      desc: 'AI-generated spoken coaching cues adjust your form mid-rep with throttled, clear guidance.',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
    },
    {
      icon: TrendingUp,
      title: 'Clinical Telemetry Logs',
      desc: 'Compiles reps, ROM, accuracy, and consistency — all registered directly in therapist portals.',
      gradient: 'from-violet-500/20 to-violet-600/5',
      iconColor: 'text-violet-400',
    },
  ];

  const stats = [
    { value: '33', label: 'Body Landmarks', sub: 'per frame' },
    { value: '30', label: 'Frames/Second', sub: 'real-time' },
    { value: '6', label: 'Fault Types', sub: 'detected' },
    { value: '0', label: 'Servers', sub: 'required' },
  ];

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 overflow-x-hidden font-sans relative selection:bg-brand-500/30">
      
      {/* Ambient ShaderGradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <ShaderGradientCanvas
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <ShaderGradient
            {...({
              animate: "on",
              axesHelper: "off",
              bgColor1: "#000000",
              bgColor2: "#000000",
              brightness: 1,
              cAzimuthAngle: 180,
              cDistance: 2.8,
              cPolarAngle: 80,
              cameraZoom: 9.1,
              color1: "#606080",
              color2: "#8d7dca",
              color3: "#212121",
              destination: "onCanvas",
              embedMode: "off",
              envPreset: "city",
              format: "gif",
              fov: 45,
              frameRate: 10,
              gizmoHelper: "hide",
              grain: "on",
              lightType: "3d",
              pixelDensity: 1,
              positionX: 0,
              positionY: 0,
              positionZ: 0,
              range: "disabled",
              rangeEnd: 40,
              rangeStart: 0,
              reflection: 0.1,
              rotationX: 50,
              rotationY: 0,
              rotationZ: -60,
              shader: "defaults",
              type: "waterPlane",
              uAmplitude: 0,
              uDensity: 1.5,
              uFrequency: 0,
              uSpeed: 0.3,
              uStrength: 1.5,
              uTime: 8,
              wireframe: false,
            } as any)}
          />
        </ShaderGradientCanvas>
      </div>      {/* Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#08090D]/70 border-b border-white/6 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 border border-white/10">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[17px] tracking-tight text-white">
              Kinova AI
            </span>
            <span className="text-[8px] uppercase font-bold tracking-[0.25em] text-slate-500 hidden sm:block">
              Rehabilitation Intelligence
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth?signup=true')} 
            className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white transition-all shadow-lg shadow-brand-500/25 cursor-pointer hover:shadow-brand-500/40 hover:-translate-y-0.5"
          >
            Start
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-10 sm:pt-20 pb-16 sm:pb-20 text-center z-10">
        
        {/* Animated Hero Video Showcase */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8 }}
          className="flex justify-center items-center w-full max-w-4xl mx-auto mb-12 overflow-hidden rounded-[24px] border border-white/8 bg-black/40 shadow-2xl backdrop-blur-md relative group hover:border-white/12 transition-all duration-300 h-[220px] sm:h-[360px] md:h-[480px]"
        >
          <video
            src="/landing.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.h1 
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-[clamp(2rem,6vw,4.5rem)] font-black tracking-[-0.04em] leading-[1.1] mb-8"
        >
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent animate-in fade-in duration-500">
            Recover Smarter.
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-brand-300 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(99,102,241,0.25)]">
            Move Better.
          </span>
        </motion.h1>

        <motion.p 
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold mb-10"
        >
          Computer vision and real-time pose estimation to guide physical therapy at home — while giving therapists the clinical recovery insights they need.
        </motion.p>

        <motion.div 
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 max-w-xs sm:max-w-none mx-auto w-full"
        >
          <button 
            onClick={() => navigate('/auth?signup=true')} 
            className="px-8 py-3.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white transition-all shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2.5 cursor-pointer group hover:-translate-y-0.5 hover:shadow-brand-500/50"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Recovery Flow
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleBookDemo} 
            className="px-8 py-3.5 text-sm font-bold rounded-2xl bg-white/5 border border-white/8 text-slate-200 hover:text-white hover:bg-white/8 hover:border-white/15 transition-all cursor-pointer flex justify-center items-center"
          >
            Book Clinical Demo
          </button>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-[24px] bg-white/3 border border-white/6 backdrop-blur-md">
              <div className="text-4xl font-black text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              <div className="text-[10px] text-slate-600 font-medium mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-8 py-20 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/6 text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">
            <Sparkles className="h-3 w-3 text-brand-400" />
            Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Full-Spectrum Vision Coaching</h2>
          <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">Built to optimize physical therapy accuracy and compliance</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-8 rounded-[24px] border border-white/6 bg-gradient-to-br ${feature.gradient} backdrop-blur-md space-y-5 group hover:border-white/12 hover:-translate-y-1 transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/5 ${feature.iconColor} flex items-center justify-center border border-white/8 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust/Security Section */}
      <section className="max-w-5xl mx-auto px-8 py-16 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[24px] border border-white/6 bg-gradient-to-br from-white/3 to-transparent p-10 flex flex-col md:flex-row items-center gap-8 backdrop-blur-md"
        >
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Privacy-First Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xl">
              All pose detection runs entirely in your browser using WebAssembly. Zero video data leaves your device. Zero external servers. HIPAA-compliant by design.
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">WASM</div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">On-Device</div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-8 py-20 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-12"
        >
          <h2 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500 font-medium">Everything you need to know about the platform</p>
        </motion.div>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="border border-white/6 rounded-[20px] bg-white/3 overflow-hidden backdrop-blur-md hover:border-white/10 transition-all"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-7 py-5 text-left flex items-center justify-between text-sm font-bold text-slate-200 hover:text-white cursor-pointer select-none transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="px-7 pb-6 text-sm text-slate-400 leading-relaxed font-medium">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-white/6 bg-[#05060a]/80 backdrop-blur-xl py-20 px-8 text-center z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto space-y-6"
        >
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Zap className="h-6 w-6 text-brand-400" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Start Your Rehabilitation Journey</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Begin precision-monitored exercises with AI feedback, fully connected with your therapist.
          </p>
          <button 
            onClick={() => navigate('/auth?signup=true')} 
            className="w-full max-w-sm mx-auto py-4 text-sm font-bold rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white transition-all shadow-lg shadow-brand-500/25 cursor-pointer flex items-center justify-center gap-2 group hover:-translate-y-0.5 hover:shadow-brand-500/40"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
        <div className="pt-16 text-[10px] text-slate-700 font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Kinova AI · AI-Powered Rehabilitation Intelligence
        </div>
      </footer>
    </div>
  );
};
