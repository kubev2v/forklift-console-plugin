import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getPlanTimezone } from '../selectors';

describe('getPlanTimezone', () => {
  it('returns the timezone string when set', () => {
    const plan = {
      spec: { timezone: 'America/New_York' },
    } as unknown as V1beta1Plan;

    expect(getPlanTimezone(plan)).toBe('America/New_York');
  });

  it('returns undefined when timezone is not set', () => {
    const plan = {
      spec: {},
    } as unknown as V1beta1Plan;

    expect(getPlanTimezone(plan)).toBeUndefined();
  });

  it('returns undefined when spec is undefined', () => {
    const plan = {} as unknown as V1beta1Plan;

    expect(getPlanTimezone(plan)).toBeUndefined();
  });

  it('returns undefined when plan is undefined', () => {
    expect(getPlanTimezone(undefined as unknown as V1beta1Plan)).toBeUndefined();
  });

  it('returns undefined when timezone is not a string', () => {
    const plan = {
      spec: { timezone: 123 },
    } as unknown as V1beta1Plan;

    expect(getPlanTimezone(plan)).toBeUndefined();
  });

  it('returns empty string when timezone is empty string', () => {
    const plan = {
      spec: { timezone: '' },
    } as unknown as V1beta1Plan;

    expect(getPlanTimezone(plan)).toBe('');
  });
});
