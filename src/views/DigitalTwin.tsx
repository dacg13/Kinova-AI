import React, { useState, useRef, useEffect } from 'react';
import { Sliders, RotateCw, ZoomIn, Info } from 'lucide-react';

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
  const [zoom, setZoom] = useState(1.0);
  const [selectedJoint, setSelectedJoint] = useState<string>('shoulder');

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

  // Performs 3D rotation and projections
  const renderSkeleton = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dimensions
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 140 * zoom;

    // Trig matrices
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    // Project all points
    const projected = baseLandmarks.map((pt) => {
      // 1. Rotate around Y (Yaw)
      let x1 = pt.x * cosY - pt.z * sinY;
      let z1 = pt.x * sinY + pt.z * cosY;

      // 2. Rotate around X (Pitch)
      let y2 = pt.y * cosP - z1 * sinP;

      // Orthographic Projection (X, Y) scaled to canvas space
      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        name: pt.name
      };
    });

    // Draw bones
    ctx.lineWidth = 4;
    bones.forEach((bone) => {
      const p1 = projected[bone.from];
      const p2 = projected[bone.to];
      if (!p1 || !p2) return;

      // Draw shadow path
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw primary bone
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      
      // Heatmap highlights based on selection
      const isLSh = bone.from === 2 || bone.to === 2 || bone.from === 3 || bone.to === 3;
      const isLK = bone.from === 11 || bone.to === 11 || bone.from === 12 || bone.to === 12;

      if (selectedJoint === 'shoulder' && isLSh) {
        ctx.strokeStyle = '#3b82f6'; // Blue
      } else if (selectedJoint === 'knee' && isLK) {
        ctx.strokeStyle = '#10b981'; // Green
      } else {
        ctx.strokeStyle = '#475569'; // Slate
      }
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Draw joints
    projected.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e'; // Pink base
      ctx.fill();

      // Border outer highlight
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  useEffect(() => {
    renderSkeleton();
  }, [yaw, pitch, zoom, selectedJoint]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Parameters Panel */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-brand-500" />
              Digital Twin Controls
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)]">Adjust rotation and zoom to inspect skeletal symmetry indices.</p>
          </div>

          {/* Yaw slider */}
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
              <span className="flex items-center gap-1"><RotateCw className="h-3.5 w-3.5" /> Yaw Rotation</span>
              <span>{yaw}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              value={yaw}
              onChange={(e) => setYaw(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Pitch slider */}
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
              <span className="flex items-center gap-1"><RotateCw className="h-3.5 w-3.5" /> Pitch Rotation</span>
              <span>{pitch}°</span>
            </div>
            <input 
              type="range" 
              min="-45" 
              max="45" 
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Zoom slider */}
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between items-center text-[var(--text-primary)]">
              <span className="flex items-center gap-1"><ZoomIn className="h-3.5 w-3.5" /> Zoom Factor</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.6" 
              max="1.8" 
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Select joint overlays overlays */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
            <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Highlight Biomechanical Chains</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSelectedJoint('shoulder')}
                className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-colors cursor-pointer border ${selectedJoint === 'shoulder' ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}
              >
                Shoulder Girdle
              </button>
              <button 
                onClick={() => setSelectedJoint('knee')}
                className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-colors cursor-pointer border ${selectedJoint === 'knee' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}
              >
                Knee Kinematics
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 text-[10px] leading-relaxed text-[var(--text-secondary)] font-semibold flex gap-2">
          <Info className="h-4 w-4 text-brand-500 shrink-0" />
          <span>This 3D twin projects Euclidean landmarks inside a 2.5D space to evaluate visual posture alignment.</span>
        </div>
      </div>

      {/* 3D Skeleton Canvas Viewport */}
      <div className="lg:col-span-2 glass-card rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center p-6 relative bg-slate-950/40">
        
        {/* Dynamic status stats indicators overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 backdrop-blur text-[10px] font-bold space-y-1 z-10">
          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Symmetry Indices</div>
          <div className="flex justify-between gap-4 text-slate-200">
            <span>Shoulders (R/L):</span>
            <span className="text-emerald-500">97.4%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-200">
            <span>Hips & Pelvis:</span>
            <span className="text-emerald-500">98.2%</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-200">
            <span>Risk Prediction:</span>
            <span className="text-emerald-500 uppercase">LOW</span>
          </div>
        </div>

        <canvas 
          ref={canvasRef} 
          width={450} 
          height={380}
          className="max-w-full aspect-square"
        />

        <div className="text-[10px] text-[var(--text-secondary)] font-semibold text-center mt-3">
          Drag sliders to rotate orthographic wireframe projections
        </div>
      </div>

    </div>
  );
};
