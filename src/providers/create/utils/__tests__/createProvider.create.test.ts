import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sCreate = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: (...args: unknown[]) => mockK8sCreate(...args),
}));

import { ProviderModel } from '@forklift-ui/types';

import { createProvider } from '../createProvider';

describe('createProvider - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(async ({ data }) => data);
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

    const { data } = mockK8sCreate.mock.calls[0][0];
    expect(data.spec.secret).toEqual({ name: 'sec', namespace: 'ns' });
    expect(mockK8sCreate.mock.calls[0][0].model).toBe(ProviderModel);
  });

  it('creates provider without secret when secret is omitted', async () => {
    const provider = {
      metadata: { name: 'p', namespace: 'ns' },
      spec: { type: 'ova', url: 'host:/ova' },
    } as never;

    await createProvider(provider, undefined);
    expect(mockK8sCreate.mock.calls[0][0].data.spec.secret).toBeUndefined();
  });
});
