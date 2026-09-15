import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION, YES_VALUE } from 'src/providers/utils/constants';

import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
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

  it('attaches secret ref and strips empty settings keys', async () => {
    const provider: V1beta1Provider = {
      metadata: { name: 'p', namespace: 'ns' },
      spec: {
        settings: { keep: 'value', removeMe: '' },
        type: 'vsphere',
        url: 'https://vc',
      },
    };
    const secret = { metadata: { name: 'sec', namespace: 'ns' } } as never;

    await createProvider(provider, secret);

    const [createArg] = mockK8sCreate.mock.calls[0] as unknown as [
      { data: V1beta1Provider; model: unknown },
    ];
    expect(createArg.model).toBe(ProviderModel);
    expect(createArg.data.spec?.secret).toEqual({ name: 'sec', namespace: 'ns' });
    expect(createArg.data.spec?.settings).toEqual({ keep: 'value' });
  });

  it('creates provider without secret when secret is omitted', async () => {
    const provider: V1beta1Provider = {
      metadata: { name: 'p', namespace: 'ns' },
      spec: { type: 'ova', url: 'host:/ova' },
    };

    await createProvider(provider, undefined);
    const [createArg] = mockK8sCreate.mock.calls[0] as unknown as [{ data: V1beta1Provider }];
    expect(createArg.data.spec?.secret).toBeUndefined();
  });

  it('clears vddk settings when empty-VDDK annotation is yes', async () => {
    const provider: V1beta1Provider = {
      metadata: {
        annotations: { [EMPTY_VDDK_INIT_IMAGE_ANNOTATION]: YES_VALUE },
        name: 'p',
        namespace: 'ns',
      },
      spec: {
        settings: {
          useVddkAioOptimization: 'true',
          vddkInitImage: 'quay.io/konveyor/vddk-test:latest',
        },
        type: 'vsphere',
        url: 'https://vc',
      },
    };

    await createProvider(provider, undefined);
    const [createArg] = mockK8sCreate.mock.calls[0] as unknown as [{ data: V1beta1Provider }];
    expect(createArg.data.spec?.settings?.vddkInitImage).toBeUndefined();
    expect(createArg.data.spec?.settings?.useVddkAioOptimization).toBeUndefined();
  });
});
