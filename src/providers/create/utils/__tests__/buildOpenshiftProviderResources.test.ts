import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import { buildOpenshiftProviderResources } from '../buildOpenshiftProviderResources';

const base = {
  [ProviderFormFieldId.OpenshiftUrl]: 'https://api.cluster',
  [ProviderFormFieldId.ProviderName]: 'ocp',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'openshift' as const,
  [ProviderFormFieldId.ServiceAccountToken]: 'token',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildOpenshiftProviderResources', () => {
  it('encodes token and skip-verify flag', () => {
    const { secret } = buildOpenshiftProviderResources({
      ...base,
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
    });

    expect(decode(secret.data?.token ?? '')).toBe('token');
    expect(decode(secret.data?.insecureSkipVerify ?? '')).toBe('true');
    expect(secret.data?.cacert).toBeUndefined();
  });

  it('includes cacert and sets insecureSkipVerify false when configured', () => {
    const { secret } = buildOpenshiftProviderResources({
      ...base,
      [ProviderFormFieldId.CaCertificate]: 'CERT',
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Configure,
    });

    expect(decode(secret.data?.cacert ?? '')).toBe('CERT');
    expect(decode(secret.data?.insecureSkipVerify ?? '')).toBe('false');
  });
});
