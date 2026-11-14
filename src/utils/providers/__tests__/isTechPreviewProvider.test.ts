import { describe, expect, it } from '@jest/globals';

import { isTechPreviewProvider, PROVIDER_TYPES } from '../constants';

describe('isTechPreviewProvider', () => {
  it('should return true for EC2', () => {
    expect(isTechPreviewProvider(PROVIDER_TYPES.ec2)).toBe(true);
  });

  it('should return false for Hyper-V', () => {
    expect(isTechPreviewProvider(PROVIDER_TYPES.hyperv)).toBe(false);
  });

  it('should return false for Nutanix', () => {
    expect(isTechPreviewProvider(PROVIDER_TYPES.nutanix)).toBe(false);
  });

  it('should return false for an unknown provider type', () => {
    expect(isTechPreviewProvider('unknown-provider')).toBe(false);
  });
});
