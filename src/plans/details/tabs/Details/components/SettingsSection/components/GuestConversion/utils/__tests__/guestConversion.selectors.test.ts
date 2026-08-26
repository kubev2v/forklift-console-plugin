import { describe, expect, it } from '@jest/globals';

import { getSkipGuestConversion, getUseCompatibilityMode } from '../utils';

describe('guest conversion utils - selectors', () => {
  it('reads skipGuestConversion and useCompatibilityMode', () => {
    const plan = {
      spec: { skipGuestConversion: true, useCompatibilityMode: false },
    } as never;

    expect(getSkipGuestConversion(plan)).toBe(true);
    expect(getUseCompatibilityMode(plan)).toBe(false);
    expect(getSkipGuestConversion({} as never)).toBeUndefined();
  });
});
