import React, { useEffect, useRef } from 'react';
import { usePose } from '@/context/PoseContext';
import { Cpu, Eye, Info } from 'lucide-react';

interface PoseRendererProps {
  isMirrored: boolean;
}

// MediaPipe BlazePose joint connection maps
const BONE_CONNECTIONS: [number, number][] = [
  [11, 12], // Shoulder to Shoulder
  [11, 13], [13, 15], // Left Arm (Shoulder -> Elbow -> Wrist)
  [12, 14], [14, 16], // Right Arm (Shoulder -> Elbow -> Wrist)
  [11, 23], [12, 24], [23, 24], // Torso (Shoulders to Hips)
  [23, 25], [25, 27], // Left Leg (Hip -> Knee -> Ankle)
  [24, 26], [26, 28], // Right Leg (Hip -> Knee -> Ankle)
  [27, 29], [29, 31], [27, 31], // Left Foot (Ankle -> Heel -> Toe)
  [28, 30], [30, 32], [28, 32]  // Right Foot (Ankle -> Heel -> Toe)
];

// Key joints to highlight for clinical diagnostics
const HIGHLIGHT_JOINTS = [11, 12, 13, 14, 23, 24, 25, 26, 27, 28];

export const PoseRenderer: React.FC<PoseRendererProps> = ({ isMirrored }) => {
  const { landmarks, fps, latency, debugMode, toggleDebugMode } = usePose();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-performance exponential smoothing filter states
  const smoothedRef = useRef<{ x: number; y: number }[]>([]);
  const ALPHA = 0.45; // Smoothing dampening coefficient (0.1 - 0.9)

  // Resize canvas to match display container bounds
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Canvas drawing loop triggered on landmark updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frames
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length === 0) {
      smoothedRef.current = [];
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // 1. Initialize or Apply Exponential Smoothing Filter
    if (smoothedRef.current.length !== landmarks.length) {
      smoothedRef.current = landmarks.map((l) => ({ x: l.x, y: l.y }));
    } else {
      smoothedRef.current = smoothedRef.current.map((prev, idx) => {
        const curr = landmarks[idx];
        return {
          x: ALPHA * curr.x + (1 - ALPHA) * prev.x,
          y: ALPHA * curr.y + (1 - ALPHA) * prev.y,
        };
      });
    }

    // Coordinate conversion utility incorporating mirroring rules
    const getCanvasCoords = (landmark: { x: number; y: number }) => {
      const rawX = isMirrored ? 1 - landmark.x : landmark.x;
      return {
        x: rawX * w,
        y: landmark.y * h,
      };
    };

    // 2. Draw Bones (Lines connecting landmarks)
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    BONE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startLm = landmarks[startIdx];
      const endLm = landmarks[endIdx];

      // Confidence filtering threshold: Skip if visibility is below threshold
      const startVis = startLm.visibility ?? 1.0;
      const endVis = endLm.visibility ?? 1.0;

      if (startVis > 0.5 && endVis > 0.5) {
        const startSmoothed = smoothedRef.current[startIdx];
        const endSmoothed = smoothedRef.current[endIdx];

        const startPt = getCanvasCoords(startSmoothed);
        const endPt = getCanvasCoords(endSmoothed);

        // Draw shadow glow first
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Core bone line
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.strokeStyle = '#8b5cf6'; // Brand primary purple
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // 3. Draw Joints (Filled nodes)
    landmarks.forEach((landmark, idx) => {
      // Draw all landmarks in debug mode, otherwise only draw major functional joints
      const shouldDrawJoint = debugMode || HIGHLIGHT_JOINTS.includes(idx);
      const visibility = landmark.visibility ?? 1.0;

      if (shouldDrawJoint && visibility > 0.5) {
        const smoothed = smoothedRef.current[idx];
        const pt = getCanvasCoords(smoothed);

        // Circle core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, debugMode ? 4.5 : 6, 0, 2 * Math.PI);
        // Highlight clinically critical joints with primary, otherwise secondary
        ctx.fillStyle = HIGHLIGHT_JOINTS.includes(idx) ? '#10b981' : '#c084fc';
        ctx.fill();

        // White border ring for visual contrast
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, debugMode ? 4.5 : 6, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Renders index overlays and coordinate tags when debug mode is enabled
        if (debugMode) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          const text = `${idx}`;
          const textMetrics = ctx.measureText(text);
          const textX = pt.x - textMetrics.width / 2;
          const textY = pt.y - 8;

          ctx.strokeText(text, textX, textY);
          ctx.fillText(text, textX, textY);
        }
      }
    });
  }, [landmarks, isMirrored, debugMode]);

  // Calculate average confidence of visible joints
  const getAverageConfidence = () => {
    if (!landmarks || landmarks.length === 0) return 0;
    const visList = landmarks.map((l) => l.visibility ?? 1.0);
    const sum = visList.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / landmarks.length) * 100);
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
      {/* Skeleton Overlay Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Diagnostics Monitor Overlay */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto flex flex-col gap-2">
        <div className="glass-panel text-white p-3 rounded-2xl border border-white/10 flex flex-col gap-1.5 text-[10px] font-semibold w-44 shadow-lg">
          <div className="flex items-center gap-1 text-brand-400 font-bold border-b border-white/10 pb-1 uppercase tracking-wider">
            <Cpu className="h-3.5 w-3.5" />
            Pose Engine Telemetry
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tracking Status</span>
            <span className={landmarks ? "text-emerald-400 font-bold" : "text-amber-500 font-bold animate-pulse"}>
              {landmarks ? "Active" : "Searching"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">FPS Render Rate</span>
            <span className="text-slate-200">{fps} FPS</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Engine Latency</span>
            <span className="text-slate-200">{latency} ms</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Landmark Vis.</span>
            <span className="text-slate-200">{getAverageConfidence()}%</span>
          </div>

          {/* Toggle Debug Overlay */}
          <button
            onClick={toggleDebugMode}
            className="mt-1 flex items-center justify-center gap-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/5 cursor-pointer font-bold text-[9px] uppercase tracking-wider transition-colors"
          >
            <Eye className="h-3 w-3" />
            {debugMode ? "Hide Joint IDs" : "Show Joint IDs"}
          </button>
        </div>

        {/* Quick Calibration Guide Warning Banner */}
        {landmarks && getAverageConfidence() < 70 && (
          <div className="glass-panel bg-amber-500/10 border-amber-500/20 text-amber-300 p-2.5 rounded-xl flex items-start gap-1.5 text-[9px] leading-tight font-semibold max-w-xs shadow-md">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Position warning: Low body visibility. Ensure full body is visible in well-lit surroundings.</span>
          </div>
        )}
      </div>
    </div>
  );
};
