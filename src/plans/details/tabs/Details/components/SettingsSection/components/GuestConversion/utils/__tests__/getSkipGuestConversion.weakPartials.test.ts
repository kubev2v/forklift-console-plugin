import { describe, expect, it } from '@jest/globals';

import { getSkipGuestConversion, getUseCompatibilityMode } from '../utils';

describe('guest conversion selectors - weakPartials', () => {
  it('reads boolean flags from plan spec', () => {
    expect(getSkipGuestConversion({ spec: { skipGuestConversion: false } } as never)).toBe(false);
    expect(getUseCompatibilityMode({ spec: { useCompatibilityMode: true } } as never)).toBe(true);
  });
});
