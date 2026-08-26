import { decode } from 'js-base64';
import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import { buildEc2ProviderResources } from '../buildEc2ProviderResources';

describe('buildEc2ProviderResources - build', () => {
  it('builds an ec2 provider and encodes credentials', () => {
    const { provider, secret } = buildEc2ProviderResources({
      [ProviderFormFieldId.Ec2AccessKeyId]: 'AKIAxxx',
      [ProviderFormFieldId.Ec2Region]: 'us-east-1',
      [ProviderFormFieldId.Ec2SecretAccessKey]: 'secret',
      [ProviderFormFieldId.ProviderName]: 'ec2',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'ec2',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
    } as never);

    expect(provider.spec?.type).toBe('ec2');
    expect(provider.spec?.settings?.ec2Region).toBe('us-east-1');
    expect(decode(secret.data?.accessKeyId ?? '')).toBe('AKIAxxx');
    expect(secret.metadata?.namespace).toBe('ns');
  });
});
