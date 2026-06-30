import React, { useState, useRef, useEffect } from 'react';
import { 
  Sliders, 
  ZoomIn, 
  Activity, 
  Gauge, 
  Compass, 
  Orbit,
  RotateCcw,
  RotateCw,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Info
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
  
  // Dynamic camera and projection states
  const [yaw, setYaw] = useState(30);   
  const [pitch, setPitch] = useState(10); 
  const [zoom, setZoom] = useState(1.15);
  
  // Interpolation targets for smooth camera flys
  const targetYaw = useRef(30);
  const targetPitch = useRef(10);
  const targetZoom = useRef(1.15);

  const [selectedJoint, setSelectedJoint] = useState<string>('shoulder');
  const [animationMode, setAnimationMode] = useState<'static' | 'squat' | 'abduction'>('squat');
  const [telemetryStream, setTelemetryStream] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const [visMode, setVisMode] = useState<'normal' | 'muscle' | 'stress' | 'pain' | 'rom' | 'predict'>('normal');
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  
  const [animationFrame, setAnimationFrame] = useState(0);
  
  // Interactive Joint hover coordinate tracking
  const [hoveredJoint, setHoveredJoint] = useState<number | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 480, height: 480 });
  
  // Collapsible control states
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'simulation' | 'camera' | 'data'>('simulation');

  const dragStart = useRef({ x: 0, y: 0 });
  const yawStart = useRef(0);
  const pitchStart = useRef(0);

  // Define 3D human body landmarks (centered at 0,0,0)
  const baseLandmarks: Point3D[] = [
    { x: 0, y: -1.2, z: 0, name: 'Head' },
    { x: 0, y: -0.95, z: 0, name: 'Neck' },
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
    { x: 0, y: -0.35, z: 0, name: 'Spine' },
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
    { from: 0, to: 1 }, 
    { from: 1, to: 2 }, 
    { from: 1, to: 3 }, 
    { from: 2, to: 4 }, 
    { from: 3, to: 5 }, 
    { from: 4, to: 6 }, 
    { from: 5, to: 7 }, 
    { from: 1, to: 8 }, 
    { from: 8, to: 9 }, 
    { from: 8, to: 10 }, 
    { from: 9, to: 11 }, 
    { from: 10, to: 12 }, 
    { from: 11, to: 13 }, 
    { from: 12, to: 14 }, 
  ];

  // Joint specific mock telemetry indices for detail box rendering
  const jointTelemetryData: Record<number, { rom: string; confidence: string; status: string; advice: string }> = {
    0: { rom: '--', confidence: '99%', status: 'Stable', advice: 'Keep head alignment neutral' },
    1: { rom: '--', confidence: '98%', status: 'Optimal', advice: 'Cervical alignment nominal' },
    2: { rom: '132°', confidence: '98%', status: 'Excellent', advice: 'Increase abduction by 4°' },
    3: { rom: '128°', confidence: '97%', status: 'Optimal', advice: 'Maintain abduction velocity' },
    4: { rom: '94°', confidence: '95%', status: 'Stable', advice: 'Avoid shoulder shrugging' },
    5: { rom: '92°', confidence: '96%', status: 'Optimal', advice: 'Keep elbow extension stable' },
    6: { rom: '--', confidence: '94%', status: 'Stable', advice: 'Wrist trajectory clear' },
    7: { rom: '--', confidence: '95%', status: 'Stable', advice: 'Wrist trajectory clear' },
    8: { rom: '--', confidence: '97%', status: 'Optimal', advice: 'Lumbar support recommended' },
    9: { rom: '88°', confidence: '98%', status: 'Excellent', advice: 'Symmetry indices optimal' },
    10: { rom: '86°', confidence: '96%', status: 'Stable', advice: 'Align hips with pelvis' },
    11: { rom: '112°', confidence: '97%', status: 'Slight Strain', advice: 'Avoid inner rotation' },
    12: { rom: '116°', confidence: '98%', status: 'Excellent', advice: 'Pacing controls nominal' },
    13: { rom: '--', confidence: '99%', status: 'Stable', advice: 'Ankle stabilization active' },
    14: { rom: '--', confidence: '99%', status: 'Stable', advice: 'Ankle stabilization active' },
  };

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

  // LERP Camera interpolation inside requestAnimationFrame
  useEffect(() => {
    let active = true;
    const lerpLoop = () => {
      if (!active) return;
      
      setYaw((y) => {
        const diff = targetYaw.current - y;
        if (Math.abs(diff) < 0.05) return targetYaw.current;
        return (y + diff * 0.12 + 360) % 360;
      });
      
      setPitch((p) => {
        const diff = targetPitch.current - p;
        if (Math.abs(diff) < 0.05) return targetPitch.current;
        return p + diff * 0.12;
      });
      
      setZoom((z) => {
        const diff = targetZoom.current - z;
        if (Math.abs(diff) < 0.005) return targetZoom.current;
        return z + diff * 0.12;
      });
      
      requestAnimationFrame(lerpLoop);
    };
    
    requestAnimationFrame(lerpLoop);
    return () => {
      active = false;
    };
  }, []);

  // Animation Loop Player
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const delta = now - lastTime;
      const framesToAdvance = delta / 16.67;
      setAnimationFrame((f) => (f + framesToAdvance) % 100);
      lastTime = now;
      animId = requestAnimationFrame(tick);
    };
    
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle Resize of canvas based on responsive layouts
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        // Dynamic adaptive sizing for mobile compatibility
        const computedSize = Math.max(280, Math.min(480, rect.width - 24));
        setCanvasDimensions({
          width: computedSize,
          height: computedSize
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoom]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    yawStart.current = yaw;
    pitchStart.current = pitch;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Joint hover detection
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      targetYaw.current = (yawStart.current - dx * 0.5 + 360) % 360;
      targetPitch.current = Math.max(-45, Math.min(45, pitchStart.current + dy * 0.5));
    } else {
      // Check if mouse is hovering over any joint
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = (canvas.width * 0.35) * zoom;
      const radYaw = (yaw * Math.PI) / 180;
      const radPitch = (pitch * Math.PI) / 180;
      const cosY = Math.cos(radYaw);
      const sinY = Math.sin(radYaw);
      const cosP = Math.cos(radPitch);
      const sinP = Math.sin(radPitch);

      // Compute frame positions for hover checks
      const t = ((animationFrame) * 0.04) % (Math.PI * 2);
      const animProgress = (Math.sin(t) + 1) / 2;
      
      const checkLandmarks = baseLandmarks.map((pt) => {
        const res = { ...pt };
        if (animationMode === 'squat') {
          const drop = animProgress * 0.45;
          if ([0, 1, 2, 3, 8, 9, 10].includes(baseLandmarks.indexOf(pt))) res.y += drop;
          if ([4, 5].includes(baseLandmarks.indexOf(pt))) res.y += drop * 0.9;
          if ([6, 7].includes(baseLandmarks.indexOf(pt))) res.y += drop * 0.8;
          if ([11, 12].includes(baseLandmarks.indexOf(pt))) {
            res.y += drop * 0.35;
            res.z += drop * 0.4;
          }
        } else if (animationMode === 'abduction') {
          const angle = animProgress * Math.PI * 0.7;
          const idx = baseLandmarks.indexOf(pt);
          if (idx === 4) {
            res.x = baseLandmarks[2].x - Math.cos(angle) * 0.4;
            res.y = baseLandmarks[2].y - Math.sin(angle) * 0.4;
          } else if (idx === 6) {
            const ex = baseLandmarks[2].x - Math.cos(angle) * 0.4;
            const ey = baseLandmarks[2].y - Math.sin(angle) * 0.4;
            res.x = ex - Math.cos(angle) * 0.35;
            res.y = ey - Math.sin(angle) * 0.35;
          } else if (idx === 5) {
            res.x = baseLandmarks[3].x + Math.cos(angle) * 0.4;
            res.y = baseLandmarks[3].y - Math.sin(angle) * 0.4;
          } else if (idx === 7) {
            const ex = baseLandmarks[3].x + Math.cos(angle) * 0.4;
            const ey = baseLandmarks[3].y - Math.sin(angle) * 0.4;
            res.x = ex + Math.cos(angle) * 0.35;
            res.y = ey - Math.sin(angle) * 0.35;
          }
        }
        return res;
      });

      let found: number | null = null;
      checkLandmarks.forEach((pt, index) => {
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;
        let y2 = pt.y * cosP - z1 * sinP;
        
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const dist = Math.hypot(mouseX - px, mouseY - py);
        if (dist < 15) {
          found = index;
        }
      });
      setHoveredJoint(found);
    }
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

    // Clear with high transparency for overlay layout
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = (canvas.width * 0.35) * zoom;

    // Cinematic Grid/Rings in background (Unreal Engine aesthetic)
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)';
    ctx.lineWidth = 1;
    for (let r = 40; r <= 200; r += 40) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Crosshair reference lines
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, canvas.height - 20);
    ctx.moveTo(20, cy);
    ctx.lineTo(canvas.width - 20, cy);
    ctx.stroke();

    // Projected matrices setup
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    // Apply simulation physics offsets
    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2; 

    // Compute joint coordinates mapping
    const getCoordinatesForFrame = (frameProgress: number, isIdeal = false) => {
      return baseLandmarks.map((pt, idx) => {
        const res = { ...pt };
        if (animationMode === 'squat') {
          // If ideal comparison mode, drop is aligned perfectly (ideal trajectory)
          const drop = frameProgress * (isIdeal ? 0.4 : 0.45);
          if ([0, 1, 2, 3, 8, 9, 10].includes(idx)) res.y += drop;
          if ([4, 5].includes(idx)) res.y += drop * 0.9;
          if ([6, 7].includes(idx)) res.y += drop * 0.8;
          if ([11, 12].includes(idx)) {
            res.y += drop * 0.35;
            res.z += drop * (isIdeal ? 0.35 : 0.4);
          }
        } else if (animationMode === 'abduction') {
          const angle = frameProgress * Math.PI * (isIdeal ? 0.65 : 0.7);
          if (idx === 4) {
            res.x = baseLandmarks[2].x - Math.cos(angle) * 0.4;
            res.y = baseLandmarks[2].y - Math.sin(angle) * 0.4;
          } else if (idx === 6) {
            const ex = baseLandmarks[2].x - Math.cos(angle) * 0.4;
            const ey = baseLandmarks[2].y - Math.sin(angle) * 0.4;
            res.x = ex - Math.cos(angle) * 0.35;
            res.y = ey - Math.sin(angle) * 0.35;
          } else if (idx === 5) {
            res.x = baseLandmarks[3].x + Math.cos(angle) * 0.4;
            res.y = baseLandmarks[3].y - Math.sin(angle) * 0.4;
          } else if (idx === 7) {
            const ex = baseLandmarks[3].x + Math.cos(angle) * 0.4;
            const ey = baseLandmarks[3].y - Math.sin(angle) * 0.4;
            res.x = ex + Math.cos(angle) * 0.35;
            res.y = ey - Math.sin(angle) * 0.35;
          }
        }

        // Add sensors telemetry vibration simulation
        if (telemetryStream && !isIdeal) {
          res.x += (Math.sin(t * 12 + idx) * 0.005);
          res.y += (Math.cos(t * 10 + idx) * 0.005);
        }
        return res;
      });
    };

    const landmarks = getCoordinatesForFrame(animProgress);
    const projected = landmarks.map((pt) => {
      let x1 = pt.x * cosY - pt.z * sinY;
      let z1 = pt.x * sinY + pt.z * cosY;
      let y2 = pt.y * cosP - z1 * sinP;
      return { x: cx + x1 * scale, y: cy + y2 * scale, z: z1, name: pt.name };
    });

    // 1. Draw Comparison Session / Ideal Ghost Skeleton Mode (Apple Vision Pro HUD overlay)
    if (comparisonMode || visMode === 'predict') {
      const idealLandmarks = getCoordinatesForFrame(animProgress, true);
      const idealProjected = idealLandmarks.map((pt) => {
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;
        let y2 = pt.y * cosP - z1 * sinP;
        return { x: cx + x1 * scale, y: cy + y2 * scale, z: z1 };
      });

      // Draw ghost bones (Purple/Translucent)
      bones.forEach((bone) => {
        const p1 = idealProjected[bone.from];
        const p2 = idealProjected[bone.to];
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = visMode === 'predict' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(139, 92, 246, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw ghost joints
      idealProjected.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = visMode === 'predict' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(139, 92, 246, 0.5)';
        ctx.fill();
      });
    }

    // 2. Holographic Silhouette / Muscle volumetric rendering
    // Draw body segments (Torso capsule)
    if (projected[2] && projected[3] && projected[10] && projected[9]) {
      ctx.beginPath();
      ctx.moveTo(projected[2].x, projected[2].y);
      ctx.lineTo(projected[3].x, projected[3].y);
      ctx.lineTo(projected[10].x, projected[10].y);
      ctx.lineTo(projected[9].x, projected[9].y);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(cx, cy - 100, cx, cy + 100);
      if (visMode === 'muscle') {
        bodyGrad.addColorStop(0, 'rgba(239, 68, 68, 0.08)');
        bodyGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.05)');
        bodyGrad.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
      } else if (visMode === 'pain') {
        bodyGrad.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
        bodyGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.09)');
        bodyGrad.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
      } else {
        bodyGrad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
        bodyGrad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
      }
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Soft body outline
      ctx.strokeStyle = visMode === 'muscle' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw glowing limbs volumetric overlay
    bones.forEach((bone) => {
      const p1 = projected[bone.from];
      const p2 = projected[bone.to];
      if (!p1 || !p2) return;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      
      let limbColor = 'rgba(59, 130, 246, 0.04)';
      if (visMode === 'muscle') limbColor = 'rgba(249, 115, 22, 0.06)';
      else if (visMode === 'stress') limbColor = 'rgba(234, 179, 8, 0.04)';

      ctx.strokeStyle = limbColor;
      ctx.lineWidth = 14 * zoom;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // 3. Draw Holographic skeleton bones (Standard mode)
    bones.forEach((bone) => {
      const p1 = projected[bone.from];
      const p2 = projected[bone.to];
      if (!p1 || !p2) return;

      const avgDepth = (p1.z + p2.z) / 2;
      const alpha = Math.max(0.2, Math.min(1.0, 0.7 - avgDepth * 0.8));

      // Draw bone shadow
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Check highlighted kinematic chain
      const isLSh = bone.from === 2 || bone.to === 2 || bone.from === 3 || bone.to === 3 || bone.from === 4 || bone.to === 4 || bone.from === 5 || bone.to === 5;
      const isLK = bone.from === 11 || bone.to === 11 || bone.from === 12 || bone.to === 12 || bone.from === 9 || bone.to === 9 || bone.from === 10 || bone.to === 10;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      // Mode based color definitions
      if (visMode === 'stress') {
        // Red joints and bones around knee/hip chain
        if (isLK) {
          ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.9})`; // Orange overuse
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = `rgba(234, 179, 8, ${alpha * 0.6})`; // Yellow stress
          ctx.lineWidth = 2.5;
        }
      } else if (visMode === 'pain') {
        if (isLK) {
          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`; // Red pain zones
          ctx.lineWidth = 4;
        } else {
          ctx.strokeStyle = `rgba(71, 85, 105, ${alpha * 0.5})`;
          ctx.lineWidth = 2;
        }
      } else {
        if (selectedJoint === 'shoulder' && isLSh) {
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`; 
          ctx.lineWidth = 3.5;
        } else if (selectedJoint === 'knee' && isLK) {
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`; 
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.4})`; // Translucent cyan/blue
          ctx.lineWidth = 2;
        }
      }
      ctx.stroke();
    });

    // 4. Draw joints & holographic bloom overlays
    projected.forEach((pt, index) => {
      const r = Math.max(4, Math.min(8.5, 6 - pt.z * 1.5));
      const isHovered = hoveredJoint === index;

      // Pulse calculations
      const pulseSpeed = 15;
      const pulseRadius = r * (2.2 + Math.sin(animationFrame / pulseSpeed) * 0.4);
      const isHighlightedJoint = (selectedJoint === 'shoulder' && [2, 3].includes(index)) || (selectedJoint === 'knee' && [11, 12].includes(index));

      // Draw holographic halo
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHovered ? r * 4 : pulseRadius, 0, Math.PI * 2);
      
      let coreColor = '#22d3ee';
      let haloColor = 'rgba(6, 182, 212, 0.25)';

      if (visMode === 'stress') {
        coreColor = '#eab308';
        haloColor = 'rgba(234, 179, 8, 0.2)';
        if (index === 11 || index === 12) {
          coreColor = '#f97316';
          haloColor = 'rgba(249, 115, 22, 0.3)';
        }
      } else if (visMode === 'pain') {
        if (index === 11 || index === 12) {
          coreColor = '#ef4444';
          haloColor = `rgba(239, 68, 68, ${0.3 + Math.sin(animationFrame / 8) * 0.15})`;
        } else {
          coreColor = '#64748b';
          haloColor = 'rgba(100, 116, 139, 0.1)';
        }
      } else if (isHighlightedJoint) {
        coreColor = selectedJoint === 'shoulder' ? '#818cf8' : '#22d3ee';
        haloColor = selectedJoint === 'shoulder' ? 'rgba(129, 140, 248, 0.35)' : 'rgba(34, 211, 238, 0.35)';
      } else {
        coreColor = '#60a5fa';
        haloColor = 'rgba(96, 165, 250, 0.15)';
      }

      ctx.fillStyle = haloColor;
      ctx.fill();

      // Draw solid joint core
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHovered ? r * 1.5 : r, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Dynamic angle overlays for ROM Analysis Mode
      if (visMode === 'rom' || isHighlightedJoint) {
        if (index === 11 || index === 12) {
          const hipIndex = index === 11 ? 9 : 10;
          const ankleIndex = index === 11 ? 13 : 14;
          const angle = calculateAngle3D(landmarks[hipIndex], landmarks[index], landmarks[ankleIndex]);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#22d3ee';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${angle}°`, pt.x + 24, pt.y + 3);
        }

        if (index === 2 || index === 3) {
          const elbowIndex = index === 2 ? 4 : 5;
          const angle = calculateAngle3D(landmarks[1], landmarks[index], landmarks[elbowIndex]);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 20, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#818cf8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`${angle}°`, pt.x + 24, pt.y + 3);
        }
      }
    });
  };

  // Redraw canvas on state changes
  useEffect(() => {
    renderSkeleton();
  }, [yaw, pitch, zoom, selectedJoint, animationFrame, telemetryStream, animationMode, visMode, comparisonMode, canvasDimensions, hoveredJoint]);

  // Dynamic telemetry calculations
  const currentKneeAngle = (() => {
    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2;
    if (animationMode !== 'squat') return 175;
    return Math.round(180 - (animProgress * 82)); 
  })();

  const currentShoulderAngle = (() => {
    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2;
    if (animationMode !== 'abduction') return 45;
    return Math.round(35 + (animProgress * 110)); 
  })();

  // Build projected coordinates for hovered card overlay
  const getProjectedJointsCoordinates = () => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = (canvas.width * 0.35) * zoom;
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;
    const cosY = Math.cos(radYaw);
    const sinY = Math.sin(radYaw);
    const cosP = Math.cos(radPitch);
    const sinP = Math.sin(radPitch);

    const t = (animationFrame * 0.04) % (Math.PI * 2);
    const animProgress = (Math.sin(t) + 1) / 2;

    const currentCoords = baseLandmarks.map((pt, idx) => {
      const res = { ...pt };
      if (animationMode === 'squat') {
        const drop = animProgress * 0.45;
        if ([0, 1, 2, 3, 8, 9, 10].includes(idx)) res.y += drop;
        if ([4, 5].includes(idx)) res.y += drop * 0.9;
        if ([6, 7].includes(idx)) res.y += drop * 0.8;
        if ([11, 12].includes(idx)) {
          res.y += drop * 0.35;
          res.z += drop * 0.4;
        }
      } else if (animationMode === 'abduction') {
        const angle = animProgress * Math.PI * 0.7;
        if (idx === 4) {
          res.x = baseLandmarks[2].x - Math.cos(angle) * 0.4;
          res.y = baseLandmarks[2].y - Math.sin(angle) * 0.4;
        } else if (idx === 6) {
          const ex = baseLandmarks[2].x - Math.cos(angle) * 0.4;
          const ey = baseLandmarks[2].y - Math.sin(angle) * 0.4;
          res.x = ex - Math.cos(angle) * 0.35;
          res.y = ey - Math.sin(angle) * 0.35;
        } else if (idx === 5) {
          res.x = baseLandmarks[3].x + Math.cos(angle) * 0.4;
          res.y = baseLandmarks[3].y - Math.sin(angle) * 0.4;
        } else if (idx === 7) {
          const ex = baseLandmarks[3].x + Math.cos(angle) * 0.4;
          const ey = baseLandmarks[3].y - Math.sin(angle) * 0.4;
          res.x = ex + Math.cos(angle) * 0.35;
          res.y = ey - Math.sin(angle) * 0.35;
        }
      }
      return res;
    });

    return currentCoords.map((pt) => {
      let x1 = pt.x * cosY - pt.z * sinY;
      let z1 = pt.x * sinY + pt.z * cosY;
      let y2 = pt.y * cosP - z1 * sinP;
      return { x: cx + x1 * scale, y: cy + y2 * scale };
    });
  };

  const projectedJointPositions = getProjectedJointsCoordinates();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-140px)] min-h-[580px] lg:overflow-hidden pb-12 lg:pb-0">
      
      {/* 3D Skeleton Canvas Viewport (Mobile/Tablet First - Order 1) */}
      <div className="lg:col-span-2 order-first lg:order-none glass-card rounded-[24px] border border-[var(--border-color)] flex flex-col items-center justify-between p-4 sm:p-6 relative bg-slate-950/40 overflow-hidden group shadow-2xl w-full min-h-[420px] sm:min-h-[500px]">
        
        {/* Glowing vision backdrop */}
        <div className="absolute top-10 left-1/4 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[250px] h-[250px] bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none"></div>

        {/* Symmetry indices (Desktop absolute overlay, hidden on mobile) */}
        <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/70 backdrop-blur-md text-[10px] font-bold space-y-1.5 z-10 w-[180px] shadow-xl hidden md:block">
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

        {/* Hologram Settings Widget (Desktop absolute overlay, hidden on mobile) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end hidden md:flex">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/70 backdrop-blur-md text-[9px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
            <Orbit className="h-3 w-3 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            Direct Drag Enabled
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/70 backdrop-blur-md flex flex-col gap-1.5 items-center">
            <div className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Hologram Settings</div>
            <div className="flex bg-slate-950/60 p-1 rounded-lg border border-white/5 gap-1">
              {(['normal', 'muscle', 'stress', 'pain', 'rom', 'predict'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisMode(mode)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer ${visMode === mode ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {mode === 'predict' ? 'Guide' : mode === 'rom' ? 'ROM' : mode}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between gap-3 text-[8.5px] border-t border-white/5 pt-1.5 w-full">
              <span className="text-slate-400">Compare Previous</span>
              <button 
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`w-7 h-4 rounded-full p-0.5 transition-all duration-300 relative ${comparisonMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 ${comparisonMode ? 'translate-x-3' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Camera Control FABs (Visible on mobile & tablet) */}
        <div className="absolute bottom-4 left-4 flex gap-2 md:hidden z-20 bg-slate-900/60 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => targetYaw.current = (targetYaw.current - 15 + 360) % 360}
            className="w-9 h-9 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90"
            aria-label="Rotate Left"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => targetYaw.current = (targetYaw.current + 15) % 360}
            className="w-9 h-9 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90"
            aria-label="Rotate Right"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => targetZoom.current = Math.max(0.6, targetZoom.current - 0.15)}
            className="w-9 h-9 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button 
            onClick={() => targetZoom.current = Math.min(1.8, targetZoom.current + 0.15)}
            className="w-9 h-9 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* 3D Holographic Rendering Area */}
        <div className="flex-1 flex items-center justify-center relative w-full select-none cursor-grab active:cursor-grabbing">
          <canvas 
            ref={canvasRef} 
            width={canvasDimensions.width} 
            height={canvasDimensions.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full aspect-square border border-white/5 rounded-2xl bg-slate-950/20 shadow-inner"
          />

          {/* Floating Joint Diagnostics Card Overlay */}
          {hoveredJoint !== null && projectedJointPositions[hoveredJoint] && (
            <div 
              className="absolute p-4 rounded-2xl glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/15 text-[10px] space-y-2 pointer-events-none z-30 animate-in fade-in zoom-in-95 duration-200 w-[200px]"
              style={{ 
                left: `${projectedJointPositions[hoveredJoint].x + 20}px`, 
                top: `${projectedJointPositions[hoveredJoint].y - 60}px` 
              }}
            >
              <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                <span className="font-extrabold text-[var(--text-primary)] text-xs">
                  {baseLandmarks[hoveredJoint].name}
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold uppercase">
                  Joint #{hoveredJoint}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <div className="text-[8px] text-slate-500">ROM ANGLE</div>
                  <div className="text-white font-extrabold text-sm">{jointTelemetryData[hoveredJoint]?.rom}</div>
                </div>
                <div>
                  <div className="text-[8px] text-slate-500">CONFIDENCE</div>
                  <div className="text-emerald-400 font-extrabold text-sm">{jointTelemetryData[hoveredJoint]?.confidence}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-[9px] text-[var(--text-secondary)] font-bold tracking-wider text-center mt-3 uppercase flex items-center justify-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-slate-500 animate-pulse" />
          <span>Drag canvas space to rotate projection model</span>
        </div>
      </div>

      {/* Swipeable Insights & Telemetry Cards Deck (Mobile/Tablet Only) */}
      <div className="flex lg:hidden overflow-x-auto gap-4 scrollbar-none snap-x snap-mandatory w-full py-2 -mx-4 px-4">
        
        {/* Card 1: Symmetry */}
        <div className="glass-card rounded-2xl p-5 shrink-0 w-[280px] snap-center flex flex-col justify-between h-[155px]">
          <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <Gauge className="h-4 w-4" />
            Symmetry Indices
          </div>
          <div className="space-y-1.5 border-t border-[var(--border-color)] pt-3 flex-1 flex flex-col justify-center text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Shoulders:</span>
              <span className="text-emerald-500 font-mono">97.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Hips & Pelvis:</span>
              <span className="text-emerald-500 font-mono">98.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Risk Prediction:</span>
              <span className="text-emerald-400 uppercase font-extrabold">LOW</span>
            </div>
          </div>
        </div>

        {/* Card 2: Hologram controls */}
        <div className="glass-card rounded-2xl p-5 shrink-0 w-[280px] snap-center flex flex-col justify-between h-[155px]">
          <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <Orbit className="h-4 w-4" />
            Hologram Settings
          </div>
          <div className="space-y-2 border-t border-[var(--border-color)] pt-3 flex-1 flex flex-col justify-center">
            <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-lg border border-white/5">
              {(['normal', 'muscle', 'stress', 'pain', 'rom', 'predict'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisMode(mode)}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase transition-all ${visMode === mode ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                >
                  {mode === 'predict' ? 'Guide' : mode === 'rom' ? 'ROM' : mode}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--text-secondary)]">
              <span>Compare Previous logs</span>
              <button 
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`w-7 h-4 rounded-full p-0.5 transition-all duration-300 relative ${comparisonMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 ${comparisonMode ? 'translate-x-3' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Live Telemetry */}
        <div className="glass-card rounded-2xl p-5 shrink-0 w-[280px] snap-center flex flex-col justify-between h-[155px]">
          <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Diagnostics Output
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono border-t border-[var(--border-color)] pt-3 flex-1 items-center">
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-[7.5px] text-slate-500 block">KNEE FLEXION</span>
              <span className="text-cyan-400 text-xs font-black">{currentKneeAngle}°</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-left">
              <span className="text-[7.5px] text-slate-500 block">SHOULDER ABDUCT</span>
              <span className="text-indigo-400 text-xs font-black">{currentShoulderAngle}°</span>
            </div>
          </div>
        </div>

        {/* Card 4: Biomechanical advice */}
        <div className="glass-card rounded-2xl p-5 shrink-0 w-[280px] snap-center flex flex-col justify-between h-[155px]">
          <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            Target Advice
          </div>
          <div className="border-t border-[var(--border-color)] pt-3 flex-1 flex flex-col justify-center text-xs text-[var(--text-secondary)] font-semibold leading-snug">
            <p className="text-white font-extrabold">{jointTelemetryData[selectedJoint === 'shoulder' ? 2 : 11]?.status || 'Nominal status'}</p>
            <p className="pt-1 text-[10px]">{jointTelemetryData[selectedJoint === 'shoulder' ? 2 : 11]?.advice || 'Maintain current form'}</p>
          </div>
        </div>

      </div>

      {/* Accordion Controls Settings Panel (Right - 1/3) */}
      <div className="order-last lg:order-none glass-card rounded-[24px] p-5 border border-[var(--border-color)] flex flex-col justify-between h-auto lg:h-full lg:overflow-y-auto space-y-4">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 lg:border-none lg:pb-0">
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-brand-500" />
              Digital Twin Controls
            </h3>
            {/* Collapse toggle button for mobile/tablet */}
            <button 
              onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
              className="lg:hidden text-[var(--text-secondary)]"
              aria-label="Toggle parameters controls visibility"
            >
              {isControlsCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </button>
          </div>

          <div className={`space-y-4 ${isControlsCollapsed ? 'hidden lg:block' : 'block'}`}>
            
            {/* Accordion Item 1: Simulation Settings */}
            <div className="border border-[var(--border-color)] rounded-xl bg-slate-900/10 overflow-hidden">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'simulation' ? 'camera' : 'simulation')}
                className="w-full px-4 py-3 text-left font-extrabold text-[11px] text-[var(--text-primary)] uppercase tracking-wider bg-slate-950/20 flex justify-between items-center"
              >
                <span>1. Simulation Mode & Protocol</span>
                {expandedSection === 'simulation' ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {expandedSection === 'simulation' && (
                <div className="p-4 space-y-3">
                  <label className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">
                    Active Routine Loop
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['static', 'squat', 'abduction'] as const).map((mode) => (
                      <button 
                        key={mode}
                        onClick={() => setAnimationMode(mode)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border ${animationMode === mode ? 'bg-brand-500/10 border-brand-500 text-brand-500 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                      >
                        {mode === 'abduction' ? 'Abduct' : mode}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">
                      Highlight Kinematic Chain
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSelectedJoint('shoulder')}
                        className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer border ${selectedJoint === 'shoulder' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                      >
                        Shoulders
                      </button>
                      <button 
                        onClick={() => setSelectedJoint('knee')}
                        className={`py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer border ${selectedJoint === 'knee' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                      >
                        Knees
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 px-2.5 rounded-lg bg-slate-950/40 border border-[var(--border-color)] mt-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-[var(--text-primary)]">Joint Fluctuations</span>
                      <span className="text-[8px] text-[var(--text-secondary)] font-medium">Telemetry noise</span>
                    </div>
                    <button 
                      onClick={() => setTelemetryStream(!telemetryStream)}
                      className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 relative ${telemetryStream ? 'bg-brand-500' : 'bg-slate-800'}`}
                      aria-label="Toggle telemetry noise stream"
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${telemetryStream ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Item 2: Manual Rotation view sliders */}
            <div className="border border-[var(--border-color)] rounded-xl bg-slate-900/10 overflow-hidden">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'camera' ? 'data' : 'camera')}
                className="w-full px-4 py-3 text-left font-extrabold text-[11px] text-[var(--text-primary)] uppercase tracking-wider bg-slate-950/20 flex justify-between items-center"
              >
                <span>2. Manual Camera Calibration</span>
                {expandedSection === 'camera' ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {expandedSection === 'camera' && (
                <div className="p-4 space-y-3">
                  <div className="space-y-1 text-xs font-semibold">
                    <div className="flex justify-between items-center text-[var(--text-primary)]">
                      <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
                        <Orbit className="h-3.5 w-3.5 text-indigo-500" /> Yaw Rotation
                      </span>
                      <span className="text-[9px] bg-slate-900/60 px-1.5 py-0.5 rounded font-mono border border-white/5">{yaw}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={yaw}
                      onChange={(e) => {
                        targetYaw.current = parseInt(e.target.value);
                        setYaw(parseInt(e.target.value));
                      }}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/5"
                    />
                  </div>

                  <div className="space-y-1 text-xs font-semibold">
                    <div className="flex justify-between items-center text-[var(--text-primary)]">
                      <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
                        <Compass className="h-3.5 w-3.5 text-brand-500" /> Pitch Rotation
                      </span>
                      <span className="text-[9px] bg-slate-900/60 px-1.5 py-0.5 rounded font-mono border border-white/5">{pitch}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-45" 
                      max="45" 
                      value={pitch}
                      onChange={(e) => {
                        targetPitch.current = parseInt(e.target.value);
                        setPitch(parseInt(e.target.value));
                      }}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500 border border-white/5"
                    />
                  </div>

                  <div className="space-y-1 text-xs font-semibold">
                    <div className="flex justify-between items-center text-[var(--text-primary)]">
                      <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
                        <ZoomIn className="h-3.5 w-3.5 text-emerald-500" /> Zoom scale
                      </span>
                      <span className="text-[9px] bg-slate-900/60 px-1.5 py-0.5 rounded font-mono border border-white/5">{zoom.toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.6" 
                      max="1.8" 
                      step="0.05"
                      value={zoom}
                      onChange={(e) => {
                        targetZoom.current = parseFloat(e.target.value);
                        setZoom(parseFloat(e.target.value));
                      }}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500 border border-white/5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Item 3: Live telemetry indices details */}
            <div className="border border-[var(--border-color)] rounded-xl bg-slate-900/10 overflow-hidden">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'data' ? 'simulation' : 'data')}
                className="w-full px-4 py-3 text-left font-extrabold text-[11px] text-[var(--text-primary)] uppercase tracking-wider bg-slate-950/20 flex justify-between items-center"
              >
                <span>3. Live Biometrics Data</span>
                {expandedSection === 'data' ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {expandedSection === 'data' && (
                <div className="p-4 space-y-3 font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-[var(--border-color)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Activity className={`h-3 w-3 ${telemetryStream ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`} />
                        Diagnostics
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold leading-normal">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                        <div className="text-[8px] text-slate-500">Knee flexion</div>
                        <div className="text-cyan-400 text-sm mt-0.5">{currentKneeAngle}°</div>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                        <div className="text-[8px] text-slate-500">Shoulder Abduct</div>
                        <div className="text-indigo-400 text-sm mt-0.5">{currentShoulderAngle}°</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[var(--border-color)] space-y-1 hidden lg:block">
          <div className="text-[8.5px] uppercase tracking-wider text-slate-500 font-bold">Calibration Note</div>
          <p className="text-[9.5px] text-[var(--text-secondary)] leading-relaxed font-semibold">
            Biomechanical angles calculates joint extensions relative to on-device landmarks at 30 FPS. Drag mesh screen directly to inspect skeletal points.
          </p>
        </div>
      </div>

    </div>
  );
};

