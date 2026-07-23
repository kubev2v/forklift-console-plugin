import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import {
  CertificateValidationMode,
  NutanixPrismType,
  ProviderFormFieldId,
} from '../../fields/constants';
import type { NutanixFormData } from '../../types';
import { buildNutanixProviderResources } from '../buildNutanixProviderResources';

const baseFormData: NutanixFormData = {
  [ProviderFormFieldId.ProviderName]: 'test-nutanix',
  [ProviderFormFieldId.ProviderProject]: 'openshift-mtv',
  [ProviderFormFieldId.ProviderType]: 'nutanix',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
  [ProviderFormFieldId.NutanixUrl]: 'https://prism.example.com:9440',
  [ProviderFormFieldId.NutanixUsername]: 'admin',
  [ProviderFormFieldId.NutanixPassword]: 'secret',
};

describe('buildNutanixProviderResources', () => {
  it('builds provider with correct type, URL, and prismType setting', () => {
    const formData: NutanixFormData = {
      ...baseFormData,
      [ProviderFormFieldId.NutanixPrismType]: NutanixPrismType.Element,
    };

    const { provider } = buildNutanixProviderResources(formData);

    expect(provider.spec?.type).toBe('nutanix');
    expect(provider.spec?.url).toBe('https://prism.example.com:9440');
    expect(provider.spec?.settings).toEqual({ prismType: NutanixPrismType.Element });
  });

  it('builds secret with user and password base64-encoded', () => {
    const { secret } = buildNutanixProviderResources(baseFormData);

    expect(secret.data?.user).toBeDefined();
    expect(secret.data?.password).toBeDefined();
    expect(decode(secret.data!.user)).toBe('admin');
    expect(decode(secret.data!.password)).toBe('secret');
  });

  it('sets insecureSkipVerify to true and excludes cacert when skipping cert validation', () => {
    const formData: NutanixFormData = {
      ...baseFormData,
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
      [ProviderFormFieldId.CaCertificate]: 'should-be-ignored',
    };

    const { secret } = buildNutanixProviderResources(formData);

    expect(decode(secret.data!.insecureSkipVerify)).toBe('true');
    expect(secret.data?.cacert).toBeUndefined();
  });

  it('includes cacert when cert validation is configured', () => {
    const formData: NutanixFormData = {
      ...baseFormData,
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Configure,
      [ProviderFormFieldId.CaCertificate]: '-----BEGIN CERTIFICATE-----\nMIID...',
    };

    const { secret } = buildNutanixProviderResources(formData);

    expect(decode(secret.data!.insecureSkipVerify)).toBe('false');
    expect(secret.data?.cacert).toBeDefined();
    expect(decode(secret.data!.cacert)).toBe('-----BEGIN CERTIFICATE-----\nMIID...');
  });

  it('defaults to element prism type when not specified', () => {
    const formData: NutanixFormData = {
      ...baseFormData,
      [ProviderFormFieldId.NutanixPrismType]: undefined,
    };

    const { provider } = buildNutanixProviderResources(formData);

    expect(provider.spec?.settings).toEqual({ prismType: NutanixPrismType.Element });
  });

  it('handles central prism type', () => {
    const formData: NutanixFormData = {
      ...baseFormData,
      [ProviderFormFieldId.NutanixPrismType]: NutanixPrismType.Central,
    };

    const { provider } = buildNutanixProviderResources(formData);

    expect(provider.spec?.settings).toEqual({ prismType: NutanixPrismType.Central });
  });
});
