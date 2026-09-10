import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getSkipGuestConversion, getUseCompatibilityMode } from '../utils';

type PartialPlan = {
  spec?: Partial<V1beta1Plan['spec']>;
};

const asPlan = (plan: PartialPlan): V1beta1Plan => plan as V1beta1Plan;

describe('guest conversion selectors - weakPartials', () => {
  it('reads boolean flags from plan spec', () => {
    expect(getSkipGuestConversion(asPlan({ spec: { skipGuestConversion: false } }))).toBe(false);
    expect(getUseCompatibilityMode(asPlan({ spec: { useCompatibilityMode: true } }))).toBe(true);
  });

  it('returns undefined when flags are absent', () => {
    expect(getSkipGuestConversion(asPlan({}))).toBeUndefined();
    expect(getUseCompatibilityMode(asPlan({}))).toBeUndefined();
    expect(getSkipGuestConversion(asPlan({ spec: {} }))).toBeUndefined();
    expect(getUseCompatibilityMode(asPlan({ spec: {} }))).toBeUndefined();
  });
});
