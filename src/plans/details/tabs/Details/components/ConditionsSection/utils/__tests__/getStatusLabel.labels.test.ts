import { describe, expect, it } from '@jest/globals';

import { getStatusLabel } from '../utils';

describe('getStatusLabel - labels', () => {
  it('maps True/False and passes through unknown statuses', () => {
    expect(getStatusLabel('True')).toBe('True');
    expect(getStatusLabel('False')).toBe('False');
    expect(getStatusLabel('Unknown')).toBe('Unknown');
  });
});
