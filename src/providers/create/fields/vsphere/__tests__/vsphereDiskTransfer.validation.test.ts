import { VddkSetupMode } from 'src/providers/utils/constants';

import { describe, expect, it } from '@jest/globals';

import { validateVsphereDiskTransfer } from '../vsphereFieldValidators';

describe('validateVsphereDiskTransfer', () => {
  it('requires a completed image for an archive upload', () => {
    expect(validateVsphereDiskTransfer(VddkSetupMode.Upload, undefined)).toBe(
      'VDDK image is required',
    );
    expect(validateVsphereDiskTransfer(VddkSetupMode.Upload, '')).toBe('VDDK image is required');
  });

  it('accepts a valid completed image', () => {
    expect(validateVsphereDiskTransfer(VddkSetupMode.Upload, 'quay.io/vddk:latest')).toBe(true);
  });

  it('does not require VDDK for a sourcing appliance', () => {
    expect(validateVsphereDiskTransfer(VddkSetupMode.CopyAppliance, undefined)).toBe(true);
  });
});
