import { decode } from 'js-base64';
import { getEc2Url } from 'src/providers/utils/helpers/getEc2Url';

import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import { buildEc2ProviderResources } from '../buildEc2ProviderResources';

const baseFields = {
  [ProviderFormFieldId.Ec2AccessKeyId]: 'AKIAxxx',
  [ProviderFormFieldId.Ec2Region]: 'us-east-1',
  [ProviderFormFieldId.Ec2SecretAccessKey]: 'secret',
  [ProviderFormFieldId.ProviderName]: 'ec2',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ec2' as const,
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildEc2ProviderResources', () => {
  it('builds provider URL and encodes credentials from region', () => {
    const expectedUrl = getEc2Url('us-east-1');
    const { provider, secret } = buildEc2ProviderResources(baseFields);

    expect(provider.spec?.type).toBe('ec2');
    expect(provider.spec?.url).toBe(expectedUrl);
    expect(provider.spec?.settings?.ec2Region).toBe('us-east-1');
    expect(provider.spec?.settings?.autoTargetCredentials).toBeUndefined();
    expect(provider.spec?.settings?.['target-az']).toBeUndefined();
    expect(decode(secret.data?.accessKeyId ?? '')).toBe('AKIAxxx');
    expect(decode(secret.data?.secretAccessKey ?? '')).toBe('secret');
    expect(decode(secret.data?.url ?? '')).toBe(expectedUrl);
    expect(decode(secret.data?.region ?? '')).toBe('us-east-1');
  });

  it('sets autoTargetCredentials when enabled', () => {
    const { provider } = buildEc2ProviderResources({
      ...baseFields,
      [ProviderFormFieldId.Ec2AutoTargetCredentials]: true,
      [ProviderFormFieldId.Ec2TargetAz]: 'us-east-1a',
    });

    expect(provider.spec?.settings?.autoTargetCredentials).toBe('true');
    expect(provider.spec?.settings?.['target-az']).toBeUndefined();
  });

  it('sets target-az and target-region when not using auto credentials', () => {
    const { provider } = buildEc2ProviderResources({
      ...baseFields,
      [ProviderFormFieldId.Ec2TargetAz]: 'us-east-1a',
      [ProviderFormFieldId.Ec2TargetRegion]: 'us-west-2',
    });

    expect(provider.spec?.settings?.['target-az']).toBe('us-east-1a');
    expect(provider.spec?.settings?.['target-region']).toBe('us-west-2');
    expect(provider.spec?.settings?.autoTargetCredentials).toBeUndefined();
  });

  it('encodes cross-account target credentials when enabled', () => {
    const { secret } = buildEc2ProviderResources({
      ...baseFields,
      [ProviderFormFieldId.Ec2TargetAccessKeyId]: 'TARGETKEY',
      [ProviderFormFieldId.Ec2TargetSecretAccessKey]: 'target-secret',
      [ProviderFormFieldId.Ec2UseCrossAccountCredentials]: true,
    });

    expect(decode(secret.data?.targetAccessKeyId ?? '')).toBe('TARGETKEY');
    expect(decode(secret.data?.targetSecretAccessKey ?? '')).toBe('target-secret');
  });
});
