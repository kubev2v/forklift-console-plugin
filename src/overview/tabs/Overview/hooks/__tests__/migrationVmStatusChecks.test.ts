import type { V1beta1MigrationStatusVms } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { isCanceled, isFailed, isRunning, isSucceeded } from '../migrationVmStatusChecks';

const vm = (
  conditions: { status?: string; type: string }[] = [],
  phase?: string,
): V1beta1MigrationStatusVms => ({ conditions, phase }) as unknown as V1beta1MigrationStatusVms;

describe('migrationVmStatusChecks', () => {
  describe('isCanceled', () => {
    it('returns true when Canceled condition has status True', () => {
      expect(isCanceled(vm([{ status: 'True', type: 'Canceled' }]))).toBe(true);
    });

    it('returns false when Canceled condition has status False', () => {
      expect(isCanceled(vm([{ status: 'False', type: 'Canceled' }]))).toBe(false);
    });
  });

  describe('isFailed', () => {
    it('returns true when Failed condition has status True', () => {
      expect(isFailed(vm([{ status: 'True', type: 'Failed' }]))).toBe(true);
    });

    it('returns false when Failed condition has status False', () => {
      expect(isFailed(vm([{ status: 'False', type: 'Failed' }]))).toBe(false);
    });
  });

  describe('isSucceeded', () => {
    it('returns true when Succeeded condition has status True', () => {
      expect(isSucceeded(vm([{ status: 'True', type: 'Succeeded' }]))).toBe(true);
    });

    it('returns false when Succeeded condition has status False', () => {
      expect(isSucceeded(vm([{ status: 'False', type: 'Succeeded' }]))).toBe(false);
    });

    it('returns false when no conditions', () => {
      expect(isSucceeded(vm())).toBe(false);
    });
  });

  describe('isRunning', () => {
    it('returns true when no terminal condition and phase is not Completed', () => {
      expect(isRunning(vm([], 'CopyingDisks'))).toBe(true);
    });

    it('returns false when Succeeded condition is True', () => {
      expect(isRunning(vm([{ status: 'True', type: 'Succeeded' }]))).toBe(false);
    });

    it('inherits fix: treats False conditions as non-terminal', () => {
      expect(isRunning(vm([{ status: 'False', type: 'Succeeded' }], 'CopyingDisks'))).toBe(true);
    });
  });
});
