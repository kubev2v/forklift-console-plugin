import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import type { CreateProviderFormData, Ec2ResolvedTarget } from '../../types';
import { prepareProviderSubmission } from '../prepareProviderSubmission';
import { resolveEc2TargetSettings } from '../resolveEc2TargetSettings';

jest.mock('../resolveEc2TargetSettings', () => ({
  resolveEc2TargetSettings: jest.fn(),
}));

const mockedResolver = jest.mocked(resolveEc2TargetSettings);

const ec2FormData: CreateProviderFormData = {
  [ProviderFormFieldId.Ec2AccessKeyId]: 'AKIA',
  [ProviderFormFieldId.Ec2AutoTargetCredentials]: true,
  [ProviderFormFieldId.Ec2Region]: 'us-east-1',
  [ProviderFormFieldId.ProviderName]: 'ec2',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ec2',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

const resolvedTarget: Ec2ResolvedTarget = { targetAz: 'us-east-1a', targetRegion: 'us-east-1' };

describe('prepareProviderSubmission', () => {
  beforeEach(() => {
    mockedResolver.mockReset();
    mockedResolver.mockResolvedValue(resolvedTarget);
  });

  it('passes non-EC2 providers through untouched', async () => {
    const formData = { ...ec2FormData, [ProviderFormFieldId.ProviderType]: 'vsphere' };

    await expect(prepareProviderSubmission(formData)).resolves.toEqual({ formData });
    expect(mockedResolver).not.toHaveBeenCalled();
  });

  it('passes EC2 through when auto-detect is off', async () => {
    const formData = { ...ec2FormData, [ProviderFormFieldId.Ec2AutoTargetCredentials]: false };

    await expect(prepareProviderSubmission(formData)).resolves.toEqual({ formData });
    expect(mockedResolver).not.toHaveBeenCalled();
  });

  it('lets explicit cross-account credentials win over auto-detect', async () => {
    const formData = { ...ec2FormData, [ProviderFormFieldId.Ec2UseCrossAccountCredentials]: true };

    await expect(prepareProviderSubmission(formData)).resolves.toEqual({ formData });
    expect(mockedResolver).not.toHaveBeenCalled();
  });

  it('returns the resolved EC2 target when auto-detect applies', async () => {
    await expect(prepareProviderSubmission(ec2FormData)).resolves.toEqual({
      ec2Target: resolvedTarget,
      formData: ec2FormData,
    });
    expect(mockedResolver).toHaveBeenCalledWith({
      ec2Region: 'us-east-1',
      formData: ec2FormData,
    });
  });

  it('propagates resolver errors unchanged', async () => {
    const resolutionError = new Error('resolution failed');
    mockedResolver.mockRejectedValue(resolutionError);

    await expect(prepareProviderSubmission(ec2FormData)).rejects.toBe(resolutionError);
  });
});
