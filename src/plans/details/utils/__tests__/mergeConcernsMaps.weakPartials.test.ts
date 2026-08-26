import { describe, expect, it } from '@jest/globals';

import { mergeConcernsMaps } from '../utils';

describe('mergeConcernsMaps - weakPartials', () => {
  it('prefers larger counts when merging inventory and inspection maps', () => {
    const merged = mergeConcernsMaps(
      new Map([
        ['a', 2],
        ['b', 1],
      ]),
      new Map([
        ['a', 5],
        ['c', 3],
      ]),
    );

    expect(Object.fromEntries(merged)).toEqual({ a: 5, b: 1, c: 3 });
  });

  it('handles empty maps', () => {
    expect(Object.fromEntries(mergeConcernsMaps(new Map(), new Map()))).toEqual({});
  });
});
