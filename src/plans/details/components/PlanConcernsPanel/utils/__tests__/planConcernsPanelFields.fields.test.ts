import { describe, expect, it } from '@jest/globals';

import { planConcernsPanelFields } from '../planConcernsPanelFields';

describe('planConcernsPanelFields - fields', () => {
  it('exposes field definitions for the concerns panel', () => {
    expect(planConcernsPanelFields.length).toBe(3);
    expect(planConcernsPanelFields.map((field) => field.resourceFieldId)).toEqual([
      'severity',
      'type',
      'resource',
    ]);
  });
});
