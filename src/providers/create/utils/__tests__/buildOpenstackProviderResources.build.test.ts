import { decode } from 'js-base64';
import { OpenstackAuthType } from 'src/providers/utils/constants';

import { describe, expect, it } from '@jest/globals';

import { CertificateValidationMode, ProviderFormFieldId } from '../../fields/constants';
import {
  buildOpenstackProviderResources,
  getAuthTypeValue,
} from '../buildOpenstackProviderResources';

describe('buildOpenstackProviderResources - build', () => {
  it('maps auth types to secret authType values', () => {
    expect(getAuthTypeValue(OpenstackAuthType.Password)).toBe('password');
    expect(getAuthTypeValue(OpenstackAuthType.TokenWithUsername)).toBe('token');
    expect(getAuthTypeValue(OpenstackAuthType.ApplicationCredentialId)).toBe(
      'applicationcredential',
    );
  });

  it('encodes password auth fields into the secret', () => {
    const { secret } = buildOpenstackProviderResources({
      [ProviderFormFieldId.CertificateValidation]: CertificateValidationMode.Skip,
      [ProviderFormFieldId.OpenstackAuthType]: OpenstackAuthType.Password,
      [ProviderFormFieldId.OpenstackDomainName]: 'Default',
      [ProviderFormFieldId.OpenstackPassword]: 'secret',
      [ProviderFormFieldId.OpenstackProjectName]: 'admin',
      [ProviderFormFieldId.OpenstackRegionName]: 'RegionOne',
      [ProviderFormFieldId.OpenstackUrl]: 'https://keystone',
      [ProviderFormFieldId.OpenstackUsername]: 'admin',
      [ProviderFormFieldId.ProviderName]: 'os',
      [ProviderFormFieldId.ProviderProject]: 'ns',
      [ProviderFormFieldId.ProviderType]: 'openstack',
      [ProviderFormFieldId.ShowDefaultProjects]: false,
    });

    expect(decode(secret.data?.authType ?? '')).toBe('password');
    expect(secret.data?.username).toBeDefined();
    expect(secret.data?.password).toBeDefined();
  });
});
