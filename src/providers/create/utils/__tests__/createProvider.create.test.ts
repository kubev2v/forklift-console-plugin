import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { ProviderModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { createProvider } from '../createProvider';

const mockK8sCreate = k8sCreate as unknown as jest.Mock;

describe('createProvider - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation((...args: unknown[]) => {
      const [{ data }] = args as [{ data: unknown }];
      return Promise.resolve(data);
    });
  });

  it('returns undefined when provider is missing', async () => {
    await expect(createProvider(undefined as never, undefined)).resolves.toBeUndefined();
  });

  it('attaches secret ref to the provider before create', async () => {
    const provider = {
      metadata: { name: 'p', namespace: 'ns' },
      spec: { type: 'vsphere', url: 'https://vc' },
    } as never;
    const secret = { metadata: { name: 'sec', namespace: 'ns' } } as never;

    await createProvider(provider, secret);

    const [createArg] = mockK8sCreate.mock.calls[0] as unknown as [
      { data: { spec: { secret?: { name: string; namespace: string } } }; model: unknown },
    ];
    expect(createArg.data.spec.secret).toEqual({ name: 'sec', namespace: 'ns' });
    expect(createArg.model).toBe(ProviderModel);
  });

  it('creates provider without secret when secret is omitted', async () => {
    const provider = {
      metadata: { name: 'p', namespace: 'ns' },
      spec: { type: 'ova', url: 'host:/ova' },
    } as never;

    await createProvider(provider, undefined);
    const [createArg] = mockK8sCreate.mock.calls[0] as unknown as [
      { data: { spec: { secret?: unknown } } },
    ];
    expect(createArg.data.spec.secret).toBeUndefined();
  });
});
