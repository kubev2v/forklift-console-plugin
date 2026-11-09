import { encode } from 'js-base64';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { ProviderFormFieldId } from 'src/providers/create/fields/constants';

import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';

import { patchEc2Credentials } from '../patchEc2Credentials';

describe('patchEc2Credentials - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches only the edited EC2 keys on the secret resource', async () => {
    const secret: IoK8sApiCoreV1Secret = {
      data: {
        accessKeyId: encode('OLDKEY'),
        secretAccessKey: encode('old-secret'),
        targetAccessKeyId: encode('TARGETKEY'),
        targetSecretAccessKey: encode('target-secret'),
      },
      metadata: { name: 'ec2-secret', namespace: 'ns' },
    };

    await patchEc2Credentials(secret, {
      [ProviderFormFieldId.Ec2AccessKeyId]: 'NEWKEY',
      [ProviderFormFieldId.Ec2SecretAccessKey]: 'new-secret',
    });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { op: 'add', path: '/data/accessKeyId', value: encode('NEWKEY') },
          { op: 'add', path: '/data/secretAccessKey', value: encode('new-secret') },
        ],
        model: SecretModel,
        resource: secret,
      }),
    );
  });
});
