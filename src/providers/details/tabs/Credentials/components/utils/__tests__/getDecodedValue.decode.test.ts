import { encode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { getDecodedValue } from '../getDecodedValue';

describe('getDecodedValue - decode', () => {
  it('decodes values and returns falsy for empty input', () => {
    expect(getDecodedValue(undefined)).toBeUndefined();
    expect(getDecodedValue('')).toBe('');
    expect(getDecodedValue(encode('hello'))).toBe('hello');
  });
});
