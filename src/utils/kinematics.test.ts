import { describe, it, expect } from 'vitest';
import { 
  calculate3DAngle, 
  calculateKneeAngle, 
  calculateShoulderAngle,
  calculateTorsoLean,
  calculateNeckAngle
} from './kinematics';
import type { Point3D } from './kinematics';

describe('Joint Angle Trigonometry Solver', () => {
  describe('calculate3DAngle', () => {
    it('should return 90 degrees for orthogonal vectors', () => {
      const a: Point3D = { x: 1, y: 0, z: 0, visibility: 0.9 };
      const b: Point3D = { x: 0, y: 0, z: 0, visibility: 0.9 };
      const c: Point3D = { x: 0, y: 1, z: 0, visibility: 0.9 };
      
      const angle = calculate3DAngle(a, b, c);
      expect(angle).toBe(90);
    });

    it('should return 180 degrees for opposite collinear vectors', () => {
      const a: Point3D = { x: 1, y: 0, z: 0, visibility: 0.9 };
      const b: Point3D = { x: 0, y: 0, z: 0, visibility: 0.9 };
      const c: Point3D = { x: -1, y: 0, z: 0, visibility: 0.9 };
      
      const angle = calculate3DAngle(a, b, c);
      expect(angle).toBe(180);
    });

    it('should return 45 degrees for acute vectors', () => {
      const a: Point3D = { x: 1, y: 0, z: 0, visibility: 0.9 };
      const b: Point3D = { x: 0, y: 0, z: 0, visibility: 0.9 };
      const c: Point3D = { x: 1, y: 1, z: 0, visibility: 0.9 }; // vector along y = x
      
      const angle = calculate3DAngle(a, b, c);
      expect(angle).toBe(45);
    });

    it('should return null if any joint falls below the visibility confidence threshold', () => {
      const a: Point3D = { x: 1, y: 0, z: 0, visibility: 0.9 };
      const b: Point3D = { x: 0, y: 0, z: 0, visibility: 0.4 }; // Low confidence
      const c: Point3D = { x: 0, y: 1, z: 0, visibility: 0.9 };
      
      const angle = calculate3DAngle(a, b, c);
      expect(angle).toBeNull();
    });

    it('should handle zero length vectors gracefully', () => {
      const a: Point3D = { x: 0, y: 0, z: 0, visibility: 0.9 };
      const b: Point3D = { x: 0, y: 0, z: 0, visibility: 0.9 };
      const c: Point3D = { x: 0, y: 0, z: 0, visibility: 0.9 };
      
      const angle = calculate3DAngle(a, b, c);
      expect(angle).toBe(0);
    });
  });

  describe('Joint-Specific Calculators', () => {
    // Generate a template landmark array of size 33 populated with default coordinates
    const createMockLandmarks = (): Point3D[] => {
      return Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0, visibility: 0.8 }));
    };

    it('should calculate Knee Angle correctly', () => {
      const landmarks = createMockLandmarks();
      // Left Knee: Hip (23) -> Knee (25) -> Ankle (27)
      landmarks[23] = { x: 0, y: 1, z: 0, visibility: 0.9 };
      landmarks[25] = { x: 0, y: 0, z: 0, visibility: 0.9 };
      landmarks[27] = { x: 1, y: 0, z: 0, visibility: 0.9 };

      const leftKnee = calculateKneeAngle(landmarks, 'left');
      expect(leftKnee).toBe(90);
    });

    it('should calculate Shoulder Angle correctly', () => {
      const landmarks = createMockLandmarks();
      // Left Shoulder: Hip (23) -> Shoulder (11) -> Elbow (13)
      landmarks[23] = { x: 0, y: -1, z: 0, visibility: 0.9 };
      landmarks[11] = { x: 0, y: 0, z: 0, visibility: 0.9 };
      landmarks[13] = { x: 1, y: 0, z: 0, visibility: 0.9 };

      const leftShoulder = calculateShoulderAngle(landmarks, 'left');
      expect(leftShoulder).toBe(90);
    });

    it('should calculate Torso Lean relative to vertical gravity vector', () => {
      const landmarks = createMockLandmarks();
      // Shoulders: L (11), R (12). Hips: L (23), R (24).
      // If patient stands upright: Hips are at y=1, shoulders at y=0.
      landmarks[11] = { x: -0.2, y: 0, z: 0, visibility: 0.9 };
      landmarks[12] = { x: 0.2, y: 0, z: 0, visibility: 0.9 };
      landmarks[23] = { x: -0.2, y: 1, z: 0, visibility: 0.9 };
      landmarks[24] = { x: 0.2, y: 1, z: 0, visibility: 0.9 };

      // Spine vector is (0, -1, 0) pointing up. Vertical vector is (0, -1, 0).
      // Angle should be 0 degrees (upright standing).
      const leanUpright = calculateTorsoLean(landmarks);
      expect(leanUpright).toBe(0);

      // Leaning 45 degrees to the right:
      // Hips at midpoint (0, 1, 0)
      // Shoulders shifted so midpoint is (0.707, 0.293, 0)
      // Spine vector is (0.707, -0.707, 0)
      landmarks[11] = { x: 0.507, y: 0.293, z: 0, visibility: 0.9 };
      landmarks[12] = { x: 0.907, y: 0.293, z: 0, visibility: 0.9 };
      
      const leanBent = calculateTorsoLean(landmarks);
      expect(leanBent).toBe(45);
    });

    it('should calculate Neck Angle correctly', () => {
      const landmarks = createMockLandmarks();
      // Neck: Ear midpoint (7/8) -> Shoulder midpoint (11/12) -> Hip midpoint (23/24)
      // Ear mid: (0, -0.5, 0)
      // Shoulder mid: (0, 0, 0)
      // Hip mid: (0, 1, 0)
      // Orthogonal vectors? Ear is (0, -0.5, 0) -> direction is up. Hip is (0, 1, 0) -> direction is down.
      // They are collinear in opposite directions: angle is 180 degrees.
      landmarks[7] = { x: -0.1, y: -0.5, z: 0, visibility: 0.9 };
      landmarks[8] = { x: 0.1, y: -0.5, z: 0, visibility: 0.9 };
      landmarks[11] = { x: -0.2, y: 0, z: 0, visibility: 0.9 };
      landmarks[12] = { x: 0.2, y: 0, z: 0, visibility: 0.9 };
      landmarks[23] = { x: -0.2, y: 1, z: 0, visibility: 0.9 };
      landmarks[24] = { x: 0.2, y: 1, z: 0, visibility: 0.9 };

      const neckAngle = calculateNeckAngle(landmarks);
      expect(neckAngle).toBe(180);
    });
  });
});
