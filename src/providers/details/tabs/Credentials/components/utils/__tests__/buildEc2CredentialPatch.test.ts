import { decode, encode } from 'js-base64';
import { ProviderFormFieldId } from 'src/providers/create/fields/constants';

import { describe, expect, it } from '@jest/globals';

import { buildEc2CredentialPatch, type SecretDataPatchOperation } from '../buildEc2CredentialPatch';

const formData = {
  [ProviderFormFieldId.Ec2AccessKeyId]: ' NEWKEY ',
  [ProviderFormFieldId.Ec2SecretAccessKey]: 'new-secret',
};

const valuesByPath = (operations: SecretDataPatchOperation[]): Record<string, string> =>
  Object.fromEntries(operations.map(({ path, value }) => [path, decode(value)]));

describe('buildEc2CredentialPatch', () => {
  it('patches only the edited source keys, preserving independent target keys', () => {
    const operations = buildEc2CredentialPatch(formData, {
      accessKeyId: encode('OLDKEY'),
      secretAccessKey: encode('old-secret'),
      targetAccessKeyId: encode('TARGETKEY'),
      targetSecretAccessKey: encode('target-secret'),
    });

    expect(operations.map(({ path }) => path)).toEqual([
      '/data/accessKeyId',
      '/data/secretAccessKey',
    ]);
    expect(valuesByPath(operations)).toEqual({
      '/data/accessKeyId': 'NEWKEY',
      '/data/secretAccessKey': 'new-secret',
    });
  });

  it('rotates target keys that were inherited from the source credentials', () => {
    const operations = buildEc2CredentialPatch(formData, {
      accessKeyId: encode('OLDKEY'),
      secretAccessKey: encode('old-secret'),
      targetAccessKeyId: encode('OLDKEY'),
      targetSecretAccessKey: encode('old-secret'),
    });

    expect(valuesByPath(operations)).toEqual({
      '/data/accessKeyId': 'NEWKEY',
      '/data/secretAccessKey': 'new-secret',
      '/data/targetAccessKeyId': 'NEWKEY',
      '/data/targetSecretAccessKey': 'new-secret',
    });
  });

  it('does not touch target keys when the existing secret has none', () => {
    const operations = buildEc2CredentialPatch(formData, { accessKeyId: encode('OLDKEY') });

    expect(operations).toHaveLength(2);
  });
});
