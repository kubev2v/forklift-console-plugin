import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));

import { SecretModel } from '@forklift-ui/types';

import { patchProviderSecretOwner } from '../patchProviderSecretOwner';

const ownerValue = [
  {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    name: 'p',
    uid: 'uid',
  },
];

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
        data: [{ op: 'add', path: '/metadata/ownerReferences', value: ownerValue }],
        model: SecretModel,
        resource: secret,
      }),
    );

    const replaceSecret = {
      metadata: { name: 's', ownerReferences: [{ name: 'old' }] },
    } as never;
    await patchProviderSecretOwner(provider, replaceSecret);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/metadata/ownerReferences', value: ownerValue }],
        model: SecretModel,
        resource: replaceSecret,
      }),
    );
  });
});
