export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/**
 * Calculates the angle (0-180 degrees) formed between vectors ba and bc in 3D space.
 * Vertex of the angle is point b.
 */
export const calculate3DAngle = (
  a: Point3D | undefined,
  b: Point3D | undefined,
  c: Point3D | undefined,
  minVisibility: number = 0.5
): number | null => {
  if (!a || !b || !c) return null;

  // Confidence check
  if (
    (a.visibility !== undefined && a.visibility < minVisibility) ||
    (b.visibility !== undefined && b.visibility < minVisibility) ||
    (c.visibility !== undefined && c.visibility < minVisibility)
  ) {
    return null;
  }

  // Create vectors ba and bc
  const ba = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
  const bc = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: c.z - b.z,
  };

  // Dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;

  // Magnitudes
  const magBa = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBc = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  if (magBa === 0 || magBc === 0) return 0;

  // Angle in degrees
  const cosTheta = dotProduct / (magBa * magBc);
  // Clamp to avoid float precision issues out of bounds [-1, 1]
  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  const angle = Math.acos(clampedCos) * (180 / Math.PI);

  return Math.round(angle);
};

/**
 * Calculates Knee Angle: Hip -> Knee -> Ankle
 * Left: 23 -> 25 -> 27
 * Right: 24 -> 26 -> 28
 */
export const calculateKneeAngle = (landmarks: Point3D[], side: 'left' | 'right'): number | null => {
  const hip = side === 'left' ? landmarks[23] : landmarks[24];
  const knee = side === 'left' ? landmarks[25] : landmarks[26];
  const ankle = side === 'left' ? landmarks[27] : landmarks[28];
  return calculate3DAngle(hip, knee, ankle);
};

/**
 * Calculates Hip Angle: Shoulder -> Hip -> Knee
 * Left: 11 -> 23 -> 25
 * Right: 12 -> 24 -> 26
 */
export const calculateHipAngle = (landmarks: Point3D[], side: 'left' | 'right'): number | null => {
  const shoulder = side === 'left' ? landmarks[11] : landmarks[12];
  const hip = side === 'left' ? landmarks[23] : landmarks[24];
  const knee = side === 'left' ? landmarks[25] : landmarks[26];
  return calculate3DAngle(shoulder, hip, knee);
};

/**
 * Calculates Shoulder Angle: Hip -> Shoulder -> Elbow
 * Left: 23 -> 11 -> 13
 * Right: 24 -> 12 -> 14
 */
export const calculateShoulderAngle = (landmarks: Point3D[], side: 'left' | 'right'): number | null => {
  const hip = side === 'left' ? landmarks[23] : landmarks[24];
  const shoulder = side === 'left' ? landmarks[11] : landmarks[12];
  const elbow = side === 'left' ? landmarks[13] : landmarks[14];
  return calculate3DAngle(hip, shoulder, elbow);
};

/**
 * Calculates Elbow Angle: Shoulder -> Elbow -> Wrist
 * Left: 11 -> 13 -> 15
 * Right: 12 -> 14 -> 16
 */
export const calculateElbowAngle = (landmarks: Point3D[], side: 'left' | 'right'): number | null => {
  const shoulder = side === 'left' ? landmarks[11] : landmarks[12];
  const elbow = side === 'left' ? landmarks[13] : landmarks[14];
  const wrist = side === 'left' ? landmarks[15] : landmarks[16];
  return calculate3DAngle(shoulder, elbow, wrist);
};

/**
 * Calculates Ankle Angle: Knee -> Ankle -> Foot Index (toe)
 * Left: 25 -> 27 -> 31
 * Right: 26 -> 28 -> 32
 */
export const calculateAnkleAngle = (landmarks: Point3D[], side: 'left' | 'right'): number | null => {
  const knee = side === 'left' ? landmarks[25] : landmarks[26];
  const ankle = side === 'left' ? landmarks[27] : landmarks[28];
  const toe = side === 'left' ? landmarks[31] : landmarks[32];
  return calculate3DAngle(knee, ankle, toe);
};

