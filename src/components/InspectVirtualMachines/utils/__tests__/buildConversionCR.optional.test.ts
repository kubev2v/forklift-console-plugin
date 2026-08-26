import { DISK_ENCRYPTION_TYPE } from '@utils/crds/conversion/constants';

import { buildConversionCR } from '../buildConversionCR';

import { buildArgs } from './buildConversionCR.fixtures';

describe('buildConversionCR - optional fields', () => {
  it('omits diskEncryption and xfsCompatibility when unset', () => {
    const cr = buildConversionCR(buildArgs());

    expect(cr.spec).not.toHaveProperty('diskEncryption');
    expect(cr.spec).not.toHaveProperty('xfsCompatibility');
  });

  it('includes diskEncryption and xfsCompatibility when provided', () => {
    const cr = buildConversionCR(
      buildArgs({
        diskEncryption: { type: DISK_ENCRYPTION_TYPE.CLEVIS },
        xfsCompatibility: true,
      }),
    );

    expect(cr.spec.diskEncryption).toEqual({ type: DISK_ENCRYPTION_TYPE.CLEVIS });
    expect(cr.spec.xfsCompatibility).toBe(true);
  });

  it('does not include xfsCompatibility when false', () => {
    const cr = buildConversionCR(buildArgs({ xfsCompatibility: false }));

    expect(cr.spec).not.toHaveProperty('xfsCompatibility');
  });

  it('truncates generateName sanitized segment to 40 characters', () => {
    const longName = `vm-${'a'.repeat(80)}`;
    const cr = buildConversionCR(buildArgs({ vmName: longName }));

    const segment = (cr.metadata.generateName ?? '')
      .replace(/^deep-inspection-/, '')
      .replace(/-$/, '');
    expect(segment.length).toBeLessThanOrEqual(40);
  });
});
