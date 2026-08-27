import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import { buildOvirtProviderResources } from '../buildOvirtProviderResources';

const baseFields = {
  [ProviderFormFieldId.OvirtPassword]: 'pass',
  [ProviderFormFieldId.OvirtUrl]: 'https://engine',
  [ProviderFormFieldId.OvirtUsername]: 'admin@internal',
  [ProviderFormFieldId.ProviderName]: 'ovirt',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ovirt' as const,
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildOvirtProviderResources', () => {
  it('builds ovirt provider and decodes Skip-mode credentials', () => {
    const { provider, secret } = buildOvirtProviderResources({
      ...baseFields,
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
    });

    expect(provider.spec?.type).toBe('ovirt');
    expect(decode(secret.data?.url ?? '')).toBe('https://engine');
    expect(decode(secret.data?.user ?? '')).toBe('admin@internal');
    expect(decode(secret.data?.password ?? '')).toBe('pass');
    expect(decode(secret.data?.insecureSkipVerify ?? '')).toBe('true');
    expect(secret.data?.cacert).toBeUndefined();
  });

  it('includes cacert and sets insecureSkipVerify false when Configure', () => {
    const { secret } = buildOvirtProviderResources({
      ...baseFields,
      [ProviderFormFieldId.CaCertificate]: 'CERT',
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Configure,
    });

    expect(decode(secret.data?.cacert ?? '')).toBe('CERT');
    expect(decode(secret.data?.insecureSkipVerify ?? '')).toBe('false');
  });
});
