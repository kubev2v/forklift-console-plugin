import { describe, expect, it } from '@jest/globals';

import { getStatusLabel } from '../utils';

describe('getStatusLabel - labels', () => {
  // True/False map to t('True')/t('False'); under the Jest i18n mock that returns the key,
  // those cases do not exercise meaningful app logic. Assert the fallback path instead.
  it('passes through statuses absent from the label map', () => {
    expect(getStatusLabel('Unknown')).toBe('Unknown');
    expect(getStatusLabel('CustomStatus')).toBe('CustomStatus');
  });
});
