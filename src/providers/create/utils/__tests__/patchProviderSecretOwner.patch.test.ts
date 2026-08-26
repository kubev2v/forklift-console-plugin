import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { SecretModel } from '@forklift-ui/types';

import { patchProviderSecretOwner } from '../patchProviderSecretOwner';

describe('patchProviderSecretOwner - patch', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('no-ops when provider or secret is missing', async () => {
    await patchProviderSecretOwner(undefined, undefined);
    await patchProviderSecretOwner({ metadata: { name: 'p' } } as never, undefined);
    expect(mockK8sPatch).not.toHaveBeenCalled();
  });

  it('ADDs ownerReferences when absent and REPLACEs when present', async () => {
    const provider = { metadata: { name: 'p', uid: 'uid' } } as never;
    const secret = { metadata: { name: 's' } } as never;

    await patchProviderSecretOwner(provider, secret);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'add',
            path: '/metadata/ownerReferences',
            value: [
              {
                apiVersion: 'forklift.konveyor.io/v1beta1',
                kind: 'Provider',
                name: 'p',
                uid: 'uid',
              },
            ],
          },
        ],
        model: SecretModel,
        resource: secret,
      }),
    );

    await patchProviderSecretOwner(provider, {
      metadata: { name: 's', ownerReferences: [{ name: 'old' }] },
    } as never);
    expect(mockK8sPatch.mock.calls[1][0].data[0].op).toBe('replace');
  });
});
