import { decode } from 'js-base64';
import { HypervTransferMethod, ProviderFormFieldId } from 'src/providers/create/fields/constants';
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
