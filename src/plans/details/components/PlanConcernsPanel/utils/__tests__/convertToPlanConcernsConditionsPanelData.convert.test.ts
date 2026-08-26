import { describe, expect, it } from '@jest/globals';
import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';

import { CONCERN_SOURCE } from '../types';
import { convertToPlanConcernsConditionsPanelData } from '../convertToPlanConcernsConditionsPanelData';

describe('convertToPlanConcernsConditionsPanelData - convert', () => {
  it('maps conditions and merged concerns with source preference', () => {
    const result = convertToPlanConcernsConditionsPanelData(
      [{ category: 'Critical', items: ['a', 'b'], message: 'm', type: 'Ready' }] as never,
      new Map([['Shared disk', 3], ['Inspected', 1]]),
      '/plan/url',
      new Set(['Inspected']),
    );

    expect(result[0].criticalConditionOrConcern).toEqual(
      expect.objectContaining({
        source: CONCERN_SOURCE.CONDITION,
        type: 'Ready',
        vmsNum: 2,
      }),
    );
    expect(result[1].criticalConditionOrConcern).toEqual(
      expect.objectContaining({
        severity: ConcernCategoryOptions.Critical,
        source: CONCERN_SOURCE.INVENTORY,
        type: 'Shared disk',
        vmsNum: 3,
      }),
    );
    expect(result[2].criticalConditionOrConcern.source).toBe(CONCERN_SOURCE.INSPECTION);
  });

  it('handles undefined conditions', () => {
    expect(convertToPlanConcernsConditionsPanelData(undefined, new Map(), '/p')).toEqual([]);
  });
});
