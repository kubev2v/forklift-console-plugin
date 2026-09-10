import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from '../../fields/constants';
import type { CreateProviderFormData } from '../../types';
import { buildProviderResources } from '../buildProviderResources';

const common = {
  [ProviderFormFieldId.ProviderName]: 'provider',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

const cases: { formData: CreateProviderFormData; type: string }[] = [
  {
    formData: {
      ...common,
      [ProviderFormFieldId.Ec2AccessKeyId]: 'AKIAxxx',
      [ProviderFormFieldId.Ec2Region]: 'us-east-1',
      [ProviderFormFieldId.Ec2SecretAccessKey]: 'secret',
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.ec2,
    },
    type: PROVIDER_TYPES.ec2,
  },
  {
    formData: {
      ...common,
      [ProviderFormFieldId.HypervHost]: '192.168.1.1',
      [ProviderFormFieldId.HypervPassword]: 'pass',
      [ProviderFormFieldId.HypervUsername]: 'admin',
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.hyperv,
    },
    type: PROVIDER_TYPES.hyperv,
  },
  {
    formData: {
      ...common,
      [ProviderFormFieldId.OpenshiftUrl]: 'https://api',
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.openshift,
      [ProviderFormFieldId.ServiceAccountToken]: 'token',
    },
    type: PROVIDER_TYPES.openshift,
  },
  {
    formData: {
      ...common,
      [ProviderFormFieldId.OpenstackUrl]: 'https://keystone',
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.openstack,
    },
    type: PROVIDER_TYPES.openstack,
  },
  {
    formData: {
      ...common,
      [ProviderFormFieldId.NfsDirectory]: 'host:/ova',
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.ova,
    },
    type: PROVIDER_TYPES.ova,
  },
  {
    formData: {
      ...common,
      [ProviderFormFieldId.OvirtUrl]: 'https://engine',
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.ovirt,
    },
    type: PROVIDER_TYPES.ovirt,
  },
  {
    formData: {
      ...common,
      [ProviderFormFieldId.ProviderType]: PROVIDER_TYPES.vsphere,
      [ProviderFormFieldId.VsphereUrl]: 'https://vc',
    },
    type: PROVIDER_TYPES.vsphere,
  },
];

describe('buildProviderResources', () => {
  it.each(cases)('dispatches $type form data', ({ formData, type }) => {
    const { provider } = buildProviderResources(formData);

    expect(provider.spec?.type).toBe(type);
  });

  it('throws for unsupported provider types', () => {
    expect(() =>
      buildProviderResources({
        [ProviderFormFieldId.ProviderType]: 'unknown',
      } as never),
    ).toThrow(/Unsupported provider type/);
  });
});
