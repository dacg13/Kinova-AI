import { describe, it, expect } from 'vitest';
import { 
  createInitialSessionState, 
  evaluateFrame 
} from './rehabEngine';
import type { Point3D } from './kinematics';

describe('Rehabilitation Intelligence Engine', () => {
  // Helper to generate a default mock landmark frame
  const createMockFrame = (): Point3D[] => {
    return Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 0.9 }));
  };

  // Setup standard upright stand joints configuration
  const setupUprightFrame = (landmarks: Point3D[]) => {
    // Shoulders
    landmarks[11] = { x: -0.2, y: 0.1, z: 0, visibility: 0.9 };
    landmarks[12] = { x: 0.2, y: 0.1, z: 0, visibility: 0.9 };
    // Hips
    landmarks[23] = { x: -0.2, y: 0.5, z: 0, visibility: 0.9 };
    landmarks[24] = { x: 0.2, y: 0.5, z: 0, visibility: 0.9 };
    // Knees (180 deg extension)
    landmarks[25] = { x: -0.2, y: 0.8, z: 0, visibility: 0.9 };
    landmarks[26] = { x: 0.2, y: 0.8, z: 0, visibility: 0.9 };
    // Ankles
    landmarks[27] = { x: -0.2, y: 1.1, z: 0, visibility: 0.9 };
    landmarks[28] = { x: 0.2, y: 1.1, z: 0, visibility: 0.9 };
    // Heels
    landmarks[29] = { x: -0.22, y: 1.12, z: 0, visibility: 0.9 };
    landmarks[30] = { x: 0.22, y: 1.12, z: 0, visibility: 0.9 };
    // Toes
    landmarks[31] = { x: -0.25, y: 1.12, z: 0, visibility: 0.9 };
    landmarks[32] = { x: 0.25, y: 1.12, z: 0, visibility: 0.9 };
    // Elbows (left arm down)
    landmarks[13] = { x: -0.2, y: 0.3, z: 0, visibility: 0.9 };
    // Ear (Neck alignment upright)
    landmarks[7] = { x: -0.05, y: -0.1, z: 0, visibility: 0.9 };
    landmarks[8] = { x: 0.05, y: -0.1, z: 0, visibility: 0.9 };
  };

  describe('Session Initialization', () => {
    it('should create initial state for squat', () => {
      const state = createInitialSessionState('STANDING');
      expect(state.reps).toBe(0);
      expect(state.correctReps).toBe(0);
      expect(state.activeState).toBe('STANDING');
      expect(state.repHadError).toBe(false);
    });
  });

  describe('Squat FSM Transitions', () => {
    it('should progress through a complete squat rep correctly', () => {
      const state = createInitialSessionState('STANDING');
      const frame = createMockFrame();
      setupUprightFrame(frame);

      // 1. Stand frame
      let result = evaluateFrame(frame, 'squat', state, 1000);
      expect(result.activeState).toBe('STANDING');
      expect(result.repCount).toBe(0);

      // 2. Start flex descent (knees bending to 130 deg)
      // Left knee: 23(x:-0.2, y:0.5) -> 25(x:-0.35, y:0.8) -> 27(x:-0.2, y:1.1)
      frame[25] = { x: -0.32, y: 0.8, z: 0, visibility: 0.9 };
      frame[26] = { x: 0.32, y: 0.8, z: 0, visibility: 0.9 };
      result = evaluateFrame(frame, 'squat', state, 2000);
      expect(result.activeState).toBe('DESCENDING');

      // 3. Reach Peak Depth (knees flexed past 110 deg)
      frame[25] = { x: -0.45, y: 0.8, z: 0, visibility: 0.9 };
      frame[26] = { x: 0.45, y: 0.8, z: 0, visibility: 0.9 };
      result = evaluateFrame(frame, 'squat', state, 3000);
      expect(result.activeState).toBe('PEAK');
      expect(state.peakValue).toBeLessThanOrEqual(100);

      // 4. Rise / Ascent (knees extending to 130 deg)
      frame[25] = { x: -0.32, y: 0.8, z: 0, visibility: 0.9 };
      frame[26] = { x: 0.32, y: 0.8, z: 0, visibility: 0.9 };
      result = evaluateFrame(frame, 'squat', state, 4000);
      expect(result.activeState).toBe('ASCENDING');

      // 5. Complete extension (back to standing > 160 deg)
      frame[25] = { x: -0.2, y: 0.8, z: 0, visibility: 0.9 };
      frame[26] = { x: 0.2, y: 0.8, z: 0, visibility: 0.9 };
      result = evaluateFrame(frame, 'squat', state, 5000); // 4 seconds total elapsed
      
      expect(result.activeState).toBe('STANDING');
      expect(result.repCount).toBe(1);
      expect(result.accuracyScore).toBe(100); // No errors, correct ROM & tempo
    });

    it('should flag Knee Valgus if knees collapse inward', () => {
      const state = createInitialSessionState('STANDING');
      const frame = createMockFrame();
      setupUprightFrame(frame);

      // Start descent: widen hips and ankles
      frame[23] = { x: -0.4, y: 0.5, z: 0, visibility: 0.9 }; // Left Hip
      frame[24] = { x: 0.4, y: 0.5, z: 0, visibility: 0.9 };  // Right Hip
      frame[27] = { x: -0.4, y: 1.1, z: 0, visibility: 0.9 }; // Left Ankle
      frame[28] = { x: 0.4, y: 1.1, z: 0, visibility: 0.9 };  // Right Ankle
      
      frame[25] = { x: -0.6, y: 0.8, z: 0, visibility: 0.9 }; // Left Knee
      frame[26] = { x: 0.6, y: 0.8, z: 0, visibility: 0.9 };  // Right Knee
      evaluateFrame(frame, 'squat', state, 1000);

      // Knees collapse inward (kneeWidth 0.6 < hipWidth 0.8 * 0.85 = 0.68)
      // Angle remains flexed (knee angle is around 143 deg < 145 deg)
      frame[25] = { x: -0.3, y: 0.8, z: 0, visibility: 0.9 };
      frame[26] = { x: 0.3, y: 0.8, z: 0, visibility: 0.9 };
      
      const result = evaluateFrame(frame, 'squat', state, 1500);
      expect(result.faults.kneeValgus).toBe(true);
      expect(state.repHadError).toBe(true);
    });

    it('should flag Torso Lean if forward bend exceeds limit', () => {
      const state = createInitialSessionState('STANDING');
      const frame = createMockFrame();
      setupUprightFrame(frame);

      // Start descent
      frame[25] = { x: -0.32, y: 0.8, z: 0, visibility: 0.9 };
      frame[26] = { x: 0.32, y: 0.8, z: 0, visibility: 0.9 };
      evaluateFrame(frame, 'squat', state, 1000);

      // Lean torso forward (move shoulders forward, changing their x-coordinates relative to hips)
      // Midpoint hip (0, 0.5, 0)
      // Stand mid shoulder: shift from (0, 0.1, 0) to (0.4, 0.2, 0)
      frame[11] = { x: 0.2, y: 0.2, z: 0, visibility: 0.9 };
      frame[12] = { x: 0.6, y: 0.2, z: 0, visibility: 0.9 };

      const result = evaluateFrame(frame, 'squat', state, 1500);
      expect(result.faults.torsoLean).toBe(true);
    });
  });

  describe('Shoulder Raise checks', () => {
    it('should flag Shoulder Imbalance if shrugging occurs', () => {
      const state = createInitialSessionState('DOWN');
      const frame = createMockFrame();
      setupUprightFrame(frame);

      // Raise arm
      // Left shoulder (11) is at y=0.1. Right shoulder (12) is at y=0.1.
      // Left shoulder shrugs up (moves to y=0.01). Right stays at y=0.1.
      // Difference = 0.09 > 0.07
      frame[11] = { x: -0.2, y: 0.01, z: 0, visibility: 0.9 };
      frame[13] = { x: -0.5, y: -0.1, z: 0, visibility: 0.9 }; // Arm raising

      evaluateFrame(frame, 'shoulder_raise', state, 1000);
      
      const result = evaluateFrame(frame, 'shoulder_raise', state, 1500);
      expect(result.faults.shoulderImbalance).toBe(true);
    });
  });
});
