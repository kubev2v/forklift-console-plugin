import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import { describe, expect, it } from '@jest/globals';
import { CATEGORY_TYPES } from '@utils/constants';
import { CONVERSION_LABELS, CONVERSION_PHASE } from '@utils/crds/conversion/constants';

import {
  getCriticalConcernsVmsMap,
  getCriticalInspectionConcernsVmsMap,
  mergeConcernsMaps,
} from '../utils';

const conversion = (
  vmId: string,
  phase: string,
  createdAt: string,
  concerns?: { category: string; label: string }[],
): never =>
  ({
    metadata: {
      creationTimestamp: createdAt,
      labels: { [CONVERSION_LABELS.VM_ID]: vmId },
    },
    status: {
      inspectionResult: concerns ? { concerns } : undefined,
      phase,
    },
  }) as never;

describe('plan details utils - concerns maps', () => {
  it('counts critical inventory concerns by label', () => {
    const map = getCriticalConcernsVmsMap([
      {
        inventoryVmData: {
          vm: {
            concerns: [
              { category: ConcernCategory.Critical, label: 'Shared disk' },
              { category: ConcernCategory.Warning, label: 'warn' },
            ],
          },
        },
      },
      {
        inventoryVmData: {
          vm: { concerns: [{ category: ConcernCategory.Critical, label: 'Shared disk' }] },
        },
      },
    ] as never);

    expect(map.get('Shared disk')).toBe(2);
    expect(map.has('warn')).toBe(false);
  });

  it('merges maps preferring the larger count', () => {
    const merged = mergeConcernsMaps(
      new Map([
        ['alpha', 1],
        ['beta', 5],
      ]),
      new Map([
        ['alpha', 3],
        ['keyC', 2],
      ]),
    );

    expect(Object.fromEntries(merged)).toEqual({ alpha: 3, beta: 5, keyC: 2 });
  });

  it('aggregates CRITICAL/ERROR from latest succeeded conversion per VM', () => {
    const map = getCriticalInspectionConcernsVmsMap([
      conversion('vm-1', CONVERSION_PHASE.SUCCEEDED, '2024-01-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Old concern' },
        { category: CATEGORY_TYPES.WARNING, label: 'warn' },
      ]),
      conversion('vm-1', CONVERSION_PHASE.SUCCEEDED, '2024-02-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Shared disk' },
        { category: CATEGORY_TYPES.ERROR, label: 'Bad driver' },
        { category: CATEGORY_TYPES.CRITICAL, label: 'Shared disk' },
      ]),
      conversion('vm-2', CONVERSION_PHASE.SUCCEEDED, '2024-02-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Shared disk' },
      ]),
      conversion('vm-3', CONVERSION_PHASE.FAILED, '2024-03-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Ignored' },
      ]),
      conversion('vm-4', CONVERSION_PHASE.SUCCEEDED, '2024-03-01T00:00:00Z'),
    ]);

    expect(Object.fromEntries(map)).toEqual({ 'Bad driver': 1, 'Shared disk': 2 });
    expect(map.has('Old concern')).toBe(false);
    expect(map.has('warn')).toBe(false);
    expect(map.has('Ignored')).toBe(false);
  });
});
