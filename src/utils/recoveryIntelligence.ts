export interface RepetitionLog {
  id: number;
  durationMs: number;
  peakRom: number;
  faults: {
    torsoLean: boolean;
    kneeValgus: boolean;
    heelLift: boolean;
    poorDepth: boolean;
    shoulderImbalance: boolean;
    incorrectTempo: boolean;
  };
  isCorrect: boolean;
}

export interface RecoveryAssessment {
  recoveryScore: number;
  formAccuracy: number;
  meanRom: number;
  romScore: number;
  consistencyScore: number;
  repQuality: number;
  sessionDurationSec: number;
  mostCommonMistake: string;
  totalReps: number;
  correctReps: number;
  insights: string[];
}

/**
 * Calculates Recovery Intelligence statistics for a completed exercise session.
 * Never uses random numbers. All values are derived mathematically.
 */
export const calculateRecoveryAssessment = (
  repLogs: RepetitionLog[],
  exercise: 'squat' | 'shoulder_raise' | 'sit_to_stand',
  sessionDurationMs: number
): RecoveryAssessment => {
  const totalReps = repLogs.length;
  const correctReps = repLogs.filter((log) => log.isCorrect).length;
  const sessionDurationSec = Math.round(sessionDurationMs / 1000);

  // 1. Form Accuracy
  const formAccuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 100;

  // 2. Mean ROM
  const sumRom = repLogs.reduce((acc, curr) => acc + curr.peakRom, 0);
  const meanRom = totalReps > 0 ? Math.round(sumRom / totalReps) : (exercise === 'shoulder_raise' ? 0 : 180);

  // 3. ROM Score
  // Ideal ROM is 90 degrees for shoulder raise (abduction) and squats (knee flexion)
  let romScore = 100;
  if (totalReps > 0) {
    if (exercise === 'shoulder_raise') {
      // Abduction: target is >= 90 degrees
      romScore = Math.min(100, Math.round((meanRom / 90) * 100));
    } else {
      // Squat / Sit-to-stand knee flexion: target knee angle is <= 90 degrees (starting from 180 standing)
      // Flexion range = 180 - meanRom. Target flexion range = 90
      const flexionAchieved = 180 - meanRom;
      romScore = Math.min(100, Math.max(0, Math.round((flexionAchieved / 90) * 100)));
    }
  }

  // 4. Consistency Score (based on tempo variation)
  let consistencyScore = 100;
  if (totalReps > 1) {
    const temposSec = repLogs.map((log) => log.durationMs / 1000);
    
    // Find median tempo
    const sortedTempos = [...temposSec].sort((a, b) => a - b);
    const medianTempo = sortedTempos[Math.floor(sortedTempos.length / 2)];
    
    // Discard tempo anomalies that are shorter than 0.5x median or longer than 2.0x median
    const filteredTempos = temposSec.filter(
      (t) => t >= medianTempo * 0.5 && t <= medianTempo * 2.0
    );

    const activeTempos = filteredTempos.length > 1 ? filteredTempos : temposSec;
    const meanTempo = activeTempos.reduce((acc, curr) => acc + curr, 0) / activeTempos.length;
    
    // Variance calculation
    const variance = activeTempos.reduce((acc, curr) => acc + Math.pow(curr - meanTempo, 2), 0) / activeTempos.length;
    const stdDev = Math.sqrt(variance);

    // Consistency rating drops with higher tempo standard deviation
    consistencyScore = Math.max(40, Math.min(100, Math.round(100 - stdDev * 12)));
  }

  // 5. Most Common Mistake Scanner
  const mistakeCounts = {
    'Torso Lean': 0,
    'Knee Valgus': 0,
    'Heel Lift': 0,
    'Poor Depth': 0,
    'Shoulder Imbalance': 0,
    'Incorrect Tempo': 0,
  };

  repLogs.forEach((log) => {
    if (log.faults.torsoLean) mistakeCounts['Torso Lean'] += 1;
    if (log.faults.kneeValgus) mistakeCounts['Knee Valgus'] += 1;
    if (log.faults.heelLift) mistakeCounts['Heel Lift'] += 1;
    if (log.faults.poorDepth) mistakeCounts['Poor Depth'] += 1;
    if (log.faults.shoulderImbalance) mistakeCounts['Shoulder Imbalance'] += 1;
    if (log.faults.incorrectTempo) mistakeCounts['Incorrect Tempo'] += 1;
  });

  let mostCommonMistake = 'None';
  let maxCount = 0;
  Object.entries(mistakeCounts).forEach(([mistake, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMistake = mistake;
    }
  });

  // 6. Overall Quality Score
  const repQuality = Math.round((formAccuracy + romScore) / 2);

  // 7. Overall Weighted Recovery Score
  // 40% Accuracy, 30% ROM Score, 30% Consistency
  const recoveryScore = Math.round(
    formAccuracy * 0.4 +
    romScore * 0.3 +
    consistencyScore * 0.3
  );

  // 8. Generate personalized clinical insights
  const insights: string[] = [];
  if (totalReps > 0) {
    if (recoveryScore >= 90) {
      insights.push('Excellent session control. You are maintaining core alignment and muscular target targets.');
    } else {
      insights.push('Good effort. Focus on slowing down the movement to maintain control during transitions.');
    }

    if (formAccuracy < 80) {
      if (mostCommonMistake === 'Torso Lean') {
        insights.push('Lumbar compensation: keep your chest upright and head up to prevent forward torso lean.');
      } else if (mostCommonMistake === 'Knee Valgus') {
        insights.push('Knee tracking fault: focus on driving knees outward over your toes to avoid valgus loading.');
      } else if (mostCommonMistake === 'Heel Lift') {
        insights.push('Weight shifting: keep your heels firmly anchored to load gluteals rather than the patellar tendon.');
      } else if (mostCommonMistake === 'Shoulder Imbalance') {
        insights.push('Asymmetric shrug: keep your neck relaxed and shoulders level. Do not shrug to lift.');
      }
    }

    if (romScore < 85) {
      insights.push('Range of Motion: try to descend/extend fully to target peak muscular recruitment.');
    }

    if (consistencyScore < 80) {
      insights.push('Pacing drift: try counting 2 seconds during descent/lifting, 1 second hold, and 2 seconds back.');
    }
  } else {
    insights.push('No reps logged. Position yourself in the bounding box to capture movement.');
  }

  return {
    recoveryScore,
    formAccuracy,
    meanRom,
    romScore,
    consistencyScore,
    repQuality,
    sessionDurationSec,
    mostCommonMistake,
    totalReps,
    correctReps,
    insights,
  };
};
