import { decode } from 'js-base64';
import {
  CertificateValidationMode,
  HypervTransferMethod,
  ProviderFormFieldId,
} from 'src/providers/create/fields/constants';
import type { CreateProviderFormData } from 'src/providers/create/types';

import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { buildSecretData } from '../buildSecretData';

const hypervProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'hv', namespace: 'ns' },
  spec: { type: 'hyperv', url: '192.168.1.1', secret: { name: 'hv-secret', namespace: 'ns' } },
};

const baseForm: Partial<CreateProviderFormData> = {
  [ProviderFormFieldId.HypervUsername]: 'admin',
  [ProviderFormFieldId.HypervPassword]: 'pass',
  [ProviderFormFieldId.CertificateValidation]: undefined,
};

describe('buildSecretData – hyperv provider', () => {
  it('includes smbUrl for SMB mode', () => {
    const form: Partial<CreateProviderFormData> = {
      ...baseForm,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.SMB,
      [ProviderFormFieldId.SmbUrl]: '//server/share',
    };

    const result = buildSecretData(form, hypervProvider);

    expect(result.smbUrl).toBeDefined();
    expect(decode(result.smbUrl)).toBe('//server/share');
  });

  it('excludes smbUrl for iSCSI mode', () => {
    const form: Partial<CreateProviderFormData> = {
      ...baseForm,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.ISCSI,
      [ProviderFormFieldId.SmbUrl]: '//server/share',
    };

    const result = buildSecretData(form, hypervProvider);

    expect(result.smbUrl).toBeUndefined();
  });

  it('includes separate SMB credentials for SMB mode', () => {
    const form: Partial<CreateProviderFormData> = {
      ...baseForm,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.SMB,
      [ProviderFormFieldId.SmbUrl]: '//server/share',
      [ProviderFormFieldId.UseDifferentSmbCredentials]: true,
      [ProviderFormFieldId.SmbUser]: 'smbuser',
      [ProviderFormFieldId.SmbPassword]: 'smbpass',
    };

    const result = buildSecretData(form, hypervProvider);

    expect(decode(result.smbUser)).toBe('smbuser');
    expect(decode(result.smbPassword)).toBe('smbpass');
  });

  it('excludes separate SMB credentials for iSCSI mode', () => {
    const form: Partial<CreateProviderFormData> = {
      ...baseForm,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.ISCSI,
      [ProviderFormFieldId.UseDifferentSmbCredentials]: true,
      [ProviderFormFieldId.SmbUser]: 'smbuser',
      [ProviderFormFieldId.SmbPassword]: 'smbpass',
    };

    const result = buildSecretData(form, hypervProvider);

    expect(result.smbUser).toBeUndefined();
    expect(result.smbPassword).toBeUndefined();
  });
});

const nutanixProvider: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'nx', namespace: 'ns' },
  spec: {
    secret: { name: 'nx-secret', namespace: 'ns' },
    type: 'nutanix',
    url: 'https://prism.example.com:9440',
  },
};

describe('buildSecretData – nutanix provider', () => {
  it('includes user and password fields correctly encoded', () => {
    const form: Partial<CreateProviderFormData> = {
      [ProviderFormFieldId.NutanixUsername]: 'nutanix-admin',
      [ProviderFormFieldId.NutanixPassword]: 'nutanix-pass',
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
    };

    const result = buildSecretData(form, nutanixProvider);

    expect(decode(result.user)).toBe('nutanix-admin');
    expect(decode(result.password)).toBe('nutanix-pass');
  });

  it('includes insecureSkipVerify set to true when skipping cert validation', () => {
    const form: Partial<CreateProviderFormData> = {
      [ProviderFormFieldId.NutanixUsername]: 'admin',
      [ProviderFormFieldId.NutanixPassword]: 'pass',
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
    };

    const result = buildSecretData(form, nutanixProvider);

    expect(decode(result.insecureSkipVerify)).toBe('true');
    expect(result.cacert).toBeUndefined();
  });

  it('includes cacert when cert validation is configured', () => {
    const form: Partial<CreateProviderFormData> = {
      [ProviderFormFieldId.NutanixUsername]: 'admin',
      [ProviderFormFieldId.NutanixPassword]: 'pass',
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Configure,
      [ProviderFormFieldId.CaCertificate]: '-----BEGIN CERTIFICATE-----\nMIID...',
    };

    const result = buildSecretData(form, nutanixProvider);

    expect(decode(result.insecureSkipVerify)).toBe('false');
    expect(result.cacert).toBeDefined();
    expect(decode(result.cacert)).toBe('-----BEGIN CERTIFICATE-----\nMIID...');
  });
});
