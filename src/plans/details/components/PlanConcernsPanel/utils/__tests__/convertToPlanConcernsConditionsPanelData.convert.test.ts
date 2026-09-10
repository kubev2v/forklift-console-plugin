import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';
import type { V1beta1PlanStatusConditions } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { convertToPlanConcernsConditionsPanelData } from '../convertToPlanConcernsConditionsPanelData';
import { CONCERN_SOURCE } from '../types';

const buildCriticalCondition = (
  overrides: Partial<V1beta1PlanStatusConditions> = {},
): V1beta1PlanStatusConditions => ({
  category: 'Critical',
  items: ['a', 'b'],
  message: 'm',
  type: 'Ready',
  ...overrides,
});

describe('convertToPlanConcernsConditionsPanelData - convert', () => {
  it('maps conditions and merged concerns with source preference', () => {
    const result = convertToPlanConcernsConditionsPanelData(
      [buildCriticalCondition()],
      new Map([
        ['Shared disk', 3],
        ['Inspected', 1],
      ]),
      '/plan/url',
      new Set(['Inspected']),
    );

    expect(result[0]).toEqual({
      criticalConditionOrConcern: {
        message: 'm',
        severity: 'Critical',
        source: CONCERN_SOURCE.CONDITION,
        type: 'Ready',
        vmsNum: 2,
      },
      planUrl: '/plan/url',
    });
    expect(result[1]).toEqual({
      criticalConditionOrConcern: {
        message: 'Shared disk',
        severity: ConcernCategoryOptions.Critical,
        source: CONCERN_SOURCE.INVENTORY,
        type: 'Shared disk',
        vmsNum: 3,
      },
      planUrl: '/plan/url',
    });
    expect(result[2]).toEqual({
      criticalConditionOrConcern: {
        message: 'Inspected',
        severity: ConcernCategoryOptions.Critical,
        source: CONCERN_SOURCE.INSPECTION,
        type: 'Inspected',
        vmsNum: 1,
      },
      planUrl: '/plan/url',
    });
  });

  it('handles undefined conditions', () => {
    expect(convertToPlanConcernsConditionsPanelData(undefined, new Map(), '/p')).toEqual([]);
  });
});
