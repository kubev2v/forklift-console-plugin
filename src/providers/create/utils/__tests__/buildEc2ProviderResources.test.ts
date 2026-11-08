import { decode } from 'js-base64';
import { getEc2Url } from 'src/providers/utils/helpers/getEc2Url';

import { describe, expect, it } from '@jest/globals';

import { ProviderFormFieldId } from '../../fields/constants';
import type { Ec2FormData } from '../../types';
import { buildEc2ProviderResources } from '../buildEc2ProviderResources';

const baseFields: Ec2FormData = {
  [ProviderFormFieldId.Ec2AccessKeyId]: 'AKIAxxx',
  [ProviderFormFieldId.Ec2Region]: 'us-east-1',
  [ProviderFormFieldId.Ec2SecretAccessKey]: 'source-secret',
  [ProviderFormFieldId.ProviderName]: 'ec2',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ec2',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

const resolvedTarget = {
  targetAccessKeyId: 'CLUSTERKEY',
  targetAz: 'us-east-1a',
  targetRegion: 'us-east-1',
  targetSecretAccessKey: 'cluster-secret',
};

describe('buildEc2ProviderResources', () => {
  it('builds provider URL and encodes source credentials from region', () => {
    const expectedUrl = getEc2Url('us-east-1');
    const { provider, secret } = buildEc2ProviderResources(baseFields);

    expect(provider.spec?.type).toBe('ec2');
    expect(provider.spec?.url).toBe(expectedUrl);
    expect(provider.spec?.settings?.ec2Region).toBe('us-east-1');
    expect(decode(secret.data?.accessKeyId ?? '')).toBe('AKIAxxx');
    expect(decode(secret.data?.secretAccessKey ?? '')).toBe('source-secret');
    expect(decode(secret.data?.url ?? '')).toBe(expectedUrl);
    expect(decode(secret.data?.region ?? '')).toBe('us-east-1');
  });

  it('writes target settings from the resolved target when auto-detect is on', () => {
    const { provider, secret } = buildEc2ProviderResources(
      { ...baseFields, [ProviderFormFieldId.Ec2AutoTargetCredentials]: true },
      resolvedTarget,
    );

    expect(provider.spec?.settings?.['target-az']).toBe('us-east-1a');
    expect(provider.spec?.settings?.['target-region']).toBe('us-east-1');
    expect(decode(secret.data?.targetAccessKeyId ?? '')).toBe('CLUSTERKEY');
    expect(decode(secret.data?.targetSecretAccessKey ?? '')).toBe('cluster-secret');
  });

  it('writes typed target settings when auto-detect is off', () => {
    const { provider } = buildEc2ProviderResources({
      ...baseFields,
      [ProviderFormFieldId.Ec2TargetAz]: 'us-west-2b',
      [ProviderFormFieldId.Ec2TargetRegion]: 'us-west-2',
    });

    expect(provider.spec?.settings?.['target-az']).toBe('us-west-2b');
    expect(provider.spec?.settings?.['target-region']).toBe('us-west-2');
  });

  it('prefers explicit form values over the resolved target', () => {
    const { provider, secret } = buildEc2ProviderResources(
      {
        ...baseFields,
        [ProviderFormFieldId.Ec2TargetAccessKeyId]: 'EXPLICIT',
        [ProviderFormFieldId.Ec2TargetAz]: 'eu-west-1c',
        [ProviderFormFieldId.Ec2TargetRegion]: 'eu-west-1',
        [ProviderFormFieldId.Ec2TargetSecretAccessKey]: 'explicit-secret',
      },
      resolvedTarget,
    );

    expect(provider.spec?.settings?.['target-az']).toBe('eu-west-1c');
    expect(provider.spec?.settings?.['target-region']).toBe('eu-west-1');
    expect(decode(secret.data?.targetAccessKeyId ?? '')).toBe('EXPLICIT');
    expect(decode(secret.data?.targetSecretAccessKey ?? '')).toBe('explicit-secret');
  });

  it('falls back to the source credentials for the same account', () => {
    const { secret } = buildEc2ProviderResources({
      ...baseFields,
      [ProviderFormFieldId.Ec2UseCrossAccountCredentials]: false,
    });

    expect(decode(secret.data?.targetAccessKeyId ?? '')).toBe('AKIAxxx');
    expect(decode(secret.data?.targetSecretAccessKey ?? '')).toBe('source-secret');
  });

  it('ignores whitespace-only values instead of writing empty keys', () => {
    const { provider, secret } = buildEc2ProviderResources({
      ...baseFields,
      [ProviderFormFieldId.Ec2TargetAz]: '   ',
      [ProviderFormFieldId.Ec2TargetRegion]: '  ',
      [ProviderFormFieldId.Ec2AccessKeyId]: '  ',
    });

    expect(provider.spec?.settings?.['target-az']).toBeUndefined();
    expect(provider.spec?.settings?.['target-region']).toBeUndefined();
    expect(secret.data?.targetAccessKeyId).toBeUndefined();
  });

  it('never emits the inert autoTargetCredentials setting', () => {
    const buildWith = (fields: Partial<Ec2FormData>, target?: typeof resolvedTarget): void => {
      const { provider } = buildEc2ProviderResources({ ...baseFields, ...fields }, target);
      expect(provider.spec?.settings?.autoTargetCredentials).toBeUndefined();
    };

    buildWith({});
    buildWith({ [ProviderFormFieldId.Ec2AutoTargetCredentials]: true }, resolvedTarget);
    buildWith({ [ProviderFormFieldId.Ec2AutoTargetCredentials]: false });
    buildWith({
      [ProviderFormFieldId.Ec2TargetAz]: 'us-east-1a',
      [ProviderFormFieldId.Ec2UseCrossAccountCredentials]: true,
    });
  });
});
