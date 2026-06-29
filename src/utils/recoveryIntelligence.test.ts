import { describe, it, expect } from 'vitest';
import { 
  calculateRecoveryAssessment 
} from './recoveryIntelligence';
import type { RepetitionLog } from './recoveryIntelligence';

describe('Recovery Intelligence Analytics Solver', () => {
  const createMockRep = (
    id: number,
    durationMs: number,
    peakRom: number,
    isCorrect: boolean,
    faultsOverride?: Partial<RepetitionLog['faults']>
  ): RepetitionLog => {
    return {
      id,
      durationMs,
      peakRom,
      isCorrect,
      faults: {
        torsoLean: false,
        kneeValgus: false,
        heelLift: false,
        poorDepth: false,
        shoulderImbalance: false,
        incorrectTempo: false,
        ...faultsOverride,
      },
    };
  };

  it('should calculate 100% scores for a perfect shoulder raise session', () => {
    const logs: RepetitionLog[] = [
      createMockRep(1, 3000, 90, true),
      createMockRep(2, 3000, 90, true),
      createMockRep(3, 3000, 90, true),
    ];

    const assessment = calculateRecoveryAssessment(logs, 'shoulder_raise', 9000);

    expect(assessment.recoveryScore).toBe(100);
    expect(assessment.formAccuracy).toBe(100);
    expect(assessment.romScore).toBe(100);
    expect(assessment.consistencyScore).toBe(100);
    expect(assessment.mostCommonMistake).toBe('None');
    expect(assessment.correctReps).toBe(3);
    expect(assessment.totalReps).toBe(3);
  });

  it('should calculate 100% scores for a perfect squat session (target Knee angle 90)', () => {
    const logs: RepetitionLog[] = [
      createMockRep(1, 4000, 90, true),
      createMockRep(2, 4000, 90, true),
      createMockRep(3, 4000, 90, true),
    ];

    const assessment = calculateRecoveryAssessment(logs, 'squat', 12000);

    expect(assessment.recoveryScore).toBe(100);
    expect(assessment.formAccuracy).toBe(100);
    expect(assessment.romScore).toBe(100);
    expect(assessment.consistencyScore).toBe(100);
    expect(assessment.mostCommonMistake).toBe('None');
  });

  it('should calculate lower consistency score for varying rep tempos', () => {
    const logs: RepetitionLog[] = [
      createMockRep(1, 1500, 90, true),
      createMockRep(2, 4500, 90, true),
      createMockRep(3, 3000, 90, true),
    ];

    const assessment = calculateRecoveryAssessment(logs, 'shoulder_raise', 9000);

    // tempos standard deviation is ~1.22 seconds
    // consistencyScore should be 100 - (1.22 * 12) = ~85
    expect(assessment.consistencyScore).toBeLessThan(95);
    expect(assessment.consistencyScore).toBeGreaterThan(70);
  });

  it('should correctly identify the most common mistake', () => {
    const logs: RepetitionLog[] = [
      createMockRep(1, 3000, 90, false, { kneeValgus: true }),
      createMockRep(2, 3000, 90, false, { kneeValgus: true }),
      createMockRep(3, 3000, 90, false, { torsoLean: true }),
    ];

    const assessment = calculateRecoveryAssessment(logs, 'squat', 9000);

    expect(assessment.mostCommonMistake).toBe('Knee Valgus');
    expect(assessment.formAccuracy).toBe(0); // 0 out of 3 correct
  });

  it('should handle an empty logs list gracefully without division by zero', () => {
    const assessment = calculateRecoveryAssessment([], 'squat', 0);

    expect(assessment.recoveryScore).toBe(100);
    expect(assessment.formAccuracy).toBe(100);
    expect(assessment.romScore).toBe(100);
    expect(assessment.consistencyScore).toBe(100);
    expect(assessment.mostCommonMistake).toBe('None');
  });
});
