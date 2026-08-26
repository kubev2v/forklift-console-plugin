import { DISK_ENCRYPTION_TYPE } from '@utils/crds/conversion/constants';

import { resolveDiskEncryption } from '../resolveDiskEncryption';

jest.mock('../createInspectionSecret', () => ({
  createInspectionSecret: jest.fn(() =>
    Promise.resolve({
      metadata: { name: 'luks-secret', namespace: 'ns' },
    }),
  ),
}));

import { createInspectionSecret } from '../createInspectionSecret';

describe('resolveDiskEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns undefined when overrides are missing', async () => {
    await expect(resolveDiskEncryption(undefined, 'vm', 'ns')).resolves.toBeUndefined();
  });

  it('returns Clevis when nbdeClevis is set', async () => {
    await expect(resolveDiskEncryption({ nbdeClevis: true }, 'vm', 'ns')).resolves.toEqual({
      type: DISK_ENCRYPTION_TYPE.CLEVIS,
    });
    expect(createInspectionSecret).not.toHaveBeenCalled();
  });

  it('creates LUKS secret from non-empty passphrases', async () => {
    await expect(
      resolveDiskEncryption({ passphrases: ['a', '', 'b'] }, 'vm-1', 'ns'),
    ).resolves.toEqual({
      secret: { name: 'luks-secret', namespace: 'ns' },
      type: DISK_ENCRYPTION_TYPE.LUKS,
    });
    expect(createInspectionSecret).toHaveBeenCalledWith(['a', 'b'], 'vm-1', 'ns');
  });

  it('returns undefined when passphrases are empty', async () => {
    await expect(
      resolveDiskEncryption({ passphrases: ['', ''] }, 'vm', 'ns'),
    ).resolves.toBeUndefined();
  });
});
