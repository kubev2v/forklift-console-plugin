import { describe, expect, it } from '@jest/globals';

import { mergeConcernsMaps } from '../utils';

describe('mergeConcernsMaps - weakPartials', () => {
  it('prefers larger counts when inspection exceeds inventory', () => {
    const merged = mergeConcernsMaps(
      new Map([
        ['alpha', 2],
        ['beta', 1],
      ]),
      new Map([
        ['alpha', 5],
        ['keyC', 3],
      ]),
    );

    expect(Object.fromEntries(merged)).toEqual({ alpha: 5, beta: 1, keyC: 3 });
  });

  it('prefers larger counts when inventory exceeds inspection', () => {
    const merged = mergeConcernsMaps(new Map([['alpha', 5]]), new Map([['alpha', 2]]));

    expect(Object.fromEntries(merged)).toEqual({ alpha: 5 });
  });

  it('handles empty maps', () => {
    expect(Object.fromEntries(mergeConcernsMaps(new Map(), new Map()))).toEqual({});
  });
});
