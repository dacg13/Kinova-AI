import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, 
  ZoomIn, 
  Activity, 
  Gauge, 
  Compass, 
  Orbit 
} from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  name: string;
}

interface Bone {
  from: number;
  to: number;
  color?: string;
}

export const DigitalTwin: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Rotation and zoom states
  const [yaw, setYaw] = useState(30);   // Horizontal rotation
  const [pitch, setPitch] = useState(10); // Vertical rotation
  const [zoom, setZoom] = useState(1.1);
  const [selectedJoint, setSelectedJoint] = useState<string>('shoulder');
  const [animationMode, setAnimationMode] = useState<'static' | 'squat' | 'abduction'>('squat');
  const [telemetryStream, setTelemetryStream] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const yawStart = useRef(0);
  const pitchStart = useRef(0);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Define 3D human body landmarks (centered at 0,0,0)
  const baseLandmarks: Point3D[] = [
    { x: 0, y: -1.2, z: 0, name: 'Head' },
    { x: 0, y: -1.0, z: 0, name: 'Neck' },
    // Shoulders
    { x: -0.35, y: -0.85, z: 0, name: 'Left Shoulder' },
    { x: 0.35, y: -0.85, z: 0, name: 'Right Shoulder' },
    // Elbows
    { x: -0.45, y: -0.5, z: 0.1, name: 'Left Elbow' },
    { x: 0.45, y: -0.5, z: 0.15, name: 'Right Elbow' },
    // Wrists
    { x: -0.45, y: -0.2, z: 0.2, name: 'Left Wrist' },
    { x: 0.45, y: -0.2, z: 0.25, name: 'Right Wrist' },
    // Spine Mid
    { x: 0, y: -0.4, z: 0, name: 'Spine' },
    // Hips
    { x: -0.2, y: 0.1, z: 0, name: 'Left Hip' },
    { x: 0.2, y: 0.1, z: 0, name: 'Right Hip' },
    // Knees
    { x: -0.22, y: 0.6, z: 0.05, name: 'Left Knee' },
    { x: 0.22, y: 0.6, z: 0.08, name: 'Right Knee' },
    // Ankles
    { x: -0.22, y: 1.1, z: 0, name: 'Left Ankle' },
    { x: 0.22, y: 1.1, z: 0, name: 'Right Ankle' },
  ];

  // Bones indices mappings
  const bones: Bone[] = [
    { from: 0, to: 1 }, // Head to Neck
    { from: 1, to: 2 }, // Neck to L Shoulder
    { from: 1, to: 3 }, // Neck to R Shoulder
    { from: 2, to: 4 }, // L Shoulder to L Elbow
    { from: 3, to: 5 }, // R Shoulder to R Elbow
    { from: 4, to: 6 }, // L Elbow to L Wrist
    { from: 5, to: 7 }, // R Elbow to R Wrist
    { from: 1, to: 8 }, // Neck to Spine
    { from: 8, to: 9 }, // Spine to L Hip
    { from: 8, to: 10 }, // Spine to R Hip
    { from: 9, to: 11 }, // L Hip to L Knee
    { from: 10, to: 12 }, // R Hip to R Knee
    { from: 11, to: 13 }, // L Knee to L Ankle
    { from: 12, to: 14 }, // R Knee to R Ankle
  ];

  // 3D Angle Calculation
  const calculateAngle3D = (pA: Point3D, pB: Point3D, pC: Point3D) => {
    const vBA = { x: pA.x - pB.x, y: pA.y - pB.y, z: pA.z - pB.z };
    const vBC = { x: pC.x - pB.x, y: pC.y - pB.y, z: pC.z - pB.z };
    
    const dot = vBA.x * vBC.x + vBA.y * vBC.y + vBA.z * vBC.z;
    const magA = Math.sqrt(vBA.x * vBA.x + vBA.y * vBA.y + vBA.z * vBA.z);
    const magC = Math.sqrt(vBC.x * vBC.x + vBC.y * vBC.y + vBC.z * vBC.z);
    
    if (magA * magC === 0) return 180;
    const cosAngle = dot / (magA * magC);
    return Math.round((Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI);
  };

  // Animation ticks
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setAnimationFrame((f) => f + 1);
      animId = requestAnimationFrame(tick);
    };
    if (animationMode !== 'static') {
      animId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animId);
  }, [animationMode]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    yawStart.current = yaw;
    pitchStart.current = pitch;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setYaw((yawStart.current - dx * 0.5 + 360) % 360);
    setPitch(Math.max(-45, Math.min(45, pitchStart.current + dy * 0.5)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render skeletal system
  const renderSkeleton = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid details for premium radar grid styling
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 150 * zoom;

    // Draw tech background radar lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
    ctx.lineWidth = 1;
    for (let r = 50; r <= 200; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx, canvas.height - 10);
    ctx.moveTo(10, cy);
    ctx.lineTo(canvas.width - 10, cy);
    ctx.stroke();

    // Trig matrices
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    // Apply simulation physics offsets
    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2; // oscillates 0 -> 1 -> 0

    const landmarks = baseLandmarks.map((pt) => ({ ...pt }));

    if (animationMode === 'squat') {
      const drop = animProgress * 0.45;
      
      // Hip/torso drop
      landmarks[8].y += drop; // Spine
      landmarks[8].z -= drop * 0.2;
      landmarks[9].y += drop; // Left Hip
      landmarks[9].z -= drop * 0.25;
      landmarks[10].y += drop; // Right Hip
      landmarks[10].z -= drop * 0.25;

      // Upper body drops as well
      landmarks[0].y += drop;
      landmarks[1].y += drop;
      landmarks[2].y += drop;
      landmarks[3].y += drop;
      landmarks[4].y += drop * 0.9;
      landmarks[5].y += drop * 0.9;
      landmarks[6].y += drop * 0.8;
      landmarks[7].y += drop * 0.8;

      // Knees move forward & slightly down
      landmarks[11].y += drop * 0.35;
      landmarks[11].z += drop * 0.4;
      landmarks[12].y += drop * 0.35;
      landmarks[12].z += drop * 0.4;
    } else if (animationMode === 'abduction') {
      const angle = animProgress * Math.PI * 0.7; // sweep arm up
      
      // Rotate Left Arm
      landmarks[4].x = landmarks[2].x - Math.cos(angle) * 0.4;
      landmarks[4].y = landmarks[2].y - Math.sin(angle) * 0.4;
      landmarks[6].x = landmarks[4].x - Math.cos(angle) * 0.35;
      landmarks[6].y = landmarks[4].y - Math.sin(angle) * 0.35;

      // Rotate Right Arm
      landmarks[5].x = landmarks[3].x + Math.cos(angle) * 0.4;
      landmarks[5].y = landmarks[3].y - Math.sin(angle) * 0.4;
      landmarks[7].x = landmarks[5].x + Math.cos(angle) * 0.35;
      landmarks[7].y = landmarks[5].y - Math.sin(angle) * 0.35;
    }

    // Telemetry Sensor Noise Simulation
    if (telemetryStream) {
      landmarks.forEach((pt) => {
        pt.x += (Math.random() - 0.5) * 0.012;
        pt.y += (Math.random() - 0.5) * 0.012;
        pt.z += (Math.random() - 0.5) * 0.012;
      });
    }

    // Project coordinates
    const projected = landmarks.map((pt) => {
      // Rotate around Y
      let x1 = pt.x * cosY - pt.z * sinY;
      let z1 = pt.x * sinY + pt.z * cosY;
      // Rotate around X
      let y2 = pt.y * cosP - z1 * sinP;

      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        name: pt.name,
        // Save rotated coordinates for depth shading
        z: z1
      };
    });

    // Draw bones with depth shading
    bones.forEach((bone) => {
      const p1 = projected[bone.from];
      const p2 = projected[bone.to];
      if (!p1 || !p2) return;

      const avgDepth = (p1.z + p2.z) / 2;
      const alpha = Math.max(0.2, Math.min(1.0, 0.7 - avgDepth * 0.8));

      // Draw thick glowing back shadow
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Check if bone is part of highlighted biomechanical chain
      const isLSh = bone.from === 2 || bone.to === 2 || bone.from === 3 || bone.to === 3 || bone.from === 4 || bone.to === 4 || bone.from === 5 || bone.to === 5;
      const isLK = bone.from === 11 || bone.to === 11 || bone.from === 12 || bone.to === 12 || bone.from === 9 || bone.to === 9 || bone.from === 10 || bone.to === 10;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (selectedJoint === 'shoulder' && isLSh) {
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`; // Glowing indigo
        ctx.lineWidth = 4;
      } else if (selectedJoint === 'knee' && isLK) {
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`; // Glowing cyan
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.6})`; // Slate/grey
        ctx.lineWidth = 2.5;
      }
      ctx.stroke();
    });

    // Draw joints and dynamic angle labels
    projected.forEach((pt, index) => {
      // Depth-based radius
      const r = Math.max(4, Math.min(9, 6.5 - pt.z * 1.5));
      const glowAlpha = Math.max(0.1, Math.min(0.6, 0.45 - pt.z));

      // Draw outer glowing indicator
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 63, 94, ${glowAlpha})`;
      ctx.fill();

      // Draw solid core
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Dynamic joint overlay overlays for values
      if (selectedJoint === 'knee' && (index === 11 || index === 12)) {
        // Left Knee (11) Hip (9) Ankle (13) or Right Knee (12) Hip (10) Ankle (14)
        const hipIndex = index === 11 ? 9 : 10;
        const ankleIndex = index === 11 ? 13 : 14;
        const angle = calculateAngle3D(landmarks[hipIndex], landmarks[index], landmarks[ankleIndex]);

        // Draw angle circular arc
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${angle}°`, pt.x + 22, pt.y + 3);
      }

      if (selectedJoint === 'shoulder' && (index === 2 || index === 3)) {
        // Left Shoulder (2) Neck (1) Elbow (4) or Right Shoulder (3) Neck (1) Elbow (5)
        const elbowIndex = index === 2 ? 4 : 5;
        const angle = calculateAngle3D(landmarks[1], landmarks[index], landmarks[elbowIndex]);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${angle}°`, pt.x + 22, pt.y + 3);
      }
    });
  };

  useEffect(() => {
    renderSkeleton();
  }, [yaw, pitch, zoom, selectedJoint, animationFrame, telemetryStream, animationMode]);

  // Derived dynamically computed angles for metrics cards
  const currentKneeAngle = (() => {
    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2;
    if (animationMode !== 'squat') return 175;
    return Math.round(180 - (animProgress * 82)); // ranges from 180 to 98 degrees
  })();

  const currentShoulderAngle = (() => {
    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2;
    if (animationMode !== 'abduction') return 45;
    return Math.round(35 + (animProgress * 110)); // sweeps up to 145 degrees
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[580px]">
      
      {/* Parameters Panel */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between overflow-y-auto space-y-4">
        
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-brand-500" />
              Digital Twin Controls
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Interact directly by dragging the model canvas or configure custom biomechanical simulation profiles below.
            </p>
          </div>

          {/* Interactive Simulation Modes */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
            <label className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">
              Simulation Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button 
                onClick={() => setAnimationMode('static')}
                className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${animationMode === 'static' ? 'bg-brand-500/10 border-brand-500 text-brand-500 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-600'}`}
              >
                Static Pose
              </button>
              <button 
                onClick={() => setAnimationMode('squat')}
                className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${animationMode === 'squat' ? 'bg-brand-500/10 border-brand-500 text-brand-500 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-600'}`}
              >
                Squat Loop
              </button>
              <button 
                onClick={() => setAnimationMode('abduction')}
                className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${animationMode === 'abduction' ? 'bg-brand-500/10 border-brand-500 text-brand-500 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-600'}`}
              >
                Abduction
              </button>
            </div>
          </div>

          {/* Yaw slider */}
          <div className="space-y-1 text-xs font-semibold">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Orbit className="h-3.5 w-3.5 text-indigo-500" /> Yaw Rotation
              </span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded font-mono">{yaw}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              value={yaw}
              onChange={(e) => setYaw(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Pitch slider */}
          <div className="space-y-1 text-xs font-semibold">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Compass className="h-3.5 w-3.5 text-brand-500" /> Pitch Rotation
              </span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded font-mono">{pitch}°</span>
            </div>
            <input 
              type="range" 
              min="-45" 
              max="45" 
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Zoom slider */}
          <div className="space-y-1 text-xs font-semibold">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <ZoomIn className="h-3.5 w-3.5 text-emerald-500" /> Zoom Factor
              </span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded font-mono">{zoom.toFixed(2)}x</span>
            </div>
            <input 
              type="range" 
              min="0.6" 
              max="1.8" 
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Biomechanical highlight toggles */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
            <label className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">
              Highlight Kinematic Chain
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSelectedJoint('shoulder')}
                className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer border ${selectedJoint === 'shoulder' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-600'}`}
              >
                Shoulder Girdle
              </button>
              <button 
                onClick={() => setSelectedJoint('knee')}
                className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer border ${selectedJoint === 'knee' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-slate-600'}`}
              >
                Knee Kinematics
              </button>
            </div>
          </div>

          {/* Telemetry Stream simulation */}
          <div className="flex justify-between items-center py-2.5 px-3 rounded-xl bg-slate-900/40 border border-[var(--border-color)]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-primary)]">Telemetry stream</span>
              <span className="text-[8px] text-[var(--text-secondary)] font-medium">Simulate sensor fluctuation</span>
            </div>
            <button 
              onClick={() => setTelemetryStream(!telemetryStream)}
              className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative ${telemetryStream ? 'bg-brand-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${telemetryStream ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        {/* Live Diagnostics Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[var(--border-color)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className={`h-3 w-3 ${telemetryStream ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`} />
              Diagnostics Output
            </span>
            <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1 py-0.5 rounded">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold leading-normal">
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
              <div className="text-[8px] text-slate-500 uppercase">Knee flexion</div>
              <div className="text-cyan-400 text-sm mt-0.5">{currentKneeAngle}°</div>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
              <div className="text-[8px] text-slate-500 uppercase">Shoulder Abduct</div>
              <div className="text-indigo-400 text-sm mt-0.5">{currentShoulderAngle}°</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Skeleton Canvas Viewport */}
      <div className="lg:col-span-2 glass-card rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center p-6 relative bg-slate-950/40 overflow-hidden group">
        
        {/* Dynamic status stats indicators overlay */}
        <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/70 backdrop-blur-md text-[10px] font-bold space-y-1.5 z-10 w-[180px] shadow-xl">
          <div className="text-[9px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" />
            Symmetry Indices
          </div>
          <div className="flex justify-between gap-4 text-slate-200 border-t border-slate-800/60 pt-1.5">
            <span className="font-semibold text-slate-400">Shoulders:</span>
            <span className="text-emerald-500 font-mono">97.4%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-200">
            <span className="font-semibold text-slate-400">Hips & Pelvis:</span>
            <span className="text-emerald-500 font-mono">98.2%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-200">
            <span className="font-semibold text-slate-400">Risk Prediction:</span>
            <span className="text-emerald-400 uppercase font-bold tracking-wider">LOW</span>
          </div>
        </div>

        {/* Dynamic controls badge instruction overlay */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/70 backdrop-blur-md text-[9px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
            <Orbit className="h-3 w-3 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            Direct Drag Enabled
          </div>
        </div>

        <canvas 
          ref={canvasRef} 
          width={460} 
          height={390}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`max-w-full aspect-square cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        />

        <div className="text-[9px] text-[var(--text-secondary)] font-bold tracking-wider text-center mt-3 uppercase flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-slate-500 animate-pulse" />
          Click and drag directly on the canvas space to rotate skeletal projection
        </div>
      </div>

    </div>
  );
};
