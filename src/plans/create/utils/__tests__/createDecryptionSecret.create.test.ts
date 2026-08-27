import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { SecretModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { createDecryptionSecret } from '../createDecryptionSecret';

const mockK8sCreate = k8sCreate as unknown as jest.Mock;

describe('createDecryptionSecret - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation((...args: unknown[]) => {
      const [{ data }] = args as [{ data: Record<string, unknown> }];
      return Promise.resolve(data);
    });
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

    const [firstCall] = mockK8sCreate.mock.calls;
    const [createArg] = firstCall as [{ data: { data: Record<string, string> } }];
    expect(createArg.data.data).toEqual({});
  });
});
