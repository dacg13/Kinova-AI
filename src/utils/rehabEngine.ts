import { 
  calculateKneeAngle, 
  calculateHipAngle, 
  calculateShoulderAngle, 
  calculateTorsoLean 
} from './kinematics';
import type { Point3D } from './kinematics';

export interface RehabSessionState {
  reps: number;
  correctReps: number;
  activeState: string;
  phaseStartTime: number;
  peakValue: number; // Holds min/max ROM depending on exercise
  activeFaults: {
    torsoLean: boolean;
    kneeValgus: boolean;
    heelLift: boolean;
    poorDepth: boolean;
    shoulderImbalance: boolean;
    incorrectTempo: boolean;
  };
  repHadError: boolean;
}

export interface JointFeedback {
  currentAngle: number;
  idealAngle: number;
  difference: number;
  correction: string;
  reason: string;
  confidence: number;
}

export interface AssessmentResult {
  isRepCompleted: boolean;
  activeState: string;
  repCount: number;
  accuracyScore: number;
  telemetry: JointFeedback;
  faults: {
    torsoLean: boolean;
    kneeValgus: boolean;
    heelLift: boolean;
    poorDepth: boolean;
    shoulderImbalance: boolean;
    incorrectTempo: boolean;
  };
}

/**
 * Creates a blank, initialized session state for rehab exercises.
 */
export const createInitialSessionState = (initialState: string): RehabSessionState => {
  return {
    reps: 0,
    correctReps: 0,
    activeState: initialState,
    phaseStartTime: 0,
    peakValue: initialState === 'STANDING' || initialState === 'SITTING' ? 180 : 0,
    activeFaults: {
      torsoLean: false,
      kneeValgus: false,
      heelLift: false,
      poorDepth: false,
      shoulderImbalance: false,
      incorrectTempo: false,
    },
    repHadError: false,
  };
};

/**
 * Main evaluation frame engine for Kinova AI rehabilitation intelligence.
 */
