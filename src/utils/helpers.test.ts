import { describe, expect, it } from '@jest/globals';

import { isRecord } from './helpers';

describe('isRecord', () => {
  it('accepts objects, including errors', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord(new Error('boom'))).toBe(true);
  });

  it('rejects null, undefined and primitives', () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord('text')).toBe(false);
    expect(isRecord(0)).toBe(false);
    expect(isRecord(false)).toBe(false);
  });
});
