import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import type { Concern } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { CATEGORY_TYPES } from '@utils/constants';
import { CONVERSION_LABELS, CONVERSION_PHASE } from '@utils/crds/conversion/constants';
import type {
  ConversionPhase,
  InspectionConcern,
  V1beta1Conversion,
} from '@utils/crds/conversion/types';
import type { SpecVirtualMachinePageData } from '@utils/types/specVirtualMachinePageData';

import {
  getCriticalConcernsVmsMap,
  getCriticalInspectionConcernsVmsMap,
  mergeConcernsMaps,
} from '../utils';

const buildConversion = (
  vmId: string,
  phase: ConversionPhase,
  createdAt: string,
  concerns?: Pick<InspectionConcern, 'category' | 'label'>[],
): V1beta1Conversion => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Conversion',
  metadata: {
    creationTimestamp: createdAt,
    labels: { [CONVERSION_LABELS.VM_ID]: vmId },
  },
  spec: {
    connection: { secret: { name: 'secret' } },
    type: 'DeepInspection',
    vm: { id: vmId },
  },
  status: {
    inspectionResult: concerns
      ? {
          concerns: concerns.map((concern, index) => ({
            category: concern.category,
            id: String(index),
            label: concern.label,
            message: concern.label,
          })),
        }
      : undefined,
    phase,
  },
});

const buildVmPageData = (concerns: Concern[]): SpecVirtualMachinePageData =>
  ({
    inventoryVmData: { vm: { concerns } },
    plan: { metadata: { name: 'plan', namespace: 'ns' }, spec: {} },
    specVM: { id: 'vm-1' },
    targetNamespace: 'ns',
    vmIndex: 0,
  }) as unknown as SpecVirtualMachinePageData;

describe('plan details utils - concerns maps', () => {
  it('counts critical inventory concerns by label', () => {
    const map = getCriticalConcernsVmsMap([
      buildVmPageData([
        { category: ConcernCategory.Critical, label: 'Shared disk' },
        { category: ConcernCategory.Warning, label: 'warn' },
      ]),
      buildVmPageData([{ category: ConcernCategory.Critical, label: 'Shared disk' }]),
    ]);

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
      buildConversion('vm-1', CONVERSION_PHASE.SUCCEEDED, '2024-01-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Old concern' },
        { category: CATEGORY_TYPES.WARNING, label: 'warn' },
      ]),
      buildConversion('vm-1', CONVERSION_PHASE.SUCCEEDED, '2024-02-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Shared disk' },
        { category: CATEGORY_TYPES.ERROR, label: 'Bad driver' },
        { category: CATEGORY_TYPES.CRITICAL, label: 'Shared disk' },
      ]),
      buildConversion('vm-2', CONVERSION_PHASE.SUCCEEDED, '2024-02-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Shared disk' },
      ]),
      buildConversion('vm-3', CONVERSION_PHASE.FAILED, '2024-03-01T00:00:00Z', [
        { category: CATEGORY_TYPES.CRITICAL, label: 'Ignored' },
      ]),
      buildConversion('vm-4', CONVERSION_PHASE.SUCCEEDED, '2024-03-01T00:00:00Z'),
    ]);

    expect(Object.fromEntries(map)).toEqual({ 'Bad driver': 1, 'Shared disk': 2 });
    expect(map.has('Old concern')).toBe(false);
    expect(map.has('warn')).toBe(false);
    expect(map.has('Ignored')).toBe(false);
  });
});
