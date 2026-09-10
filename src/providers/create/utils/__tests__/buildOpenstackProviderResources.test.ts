import { decode } from 'js-base64';
import { OpenstackAuthType } from 'src/providers/utils/constants';

import { describe, expect, it } from '@jest/globals';

import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import {
  buildOpenstackProviderResources,
  getAuthTypeValue,
} from '../buildOpenstackProviderResources';

const baseFields = {
  [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
  [ProviderFormFieldId.OpenstackRegionName]: 'RegionOne',
  [ProviderFormFieldId.OpenstackUrl]: 'https://keystone',
  [ProviderFormFieldId.ProviderName]: 'os',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'openstack' as const,
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

describe('buildOpenstackProviderResources', () => {
  it('maps auth types to secret authType values', () => {
    expect(getAuthTypeValue(OpenstackAuthType.Password)).toBe('password');
    expect(getAuthTypeValue(OpenstackAuthType.TokenWithUsername)).toBe('token');
    expect(getAuthTypeValue(OpenstackAuthType.ApplicationCredentialId)).toBe(
      'applicationcredential',
    );
  });

  it('encodes password auth fields into the secret', () => {
    const { secret } = buildOpenstackProviderResources({
      ...baseFields,
      [ProviderFormFieldId.OpenstackAuthType]: OpenstackAuthType.Password,
      [ProviderFormFieldId.OpenstackDomainName]: 'Default',
      [ProviderFormFieldId.OpenstackPassword]: 'secret',
      [ProviderFormFieldId.OpenstackProjectName]: 'admin',
      [ProviderFormFieldId.OpenstackUsername]: 'admin',
    });

    expect(decode(secret.data?.authType ?? '')).toBe('password');
    expect(decode(secret.data?.username ?? '')).toBe('admin');
    expect(decode(secret.data?.password ?? '')).toBe('secret');
    expect(decode(secret.data?.domainName ?? '')).toBe('Default');
    expect(decode(secret.data?.projectName ?? '')).toBe('admin');
    expect(decode(secret.data?.regionName ?? '')).toBe('RegionOne');
  });

  it('encodes token-with-username auth fields into the secret', () => {
    const { secret } = buildOpenstackProviderResources({
      ...baseFields,
      [ProviderFormFieldId.OpenstackAuthType]: OpenstackAuthType.TokenWithUsername,
      [ProviderFormFieldId.OpenstackDomainName]: 'Default',
      [ProviderFormFieldId.OpenstackProjectName]: 'admin',
      [ProviderFormFieldId.OpenstackToken]: 'tok-123',
      [ProviderFormFieldId.OpenstackUsername]: 'admin',
    });

    expect(decode(secret.data?.authType ?? '')).toBe('token');
    expect(decode(secret.data?.token ?? '')).toBe('tok-123');
    expect(decode(secret.data?.username ?? '')).toBe('admin');
    expect(decode(secret.data?.domainName ?? '')).toBe('Default');
    expect(decode(secret.data?.projectName ?? '')).toBe('admin');
    expect(secret.data?.password).toBeUndefined();
  });

  it('encodes application-credential-id auth fields into the secret', () => {
    const { secret } = buildOpenstackProviderResources({
      ...baseFields,
      [ProviderFormFieldId.OpenstackApplicationCredentialId]: 'app-id',
      [ProviderFormFieldId.OpenstackApplicationCredentialSecret]: 'app-secret',
      [ProviderFormFieldId.OpenstackAuthType]: OpenstackAuthType.ApplicationCredentialId,
      [ProviderFormFieldId.OpenstackProjectName]: 'admin',
    });

    expect(decode(secret.data?.authType ?? '')).toBe('applicationcredential');
    expect(decode(secret.data?.applicationCredentialID ?? '')).toBe('app-id');
    expect(decode(secret.data?.applicationCredentialSecret ?? '')).toBe('app-secret');
    expect(decode(secret.data?.projectName ?? '')).toBe('admin');
    expect(secret.data?.username).toBeUndefined();
  });
});
