import { beforeEach, describe, expect, it } from '@jest/globals';

import { DiskDecryptionType } from '../../steps/other-settings/constants';
import { resolveDecryptionSecret } from '../resolveDecryptionSecret';

const mockCreateDecryptionSecret = jest.fn();
jest.mock('../createDecryptionSecret', () => ({
  createDecryptionSecret: jest.fn((...args) => mockCreateDecryptionSecret(...args)),
}));

const mockCopyDecryptionSecret = jest.fn();
jest.mock('../copyDecryptionSecret', () => ({
  SOURCE_SECRET_LABEL: 'forklift.konveyor.io/source-secret',
  copyDecryptionSecret: jest.fn((...args) => mockCopyDecryptionSecret(...args)),
}));

describe('resolveDecryptionSecret', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('copies existing secret when diskDecryptionType is Existing', async () => {
    const existingSecret = { metadata: { name: 'my-secret', namespace: 'ns' } } as any;
    const copiedSecret = { metadata: { name: 'plan-abc', namespace: 'ns' } };
    mockCopyDecryptionSecret.mockResolvedValue(copiedSecret);

    const result = await resolveDecryptionSecret({
      diskDecryptionPassPhrases: [],
      diskDecryptionType: DiskDecryptionType.Existing,
      existingLUKSSecret: existingSecret,
      planName: 'plan',
      planProject: 'ns',
    });

    expect(result.secret).toBe(copiedSecret);
    expect(mockCopyDecryptionSecret).toHaveBeenCalledWith(existingSecret, 'plan', 'ns');
    expect(mockCreateDecryptionSecret).not.toHaveBeenCalled();
  });

  it('returns undefined when diskDecryptionType is Existing but no secret selected', async () => {
    const result = await resolveDecryptionSecret({
      diskDecryptionPassPhrases: [],
      diskDecryptionType: DiskDecryptionType.Existing,
      existingLUKSSecret: undefined,
      planName: 'plan',
      planProject: 'ns',
    });

    expect(result.secret).toBeUndefined();
    expect(mockCopyDecryptionSecret).not.toHaveBeenCalled();
  });

  it('creates new secret when diskDecryptionType is New and passphrases provided', async () => {
    const createdSecret = { metadata: { name: 'plan-xyz', namespace: 'ns' } };
    mockCreateDecryptionSecret.mockResolvedValue(createdSecret);

    const result = await resolveDecryptionSecret({
      diskDecryptionPassPhrases: [{ value: 'pass-1' }],
      diskDecryptionType: DiskDecryptionType.New,
      existingLUKSSecret: undefined,
      planName: 'plan',
      planProject: 'ns',
    });

    expect(result.secret).toBe(createdSecret);
    expect(mockCreateDecryptionSecret).toHaveBeenCalledWith([{ value: 'pass-1' }], 'plan', 'ns');
  });

  it('returns undefined when diskDecryptionType is New and passphrases are empty', async () => {
    const result = await resolveDecryptionSecret({
      diskDecryptionPassPhrases: [{ value: '' }],
      diskDecryptionType: DiskDecryptionType.New,
      existingLUKSSecret: undefined,
      planName: 'plan',
      planProject: 'ns',
    });

    expect(result.secret).toBeUndefined();
    expect(mockCreateDecryptionSecret).not.toHaveBeenCalled();
  });
});
