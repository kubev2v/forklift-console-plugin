import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: unknown[]) => mockK8sCreate(...args),
}));

import { SecretModel } from '@forklift-ui/types';

import { createDecryptionSecret } from '../createDecryptionSecret';

describe('createDecryptionSecret - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(async ({ data }) => data);
  });

  it('base64-encodes passphrases keyed by index', async () => {
    await createDecryptionSecret([{ value: 'one' }, { value: 'two' }], 'plan', 'ns');

    expect(mockK8sCreate).toHaveBeenCalledWith({
      data: {
        data: {
          '0': btoa('one'),
          '1': btoa('two'),
        },
        metadata: { generateName: 'plan-', namespace: 'ns' },
        type: 'Opaque',
      },
      model: SecretModel,
    });
  });

  it('creates an empty data object when no passphrases are provided', async () => {
    await createDecryptionSecret([], 'plan', 'ns');

    expect(mockK8sCreate.mock.calls[0][0].data.data).toEqual({});
  });
});
