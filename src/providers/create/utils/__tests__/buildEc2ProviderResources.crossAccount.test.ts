import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import type { Ec2FormData } from '../../types';
import { buildEc2ProviderResources } from '../buildEc2ProviderResources';
import { Ec2CrossAccountCredentialsError } from '../ec2CrossAccountCredentialsError';

const crossAccountFields: Ec2FormData = {
  [ProviderFormFieldId.Ec2AccessKeyId]: 'SOURCEKEY',
  [ProviderFormFieldId.Ec2Region]: 'us-east-1',
  [ProviderFormFieldId.Ec2SecretAccessKey]: 'source-secret',
  [ProviderFormFieldId.Ec2UseCrossAccountCredentials]: true,
  [ProviderFormFieldId.ProviderName]: 'ec2',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ec2',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildEc2ProviderResources - cross-account credentials', () => {
  it('writes both target keys without falling back to the source credentials', () => {
    const { secret } = buildEc2ProviderResources({
      ...crossAccountFields,
      [ProviderFormFieldId.Ec2TargetAccessKeyId]: 'TARGETKEY',
      [ProviderFormFieldId.Ec2TargetSecretAccessKey]: 'target-secret',
    });

    expect(decode(secret.data?.targetAccessKeyId ?? '')).toBe('TARGETKEY');
    expect(decode(secret.data?.targetSecretAccessKey ?? '')).toBe('target-secret');
    expect(decode(secret.data?.accessKeyId ?? '')).toBe('SOURCEKEY');
  });

  it('rejects a target access key ID without the target secret access key', () => {
    expect(() =>
      buildEc2ProviderResources({
        ...crossAccountFields,
        [ProviderFormFieldId.Ec2TargetAccessKeyId]: 'TARGETKEY',
      }),
    ).toThrow(Ec2CrossAccountCredentialsError);
  });

  it('rejects a whitespace-only target secret access key', () => {
    expect(() =>
      buildEc2ProviderResources({
        ...crossAccountFields,
        [ProviderFormFieldId.Ec2TargetAccessKeyId]: 'TARGETKEY',
        [ProviderFormFieldId.Ec2TargetSecretAccessKey]: '   ',
      }),
    ).toThrow(Ec2CrossAccountCredentialsError);
  });
});
