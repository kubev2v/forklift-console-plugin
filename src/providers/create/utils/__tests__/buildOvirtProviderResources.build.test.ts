import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import { buildOvirtProviderResources } from '../buildOvirtProviderResources';

describe('buildOvirtProviderResources - build', () => {
  it('builds ovirt provider and secret credentials', () => {
    const { provider, secret } = buildOvirtProviderResources({
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
      [ProviderFormFieldId.OvirtPassword]: 'pass',
      [ProviderFormFieldId.OvirtUrl]: 'https://engine',
      [ProviderFormFieldId.OvirtUsername]: 'admin@internal',
      [ProviderFormFieldId.ProviderName]: 'ovirt',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'ovirt',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
    });

    expect(provider.spec?.type).toBe('ovirt');
    expect(decode(secret.data?.url ?? '')).toBe('https://engine');
    expect(secret.data?.user).toBeDefined();
    expect(secret.data?.password).toBeDefined();
  });
});