export const evaluateFrame = (
  landmarks: Point3D[],
  exercise: 'squat' | 'shoulder_raise' | 'sit_to_stand',
  state: RehabSessionState,
  timestamp: number
): AssessmentResult => {
  let isRepCompleted = false;

  // Load dynamic prescription target from local storage
  let targetAngle = exercise === 'sit_to_stand' ? 180 : 90;
  if (typeof localStorage !== 'undefined') {
    const savedAngle = localStorage.getItem('prescription_active_angle');
    if (savedAngle) {
      targetAngle = parseInt(savedAngle);
    }
  }

  // Confidence calculations based on landmark visibilities
  const visibilities = landmarks.map((l) => l.visibility ?? 1.0);
  const avgVis = visibilities.length > 0 
    ? visibilities.reduce((acc, curr) => acc + curr, 0) / visibilities.length 
    : 0;
  const confidence = Math.round(avgVis * 100);

  // Initialize feedback defaults
  let telemetry: JointFeedback = {
    currentAngle: 180,
    idealAngle: 180,
    difference: 0,
    correction: 'Position yourself upright to begin exercise.',
    reason: 'Aligning postural joints.',
    confidence,
  };

  if (!landmarks || landmarks.length < 33) {
    return {
      isRepCompleted: false,
      activeState: state.activeState,
      repCount: state.reps,
      accuracyScore: state.reps > 0 ? Math.round((state.correctReps / state.reps) * 100) : 100,
      telemetry,
      faults: { ...state.activeFaults },
    };
  }

  // Define calculations
  const lKnee = calculateKneeAngle(landmarks, 'left') ?? 180;
  const rKnee = calculateKneeAngle(landmarks, 'right') ?? 180;
  const avgKnee = Math.round((lKnee + rKnee) / 2);

  const lHip = calculateHipAngle(landmarks, 'left') ?? 180;
  const rHip = calculateHipAngle(landmarks, 'right') ?? 180;
  const avgHip = Math.round((lHip + rHip) / 2);

  const lShoulder = calculateShoulderAngle(landmarks, 'left') ?? 0;
  // Unilateral shoulder raise tracks left side primarily in our arena
  const activeShoulder = lShoulder;

  const leanDegree = calculateTorsoLean(landmarks) ?? 0;

  // ----------------------------------------------------
  // SQUAT FINITE STATE MACHINE & FAULTS
  // ----------------------------------------------------
  if (exercise === 'squat') {
    telemetry.currentAngle = avgKnee;
    telemetry.idealAngle = targetAngle; // Standard clinical target squat flexion
    telemetry.difference = Math.max(0, avgKnee - targetAngle);

    // FSM State transitions
    if (state.activeState === 'STANDING') {
      if (avgKnee < 145) {
        state.activeState = 'DESCENDING';
        state.phaseStartTime = timestamp;
        state.peakValue = avgKnee; // Min knee angle tracked
        state.repHadError = false;
        // Reset faults for active rep
        Object.keys(state.activeFaults).forEach((k) => {
          state.activeFaults[k as keyof typeof state.activeFaults] = false;
        });
      }
    } else if (state.activeState === 'DESCENDING') {
      state.peakValue = Math.min(state.peakValue, avgKnee);

      // Transition to peak flex
      if (avgKnee <= targetAngle + 20) {
        state.activeState = 'PEAK';
      } else if (avgKnee > targetAngle + 65) {
        // Aborted rep
        state.activeState = 'STANDING';
      }
    } else if (state.activeState === 'PEAK') {
      state.peakValue = Math.min(state.peakValue, avgKnee);

      if (avgKnee > 115) {
        state.activeState = 'ASCENDING';
      }
    } else if (state.activeState === 'ASCENDING') {
      if (avgKnee >= 155) {
        // Rep complete!
        state.activeState = 'STANDING';
        state.reps += 1;
        isRepCompleted = true;

        // Verify Tempo
        const elapsed = timestamp - state.phaseStartTime;
        if (elapsed < 2500) {
          state.activeFaults.incorrectTempo = true;
          state.repHadError = true;
        }

        // Verify Depth
        if (state.peakValue > targetAngle + 15) {
          state.activeFaults.poorDepth = true;
          state.repHadError = true;
        }

        if (!state.repHadError) {
          state.correctReps += 1;
        }
      }
    }

    // Biomechanical Squat Fault Evaluators
    if (state.activeState === 'DESCENDING' || state.activeState === 'PEAK') {
      // 1. Torso lean forward check (lean relative to gravity)
      if (leanDegree > 35) {
        state.activeFaults.torsoLean = true;
        state.repHadError = true;
      }

      // 2. Knee valgus collapse check (Knees distance < Hips distance * 0.85)
      const lKneePoint = landmarks[25];
      const rKneePoint = landmarks[26];
      const lHipPoint = landmarks[23];
      const rHipPoint = landmarks[24];
      if (lKneePoint && rKneePoint && lHipPoint && rHipPoint) {
        const kneeWidth = Math.abs(lKneePoint.x - rKneePoint.x);
        const hipWidth = Math.abs(lHipPoint.x - rHipPoint.x);
        if (kneeWidth < hipWidth * 0.85) {
          state.activeFaults.kneeValgus = true;
          state.repHadError = true;
        }
      }

      // 3. Heel lift check (Heel y-height compared to toes)
      const lHeel = landmarks[29];
      const lToe = landmarks[31];
      const rHeel = landmarks[30];
      const rToe = landmarks[32];
      if (lHeel && lToe && rHeel && rToe) {
        // y increases downwards, so heel lift means heel y is smaller (higher) than toe
        if (lHeel.y < lToe.y - 0.03 || rHeel.y < rToe.y - 0.03) {
          state.activeFaults.heelLift = true;
          state.repHadError = true;
        }
      }
    }

    // Populate feedback explanations
    if (state.activeFaults.kneeValgus) {
      telemetry.correction = 'Push your knees outward.';
      telemetry.reason = 'Knee valgus collapse increases ACL stress.';
    } else if (state.activeFaults.torsoLean) {
      telemetry.correction = 'Keep your chest upright.';
      telemetry.reason = 'Excessive torso lean puts high shear load on lumbar spine.';
    } else if (state.activeFaults.heelLift) {
      telemetry.correction = 'Keep your heels flat on the floor.';
      telemetry.reason = 'Heels rising shifts loading force to patellar tendon.';
    } else if (state.activeState === 'PEAK') {
      if (state.peakValue <= targetAngle + 10) {
        telemetry.correction = 'Hold peak depth, then slowly rise.';
        telemetry.reason = 'Excellent depth achieved.';
      } else {
        telemetry.correction = `Squat deeper to reach ${targetAngle} degrees.`;
        telemetry.reason = 'Poor depth restricts gluteal recruitment.';
      }
    } else {
      telemetry.correction = 'Lower your hips slowly back and down.';
      telemetry.reason = 'Maintain weight on heels and a neutral spine.';
    }
  }

  // ----------------------------------------------------
  // SHOULDER RAISE FINITE STATE MACHINE & FAULTS
  // ----------------------------------------------------
  else if (exercise === 'shoulder_raise') {
    telemetry.currentAngle = activeShoulder;
    telemetry.idealAngle = targetAngle; // Horizontal raise target
    telemetry.difference = Math.max(0, targetAngle - activeShoulder);

    if (state.activeState === 'DOWN') {
      if (activeShoulder > 45) {
        state.activeState = 'ASCENDING';
        state.phaseStartTime = timestamp;
        state.peakValue = activeShoulder; // Max shoulder angle tracked
        state.repHadError = false;
        Object.keys(state.activeFaults).forEach((k) => {
          state.activeFaults[k as keyof typeof state.activeFaults] = false;
        });
      }
    } else if (state.activeState === 'ASCENDING') {
      state.peakValue = Math.max(state.peakValue, activeShoulder);

      if (activeShoulder >= targetAngle - 10) {
        state.activeState = 'PEAK';
      } else if (activeShoulder < targetAngle - 55) {
        state.activeState = 'DOWN';
      }
    } else if (state.activeState === 'PEAK') {
      state.peakValue = Math.max(state.peakValue, activeShoulder);

      if (activeShoulder < 72) {
        state.activeState = 'DESCENDING';
      }
    } else if (state.activeState === 'DESCENDING') {
      if (activeShoulder <= 35) {
        state.activeState = 'DOWN';
        state.reps += 1;
        isRepCompleted = true;

        const elapsed = timestamp - state.phaseStartTime;
        if (elapsed < 2000) {
          state.activeFaults.incorrectTempo = true;
          state.repHadError = true;
        }

        if (state.peakValue < targetAngle - 10) {
          state.activeFaults.poorDepth = true;
          state.repHadError = true;
        }

        if (!state.repHadError) {
          state.correctReps += 1;
        }
      }
    }

    // Shoulder Raise Fault Checks
    if (state.activeState === 'ASCENDING' || state.activeState === 'PEAK') {
      // 1. Torso lateral lean check (compensating by bending spine)
      if (leanDegree > 12) {
        state.activeFaults.torsoLean = true;
        state.repHadError = true;
      }

      // 2. Shoulder imbalance / shrugging check (slope of shoulders line)
      const lSh = landmarks[11];
      const rSh = landmarks[12];
      if (lSh && rSh) {
        const shSlope = Math.abs(lSh.y - rSh.y);
        // y difference greater than threshold indicates shrugging or tilt
        if (shSlope > 0.07) {
          state.activeFaults.shoulderImbalance = true;
          state.repHadError = true;
        }
      }
    }

    // Populate feedback explanations
    if (state.activeFaults.shoulderImbalance) {
      telemetry.correction = 'Keep your shoulders level. Do not shrug.';
      telemetry.reason = 'Elevating the shoulder girdle compensatively flags upper trapezius dominance.';
    } else if (state.activeFaults.torsoLean) {
      telemetry.correction = 'Keep your trunk stable. Do not lean.';
      telemetry.reason = 'Swaying torso compensates for weak lateral deltoids.';
    } else if (state.activeState === 'PEAK') {
      if (state.peakValue >= targetAngle - 5) {
        telemetry.correction = 'Hold peak for a second, then lower arm.';
        telemetry.reason = 'Target abduction range of motion reached.';
      } else {
        telemetry.correction = `Raise arm higher to ${targetAngle} degrees.`;
        telemetry.reason = 'Peak ROM below prescribed shoulder target.';
      }
    } else {
      telemetry.correction = 'Raise your arm slowly out to the side.';
      telemetry.reason = 'Control concentric speed, focus on deltoid load.';
    }
  }

  // ----------------------------------------------------
  // SIT-TO-STAND FINITE STATE MACHINE & FAULTS
  // ----------------------------------------------------
  else if (exercise === 'sit_to_stand') {
    telemetry.currentAngle = avgKnee;
    telemetry.idealAngle = targetAngle; // Stand upright target extension
    telemetry.difference = Math.max(0, targetAngle - avgKnee);

    if (state.activeState === 'SITTING') {
      // Transition out of sit (requires knee and hip extension)
      if (avgKnee > 105 && avgHip > 105) {
        state.activeState = 'ASCENDING';
        state.phaseStartTime = timestamp;
        state.peakValue = avgKnee; // Max standing extension angle
        state.repHadError = false;
        Object.keys(state.activeFaults).forEach((k) => {
          state.activeFaults[k as keyof typeof state.activeFaults] = false;
        });
      }
    } else if (state.activeState === 'ASCENDING') {
      state.peakValue = Math.max(state.peakValue, avgKnee);

      if (avgKnee >= targetAngle - 25) {
        state.activeState = 'STANDING';
      } else if (avgKnee < targetAngle - 80) {
        state.activeState = 'SITTING';
      }
    } else if (state.activeState === 'STANDING') {
      state.peakValue = Math.max(state.peakValue, avgKnee);

      if (avgKnee < 140) {
        state.activeState = 'DESCENDING';
      }
    } else if (state.activeState === 'DESCENDING') {
      if (avgKnee <= 100) {
        state.activeState = 'SITTING';
        state.reps += 1;
        isRepCompleted = true;

        // Verify Tempo of rising phase
        const elapsed = timestamp - state.phaseStartTime;
        if (elapsed < 1500) {
          state.activeFaults.incorrectTempo = true;
          state.repHadError = true;
        }

        if (!state.repHadError) {
          state.correctReps += 1;
        }
      }
    }

    // Sit-to-Stand Fault Checks
    if (state.activeState === 'ASCENDING') {
      // 1. Torso lean check: leaning excessively forward to push off
      if (leanDegree > 40) {
        state.activeFaults.torsoLean = true;
        state.repHadError = true;
      }

      // 2. Knee valgus collapse check
      const lKneePoint = landmarks[25];
      const rKneePoint = landmarks[26];
      const lHipPoint = landmarks[23];
      const rHipPoint = landmarks[24];
      if (lKneePoint && rKneePoint && lHipPoint && rHipPoint) {
        const kneeWidth = Math.abs(lKneePoint.x - rKneePoint.x);
        const hipWidth = Math.abs(lHipPoint.x - rHipPoint.x);
        if (kneeWidth < hipWidth * 0.85) {
          state.activeFaults.kneeValgus = true;
          state.repHadError = true;
        }
      }

      // 3. Hip asymmetry check (one side rising faster)
      const lHipPointNode = landmarks[23];
      const rHipPointNode = landmarks[24];
      if (lHipPointNode && rHipPointNode) {
        const hipSlope = Math.abs(lHipPointNode.y - rHipPointNode.y);
        if (hipSlope > 0.05) {
          state.activeFaults.shoulderImbalance = true; // Use shoulderImbalance flag for asymmetry
          state.repHadError = true;
        }
      }
    }

    // Populate feedback explanations
    if (state.activeFaults.kneeValgus) {
      telemetry.correction = 'Keep knees aligned with feet.';
      telemetry.reason = 'Knee valgus during push-off causes joint loading asymmetry.';
    } else if (state.activeFaults.torsoLean) {
      telemetry.correction = 'Minimize forward lean. Push with thighs.';
      telemetry.reason = 'Leaning forward excessively uses momentum instead of quadriceps force.';
    } else if (state.activeFaults.shoulderImbalance) {
      telemetry.correction = 'Stand up evenly on both legs.';
      telemetry.reason = 'Asymmetric hip rise indicates muscular loading imbalances.';
    } else if (state.activeState === 'STANDING') {
      telemetry.correction = 'Squeeze glutes and hold vertical balance.';
      telemetry.reason = 'Full vertical stance achieved.';
    } else {
      telemetry.correction = 'Stand upright slowly using leg muscles.';
      telemetry.reason = 'Avoid using hand push-offs if possible.';
    }
  }

  const accuracy = state.reps > 0 ? Math.round((state.correctReps / state.reps) * 100) : 100;

  return {
    isRepCompleted,
    activeState: state.activeState,
    repCount: state.reps,
    accuracyScore: accuracy,
    telemetry,
    faults: { ...state.activeFaults },
  };
};