/**
 * Calculates Torso Lean: Angle between spine vector (Hip midpoint to Shoulder midpoint) 
 * and vertical vertical gravity axis (0, -1, 0) pointing upwards.
 */
export const calculateTorsoLean = (landmarks: Point3D[], minVisibility: number = 0.5): number | null => {
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lHip = landmarks[23];
  const rHip = landmarks[24];

  if (!lShoulder || !rShoulder || !lHip || !rHip) return null;

  // Confidence check
  if (
    (lShoulder.visibility !== undefined && lShoulder.visibility < minVisibility) ||
    (rShoulder.visibility !== undefined && rShoulder.visibility < minVisibility) ||
    (lHip.visibility !== undefined && lHip.visibility < minVisibility) ||
    (rHip.visibility !== undefined && rHip.visibility < minVisibility)
  ) {
    return null;
  }

  // Calculate midpoints
  const shoulderMid = {
    x: (lShoulder.x + rShoulder.x) / 2,
    y: (lShoulder.y + rShoulder.y) / 2,
    z: (lShoulder.z + rShoulder.z) / 2,
  };
  const hipMid = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2,
    z: (lHip.z + rHip.z) / 2,
  };

  // Spine vector: pointing from hip to shoulder
  const spine = {
    x: shoulderMid.x - hipMid.x,
    y: shoulderMid.y - hipMid.y,
    z: shoulderMid.z - hipMid.z,
  };

  // Vertical vector pointing up (Note: in MediaPipe, Y increases downwards, so vertical vertical up is (0, -1, 0))
  const vertical = { x: 0, y: -1, z: 0 };

  // Dot product
  const dotProduct = spine.x * vertical.x + spine.y * vertical.y + spine.z * vertical.z;

  // Magnitudes
  const magSpine = Math.sqrt(spine.x * spine.x + spine.y * spine.y + spine.z * spine.z);
  const magVertical = 1.0;

  if (magSpine === 0) return 0;

  const cosTheta = dotProduct / (magSpine * magVertical);
  const clampedCos = Math.max(-1, Math.min(1, cosTheta));
  const angle = Math.acos(clampedCos) * (180 / Math.PI);

  return Math.round(angle);
};

/**
 * Calculates Neck cervical Angle: Ear midpoint -> Shoulder midpoint -> Hip midpoint
 */
export const calculateNeckAngle = (landmarks: Point3D[], minVisibility: number = 0.5): number | null => {
  const lEar = landmarks[7];
  const rEar = landmarks[8];
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lHip = landmarks[23];
  const rHip = landmarks[24];

  if (!lEar || !rEar || !lShoulder || !rShoulder || !lHip || !rHip) return null;

  // Confidence check
  if (
    (lEar.visibility !== undefined && lEar.visibility < minVisibility) ||
    (rEar.visibility !== undefined && rEar.visibility < minVisibility) ||
    (lShoulder.visibility !== undefined && lShoulder.visibility < minVisibility) ||
    (rShoulder.visibility !== undefined && rShoulder.visibility < minVisibility) ||
    (lHip.visibility !== undefined && lHip.visibility < minVisibility) ||
    (rHip.visibility !== undefined && rHip.visibility < minVisibility)
  ) {
    return null;
  }

  // Calculate midpoints
  const earMid = {
    x: (lEar.x + rEar.x) / 2,
    y: (lEar.y + rEar.y) / 2,
    z: (lEar.z + rEar.z) / 2,
  };
  const shoulderMid = {
    x: (lShoulder.x + rShoulder.x) / 2,
    y: (lShoulder.y + rShoulder.y) / 2,
    z: (lShoulder.z + rShoulder.z) / 2,
  };
  const hipMid = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2,
    z: (lHip.z + rHip.z) / 2,
  };

  return calculate3DAngle(earMid, shoulderMid, hipMid);
};
