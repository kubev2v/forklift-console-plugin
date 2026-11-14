import { encode } from 'js-base64';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { ProviderFormFieldId } from 'src/providers/create/fields/constants';

import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';

import { patchEc2Credentials } from '../patchEc2Credentials';

import { applyJsonPatch, type PatchOperation } from './applyJsonPatch';

const formData = {
  [ProviderFormFieldId.Ec2AccessKeyId]: 'NEWKEY',
  [ProviderFormFieldId.Ec2SecretAccessKey]: 'new-secret',
};

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

    await patchEc2Credentials(secret, formData);

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

  it('rejects a stale save through the resourceVersion of the loaded secret', async () => {
    const secret: IoK8sApiCoreV1Secret = {
      data: {
        accessKeyId: encode('OLDKEY'),
        secretAccessKey: encode('old-secret'),
      },
      metadata: { name: 'ec2-secret', namespace: 'ns', resourceVersion: '4711' },
    };

    await patchEc2Credentials(secret, formData);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          { op: 'test', path: '/metadata/resourceVersion', value: '4711' },
        ]),
      }),
    );
  });

  it('creates the data map for a secret without data keys', async () => {
    const secret: IoK8sApiCoreV1Secret = {
      metadata: { name: 'ec2-secret', namespace: 'ns', resourceVersion: '4711' },
    };

    await patchEc2Credentials(secret, formData);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { op: 'test', path: '/metadata/resourceVersion', value: '4711' },
          {
            op: 'add',
            path: '/data',
            value: { accessKeyId: encode('NEWKEY'), secretAccessKey: encode('new-secret') },
          },
        ],
      }),
    );
  });

  it('rejects a stale save and keeps target keys rotated after the dialog loaded', async () => {
    const loadedSecret: IoK8sApiCoreV1Secret = {
      data: {
        accessKeyId: encode('OLDKEY'),
        secretAccessKey: encode('old-secret'),
        targetAccessKeyId: encode('OLDKEY'),
        targetSecretAccessKey: encode('old-secret'),
      },
      metadata: { name: 'ec2-secret', namespace: 'ns', resourceVersion: '4711' },
    };

    await patchEc2Credentials(loadedSecret, formData);

    const patchRequest = mockK8sPatch.mock.calls[0][0] as { data: PatchOperation[] };
    const rotatedSecret = {
      data: {
        ...loadedSecret.data,
        targetAccessKeyId: encode('ROTATEDKEY'),
        targetSecretAccessKey: encode('rotated-secret'),
      },
      metadata: { resourceVersion: '4712' },
    };

    expect(() => applyJsonPatch(rotatedSecret, patchRequest.data)).toThrow(
      'test operation failed for /metadata/resourceVersion',
    );
    expect(rotatedSecret.data?.targetAccessKeyId).toBe(encode('ROTATEDKEY'));
    expect(rotatedSecret.data?.targetSecretAccessKey).toBe(encode('rotated-secret'));
  });
});
