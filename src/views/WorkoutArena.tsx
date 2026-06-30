import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, AlertTriangle, CheckCircle, RefreshCw, Activity, Award, Clock, Flame, ShieldAlert, Heart, X } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { CameraPreview } from '@/components/workout/CameraPreview';
import { PoseProvider, usePose } from '@/context/PoseContext';
import { PoseRenderer } from '@/components/workout/PoseRenderer';
import {
  calculateKneeAngle,
  calculateHipAngle,
  calculateShoulderAngle,
  calculateElbowAngle,
  calculateAnkleAngle,
  calculateTorsoLean,
  calculateNeckAngle,
} from '@/utils/kinematics';
import {
  createInitialSessionState,
  evaluateFrame,
} from '@/utils/rehabEngine';
import type {
  RehabSessionState,
  AssessmentResult,
} from '@/utils/rehabEngine';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';
import { calculateRecoveryAssessment } from '@/utils/recoveryIntelligence';
import type {
  RepetitionLog,
  RecoveryAssessment,
} from '@/utils/recoveryIntelligence';

const WorkoutArenaContent: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [exercise, setExercise] = useState<'squat' | 'shoulder_raise' | 'sit_to_stand'>('shoulder_raise');
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [finalAssessment, setFinalAssessment] = useState<RecoveryAssessment | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Persistent tracking variables
  const sessionStateRef = useRef<RehabSessionState>(createInitialSessionState('DOWN'));
  const repLogsRef = useRef<RepetitionLog[]>([]);
  const sessionStartTimeRef = useRef<number>(0);

  const {
    stream,
    devices,
    activeDeviceId,
    isLoading,
    error,
    permissionStatus,
    isMirrored,
    startCamera,
    stopCamera,
    switchCamera,
    toggleMirror,
  } = useCamera();

  const {
    landmarks,
    setVideoElement,
    setStreamActive,
    isModelLoaded,
  } = usePose();

  const { speak, cancelSpeech } = useVoiceFeedback();

  // Reset FSM on exercise change
  useEffect(() => {
    const initialStateMap = {
      squat: 'STANDING',
      shoulder_raise: 'DOWN',
      sit_to_stand: 'SITTING',
    };
    sessionStateRef.current = createInitialSessionState(initialStateMap[exercise]);
    setAssessment(null);
    setFinalAssessment(null);
  }, [exercise]);

  // Bind video element to PoseContext
  useEffect(() => {
    setVideoElement(videoRef.current);
  }, [videoRef, setVideoElement]);

  // Bind camera active state to PoseContext
  useEffect(() => {
    setStreamActive(!!stream);
  }, [stream, setStreamActive]);

  // Frame Assessment and Speech Feedback Loop
  useEffect(() => {
    if (!landmarks || !isSessionActive) {
      if (isSessionActive && !stream) {
        setIsSessionActive(false);
        setAssessment(null);
      }
      return;
    }

    const now = performance.now();
    const result = evaluateFrame(landmarks, exercise, sessionStateRef.current, now);
    setAssessment(result);

    // Live Voice Correction Feedback
    const hasActiveFault = Object.values(result.faults).some((val) => val === true);
    if (hasActiveFault) {
      speak(result.telemetry.correction, false); // Throttled non-urgent voice cues
    }

    // Repetition completion handler
    if (result.isRepCompleted) {
      const repDuration = now - sessionStateRef.current.phaseStartTime;
      const wasCorrect = !sessionStateRef.current.repHadError;

      // Log details
      const newLog: RepetitionLog = {
        id: result.repCount,
        durationMs: repDuration,
        peakRom: sessionStateRef.current.peakValue,
        faults: { ...sessionStateRef.current.activeFaults },
        isCorrect: wasCorrect,
      };
      repLogsRef.current.push(newLog);

      // Speak rep count & status (Urgent: cuts off posture cues)
      if (wasCorrect) {
        speak(`Repetition ${result.repCount} complete. Excellent form!`, true);
      } else {
        const mistakeText = sessionStateRef.current.activeFaults.poorDepth ? 'Try to reach full depth.' :
                            sessionStateRef.current.activeFaults.torsoLean ? 'Keep your chest upright.' :
                            sessionStateRef.current.activeFaults.kneeValgus ? 'Keep knees outward.' :
                            'Watch your alignment.';
        speak(`Repetition ${result.repCount} complete. ${mistakeText}`, true);
      }
    }

    // Stop session when count reaches target
    if (result.repCount >= 15) {
      handleCompleteSession();
    }
  }, [landmarks, isSessionActive, exercise, stream, speak]);

  // Live kinematics values for the telemetry table
  const lKnee = landmarks ? calculateKneeAngle(landmarks, 'left') : null;
  const rKnee = landmarks ? calculateKneeAngle(landmarks, 'right') : null;
  const lHip = landmarks ? calculateHipAngle(landmarks, 'left') : null;
  const rHip = landmarks ? calculateHipAngle(landmarks, 'right') : null;
  const lShoulder = landmarks ? calculateShoulderAngle(landmarks, 'left') : null;
  const rShoulder = landmarks ? calculateShoulderAngle(landmarks, 'right') : null;
  const lElbow = landmarks ? calculateElbowAngle(landmarks, 'left') : null;
  const rElbow = landmarks ? calculateElbowAngle(landmarks, 'right') : null;
  const lAnkle = landmarks ? calculateAnkleAngle(landmarks, 'left') : null;
  const rAnkle = landmarks ? calculateAnkleAngle(landmarks, 'right') : null;
  const torsoLean = landmarks ? calculateTorsoLean(landmarks) : null;
  const neckAngle = landmarks ? calculateNeckAngle(landmarks) : null;

  const handleStartSession = async () => {
    const initialStateMap = {
      squat: 'STANDING',
      shoulder_raise: 'DOWN',
      sit_to_stand: 'SITTING',
    };
    sessionStateRef.current = createInitialSessionState(initialStateMap[exercise]);
    repLogsRef.current = [];
    sessionStartTimeRef.current = performance.now();
    setAssessment(null);
    setFinalAssessment(null);
    setIsSessionActive(true);
    speak('Session started. Perform the exercise within camera view.', true);
    if (!stream) {
      await startCamera();
    }
  };

  const handleCompleteSession = () => {
    setIsSessionActive(false);
    cancelSpeech();

    const elapsed = performance.now() - sessionStartTimeRef.current;
    const finalReport = calculateRecoveryAssessment(
      repLogsRef.current,
      exercise,
      elapsed
    );
    setFinalAssessment(finalReport);
    speak(`Session finished. Overall recovery score is ${finalReport.recoveryScore} percent.`, true);
  };

  const handleStopSession = () => {
    handleCompleteSession();
  };

  const handleCloseSummary = () => {
    setFinalAssessment(null);
  };

  // Structured metrics getters
  const activeReps = assessment ? assessment.repCount : 0;
  const activeState = assessment ? assessment.activeState : sessionStateRef.current.activeState;
  const activeAccuracy = assessment ? assessment.accuracyScore : 100;
  
  const currentAngle = assessment ? assessment.telemetry.currentAngle : null;
  const idealAngle = assessment ? assessment.telemetry.idealAngle : null;
  const angleDiff = assessment ? assessment.telemetry.difference : 0;
  const feedbackText = assessment ? assessment.telemetry.correction : 'Start the session and position your full body in the webcam viewport.';
  const feedbackReason = assessment ? assessment.telemetry.reason : 'Verifying joint visibility...';

  const hasFault = assessment 
    ? Object.values(assessment.faults).some((val) => val === true)
    : false;

  return (
    <div className="space-y-6 relative">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">AI Workout Arena</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-[var(--text-secondary)]">Exercise tracking and postural biomechanics analytics</p>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-40"></span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isModelLoaded ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
              {isModelLoaded ? 'AI Active' : 'Loading Model...'}
            </span>
          </div>
        </div>
        
        {/* Dynamic Exercise selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Active Routine:</span>
          <select 
            disabled={isSessionActive}
            value={exercise} 
            onChange={(e) => setExercise(e.target.value as any)}
            aria-label="Select active rehabilitation exercise routine"
            className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:opacity-60"
          >
            <option value="shoulder_raise">Shoulder Abduction (Shoulder Raise)</option>
            <option value="squat">Squat Posture Drill</option>
            <option value="sit_to_stand">Sit-to-Stand Drills</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Sandbox Container */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <CameraPreview
            videoRef={videoRef}
            stream={stream}
            devices={devices}
            activeDeviceId={activeDeviceId}
            isLoading={isLoading}
            error={error}
            permissionStatus={permissionStatus}
            isMirrored={isMirrored}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            onSwitchCamera={switchCamera}
            onToggleMirror={toggleMirror}
          >
            <PoseRenderer isMirrored={isMirrored} />

            {/* Visual Calibration Box overlay */}
            {isSessionActive && (
              <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                <div className="absolute inset-8 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest font-extrabold">Calibration Bounding Box</span>
                </div>
              </div>
            )}
          </CameraPreview>

          {/* Action Trigger Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-4 glass-card rounded-2xl w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isSessionActive ? (
                <button
                  onClick={handleStartSession}
                  aria-label="Start workout session"
                  tabIndex={0}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 cursor-pointer w-full sm:w-auto"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Start Exercise Session
                </button>
              ) : (
                <button
                  onClick={handleStopSession}
                  aria-label="Stop active workout session"
                  tabIndex={0}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 cursor-pointer w-full sm:w-auto"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Stop Exercise
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-semibold text-[var(--text-secondary)] border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border-color)]">
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-4 w-4" />
                Vocal Biofeedback: On
              </span>
            </div>
          </div>
        </div>

        {/* Workout Right Side Analytics & Telemetry HUD */}
        <div className="space-y-4">
          {/* Rep Counter Ring Widget */}
          <div className="glass-card rounded-2xl p-5 space-y-4 text-center">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <span>Target reps</span>
              <span className="text-brand-500 font-extrabold bg-brand-500/10 px-2 py-0.5 rounded text-[10px]">
                FSM: {activeState}
              </span>
            </div>
            <div className="relative inline-flex items-center justify-center">
              {/* Progress Circle SVG */}
              <svg className="w-36 h-36 transform -rotate-90">
                <circle 
                  cx="72" 
                  cy="72" 
                  r="60" 
                  stroke="var(--border-color)" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="60" 
                  stroke="#8b5cf6" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - activeReps / 15)}
                  className="transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              {/* Core Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[var(--text-primary)]">{activeReps}</span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">of 15 reps</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 divide-x divide-[var(--border-color)] pt-2">
              <div>
                <span className="text-[10px] block text-[var(--text-secondary)] font-medium">Accuracy</span>
                <span className={`text-base font-extrabold ${activeAccuracy >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {activeAccuracy}%
                </span>
              </div>
              <div>
                <span className="text-[10px] block text-[var(--text-secondary)] font-medium">ROM Peak</span>
                <span className="text-base font-extrabold text-[var(--text-primary)]">
                  {assessment ? `${Math.round(sessionStateRef.current.peakValue)}°` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Explainable AI Angle Difference card */}
          {isSessionActive && currentAngle !== null && idealAngle !== null && (
            <div className="glass-card rounded-2xl p-4 space-y-3 bg-brand-500/5 border border-brand-500/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Kinematic Alignment Checker
              </h3>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold leading-snug">
                <div className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                  <span className="text-[9px] block text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Current</span>
                  <span className="text-sm font-black text-[var(--text-primary)]">{currentAngle}°</span>
                </div>
                <div className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                  <span className="text-[9px] block text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Target</span>
                  <span className="text-sm font-black text-brand-500">{idealAngle}°</span>
                </div>
                <div className={`p-2 border rounded-xl ${angleDiff > 15 ? 'bg-red-500/5 border-red-500/20 text-red-600' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'}`}>
                  <span className="text-[9px] block text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Difference</span>
                  <span className="text-sm font-black">{angleDiff}°</span>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Biofeedback Text Panel */}
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">AI Posture Feedback Cues</h3>
            <div 
              role="alert" 
              aria-live="polite" 
              className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed font-semibold transition-colors duration-300 ${
                hasFault ? 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400' :
                isSessionActive && landmarks ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                'bg-slate-500/5 border-slate-500/15 text-[var(--text-secondary)]'
              }`}
            >
              {hasFault ? (
                <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
              ) : isSessionActive && landmarks ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <RefreshCw className="h-5 w-5 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
              )}
              <div className="space-y-0.5">
                <p className="font-extrabold text-[var(--text-primary)]">{feedbackText}</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">{feedbackReason}</p>
              </div>
            </div>
          </div>

          {/* Target Angles Configuration Metrics Table */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]" id="telemetry-heading">Live Kinematic Telemetry</h3>
            <div className="space-y-2.5 text-xs font-semibold" role="region" aria-labelledby="telemetry-heading">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
                <span className="text-[var(--text-secondary)]">Neck Angle</span>
                <span className="font-bold text-[var(--text-primary)]">{neckAngle !== null ? `${neckAngle}°` : '--'}</span>
              </div>
              
              <div className={`flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 ${assessment?.faults.torsoLean ? 'text-red-500' : ''}`}>
                <span>Torso Forward Lean</span>
                <span className="font-bold">{torsoLean !== null ? `${torsoLean}°` : '--'}</span>
              </div>
              
              <div className={`flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 ${assessment?.faults.shoulderImbalance ? 'text-red-500' : ''}`}>
                <span>Shoulders (L / R)</span>
                <span className="font-bold">
                  {lShoulder !== null ? `${lShoulder}°` : '--'} / {rShoulder !== null ? `${rShoulder}°` : '--'}
                </span>
              </div>
              
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
                <span>Elbows (L / R)</span>
                <span className="font-bold">
                  {lElbow !== null ? `${lElbow}°` : '--'} / {rElbow !== null ? `${rElbow}°` : '--'}
                </span>
              </div>
              
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5">
                <span>Hips (L / R)</span>
                <span className="font-bold">
                  {lHip !== null ? `${lHip}°` : '--'} / {rHip !== null ? `${rHip}°` : '--'}
                </span>
              </div>
              
              <div className={`flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 ${assessment?.faults.kneeValgus ? 'text-red-500' : ''}`}>
                <span>Knees (L / R)</span>
                <span className="font-bold">
                  {lKnee !== null ? `${lKnee}°` : '--'} / {rKnee !== null ? `${rKnee}°` : '--'}
                </span>
              </div>
              
              <div className={`flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 ${assessment?.faults.heelLift ? 'text-red-500' : ''}`}>
                <span>Ankles (L / R)</span>
                <span className="font-bold">
                  {lAnkle !== null ? `${lAnkle}°` : '--'} / {rAnkle !== null ? `${rAnkle}°` : '--'}
                </span>
              </div>

              {/* Status Flag indicators summary */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-center leading-normal">
                <div className={`p-1.5 rounded-lg border ${assessment?.faults.poorDepth ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-slate-500/5 border-slate-500/10 text-[var(--text-secondary)]'}`}>
                  Poor Depth
                </div>
                <div className={`p-1.5 rounded-lg border ${assessment?.faults.incorrectTempo ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-slate-500/5 border-slate-500/10 text-[var(--text-secondary)]'}`}>
                  Bad Tempo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Intelligence Session Summary Modal */}
      {finalAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseSummary}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title Banner */}
            <div className="text-center space-y-1">
              <Award className="h-10 w-10 text-brand-500 mx-auto animate-bounce" />
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Session Complete!</h2>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">Clinician Telemetry & Recovery Report</p>
            </div>

            {/* Large Score Panel */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="50" stroke="var(--border-color)" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="50" 
                    stroke="#8b5cf6" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - finalAssessment.recoveryScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[var(--text-primary)]">{finalAssessment.recoveryScore}%</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-[var(--text-secondary)]">Recovery Score</span>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-4 flex-1 text-xs font-bold leading-normal">
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center gap-3">
                  <Flame className="h-5 w-5 text-brand-500" />
                  <div>
                    <span className="text-[9px] block text-[var(--text-secondary)] uppercase tracking-wider">Accuracy</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">{finalAssessment.formAccuracy}%</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center gap-3">
                  <Award className="h-5 w-5 text-emerald-500" />
                  <div>
                    <span className="text-[9px] block text-[var(--text-secondary)] uppercase tracking-wider">ROM Score</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">{finalAssessment.romScore}%</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center gap-3">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  <div>
                    <span className="text-[9px] block text-[var(--text-secondary)] uppercase tracking-wider">Duration</span>
                    <span className="text-sm font-black text-[var(--text-primary)]">{finalAssessment.sessionDurationSec}s</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  <div>
                    <span className="text-[9px] block text-[var(--text-secondary)] uppercase tracking-wider">Common Mistake</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 truncate max-w-[100px] block">
                      {finalAssessment.mostCommonMistake}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-center leading-normal">
              <div className="p-3 border border-[var(--border-color)] rounded-xl">
                <span className="text-[9px] block text-[var(--text-secondary)] uppercase tracking-wider">Consistency Rate</span>
                <span className="text-base font-black text-[var(--text-primary)]">{finalAssessment.consistencyScore}%</span>
              </div>
              <div className="p-3 border border-[var(--border-color)] rounded-xl">
                <span className="text-[9px] block text-[var(--text-secondary)] uppercase tracking-wider">Total / Perfect Reps</span>
                <span className="text-base font-black text-[var(--text-primary)]">
                  {finalAssessment.totalReps} / {finalAssessment.correctReps}
                </span>
              </div>
            </div>

            {/* Personalized Clinical Insights Panel */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-red-500" />
                Physical Therapist Guidance
              </h4>
              <div className="space-y-2">
                {finalAssessment.insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 text-xs text-[var(--text-primary)] leading-relaxed font-semibold">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-2">
              <button 
                onClick={handleCloseSummary}
                className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors cursor-pointer text-center"
              >
                Close Report & Save Results
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export const WorkoutArena: React.FC = () => {
  return (
    <PoseProvider>
      <WorkoutArenaContent />
    </PoseProvider>
  );
};
