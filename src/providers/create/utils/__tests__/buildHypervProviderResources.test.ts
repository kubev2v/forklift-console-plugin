import { decode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';

import { HypervTransferMethod, ProviderFormFieldId } from '../../fields/constants';
import type { HypervFormData } from '../../types';
import { buildHypervProviderResources } from '../buildHypervProviderResources';

const baseFormData: HypervFormData = {
  [ProviderFormFieldId.ProviderName]: 'test-hyperv',
  [ProviderFormFieldId.ProviderProject]: 'openshift-mtv',
  [ProviderFormFieldId.ProviderType]: 'hyperv',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
  [ProviderFormFieldId.HypervHost]: '192.168.1.100',
  [ProviderFormFieldId.HypervUsername]: 'admin',
  [ProviderFormFieldId.HypervPassword]: 'secret',
};

describe('buildHypervProviderResources', () => {
  it('builds SMB provider with smbUrl in secret when transfer method is SMB', () => {
    const formData: HypervFormData = {
      ...baseFormData,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.SMB,
      [ProviderFormFieldId.SmbUrl]: '//server/share',
    };

    const { provider, secret } = buildHypervProviderResources(formData);

    expect(provider.spec?.settings).toBeUndefined();
    expect(secret.data?.smbUrl).toBeDefined();
    expect(decode(secret.data!.smbUrl)).toBe('//server/share');
  });

  it('builds iSCSI provider with settings and without SMB data in secret', () => {
    const formData: HypervFormData = {
      ...baseFormData,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.ISCSI,
      [ProviderFormFieldId.SmbUrl]: '//leftover/value',
    };

    const { provider, secret } = buildHypervProviderResources(formData);

    expect(provider.spec?.settings).toEqual({
      hyperVTransferMethod: HypervTransferMethod.ISCSI,
    });
    expect(secret.data?.smbUrl).toBeUndefined();
    expect(secret.data?.smbUser).toBeUndefined();
    expect(secret.data?.smbPassword).toBeUndefined();
  });

  it('defaults to SMB when transfer method is not specified', () => {
    const { provider, secret } = buildHypervProviderResources({
      ...baseFormData,
      [ProviderFormFieldId.SmbUrl]: '//server/share',
    });

    expect(provider.spec?.settings).toBeUndefined();
    expect(secret.data?.smbUrl).toBeDefined();
  });

  it('includes separate SMB credentials for SMB mode when enabled', () => {
    const formData: HypervFormData = {
      ...baseFormData,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.SMB,
      [ProviderFormFieldId.SmbUrl]: '//server/share',
      [ProviderFormFieldId.UseDifferentSmbCredentials]: true,
      [ProviderFormFieldId.SmbUser]: 'smbuser',
      [ProviderFormFieldId.SmbPassword]: 'smbpass',
    };

    const { secret } = buildHypervProviderResources(formData);

    expect(decode(secret.data!.smbUser)).toBe('smbuser');
    expect(decode(secret.data!.smbPassword)).toBe('smbpass');
  });

  it('excludes separate SMB credentials for iSCSI mode even when flag is set', () => {
    const formData: HypervFormData = {
      ...baseFormData,
      [ProviderFormFieldId.TransferMethod]: HypervTransferMethod.ISCSI,
      [ProviderFormFieldId.UseDifferentSmbCredentials]: true,
      [ProviderFormFieldId.SmbUser]: 'smbuser',
      [ProviderFormFieldId.SmbPassword]: 'smbpass',
    };

    const { secret } = buildHypervProviderResources(formData);

    expect(secret.data?.smbUser).toBeUndefined();
    expect(secret.data?.smbPassword).toBeUndefined();
  });
});
