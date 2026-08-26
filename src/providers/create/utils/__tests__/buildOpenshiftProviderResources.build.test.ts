import { decode } from 'js-base64';
import { describe, expect, it } from '@jest/globals';

import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import { buildOpenshiftProviderResources } from '../buildOpenshiftProviderResources';

const base = {
  [ProviderFormFieldId.OpenshiftUrl]: 'https://api.cluster',
  [ProviderFormFieldId.ProviderName]: 'ocp',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'openshift',
  [ProviderFormFieldId.ServiceAccountToken]: 'token',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
} as never;

describe('buildOpenshiftProviderResources - build', () => {
  it('encodes token and skip-verify flag', () => {
    const { secret } = buildOpenshiftProviderResources({
      ...base,
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
    });

    expect(decode(secret.data?.token ?? '')).toBe('token');
    expect(decode(secret.data?.insecureSkipVerify ?? '')).toBe('true');
    expect(secret.data?.cacert).toBeUndefined();
  });

  it('includes cacert when validation is configured', () => {
    const { secret } = buildOpenshiftProviderResources({
      ...base,
      [ProviderFormFieldId.CaCertificate]: 'CERT',
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Configure,
    });

    expect(decode(secret.data?.cacert ?? '')).toBe('CERT');
  });
});
