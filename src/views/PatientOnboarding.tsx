import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check
} from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePose } from '@/context/PoseContext';
import { useNotifications } from '@/context/NotificationContext';

export const PatientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const { showNotification } = useNotifications();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('178');
  const [weight, setWeight] = useState('74');
  const [diagnosis, setDiagnosis] = useState('Left Shoulder Rotator Cuff Tendonitis');
  const [painLevel, setPainLevel] = useState(5);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    stream,
    startCamera,
    stopCamera,
  } = useCamera();

  const {
    landmarks,
    setVideoElement,
    setStreamActive,
    isModelLoaded,
  } = usePose();

  useEffect(() => {
    setVideoElement(videoRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setVideoElement]);

  useEffect(() => {
    setStreamActive(!!stream);
  }, [stream, setStreamActive]);

  // Handle step updates
  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      // Trigger camera startup
      try {
        await startCamera();
      } catch (err) {
        console.error('Camera onboarding startup failed', err);
      }
    } else if (step === 3) {
      stopCamera();
      completeOnboarding();
      showNotification('Kinova AI Patient Onboarding completed! Welcome to your Dashboard.', 'success');
      navigate('/patient/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 3) {
        stopCamera();
      }
    }
  };

  // Check joint tracking confidence indicators
  const isTrackingBody = landmarks && landmarks.length >= 33;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-center items-center p-6 relative font-sans transition-colors duration-300">
      
      {/* Container Cards */}
      <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Progress Tracker Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">
          <span>Patient Setup Calibrator</span>
          <span>Step {step} of 3</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Clinical Demographics */}
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-xs font-semibold leading-normal"
            >
              <div className="space-y-1">
                <h2 className="text-base font-black text-[var(--text-primary)]">Clinical Profile Details</h2>
                <p className="text-[11px] text-[var(--text-secondary)]">Log metrics to calibrate joint weight thresholds</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Age (Years)</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Biological Gender</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Height (cm)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Primary Diagnosis</label>
                <input 
                  type="text" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Subjective Pain levels */}
          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-xs font-semibold leading-normal"
            >
              <div className="space-y-1">
                <h2 className="text-base font-black text-[var(--text-primary)]">Pain Index Check</h2>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">Log active joint strain indexes to calibrate safety limits</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-extrabold text-[var(--text-primary)]">
                  <span>Current Pain Level</span>
                  <span className="text-brand-500">{painLevel} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={painLevel}
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-secondary)] uppercase font-bold pt-1">
                  <span>No Pain (0)</span>
                  <span>Moderate (5)</span>
                  <span>Severe (10)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-brand-500/10 bg-brand-500/5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                <strong>Anatomical Guard Note:</strong> Exercises will trigger warning audio prompts if your posture shows compensative adjustments exceeding prescribed safety thresholds.
              </div>
            </motion.div>
          )}

          {/* Step 3: Bounding Box Pose Calibration */}
          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-xs font-semibold leading-normal"
            >
              <div className="space-y-1">
                <h2 className="text-base font-black text-[var(--text-primary)]">Camera & Bounding Calibration</h2>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">Verify camera alignment and skeletal landmark tracking</p>
              </div>

              {/* Webcam Viewport */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-[var(--border-color)] flex items-center justify-center">
                <video 
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Calibration Status overlay overlay */}
                <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="absolute inset-6 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                    {!isTrackingBody ? (
                      <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">Stand in the box to calibrate</span>
                    ) : (
                      <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                        <Check className="h-4 w-4 bg-emerald-500 text-white rounded-full p-0.5" />
                        Calibration Success
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-center font-bold">
                <div className={`p-3.5 rounded-xl border ${isModelLoaded ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-slate-500/5 border-slate-500/10 text-[var(--text-secondary)]'}`}>
                  Pose Model Active
                </div>
                <div className={`p-3.5 rounded-xl border ${isTrackingBody ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-slate-500/5 border-slate-500/10 text-[var(--text-secondary)]'}`}>
                  Landmarks Confirmed
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons Controls */}
        <div className="flex justify-between pt-4 border-t border-[var(--border-color)]">
          <button 
            disabled={step === 1}
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] hover:bg-slate-500/5 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          <button 
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-500/10"
          >
            {step === 3 ? 'Complete Setup' : 'Next Stage'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
