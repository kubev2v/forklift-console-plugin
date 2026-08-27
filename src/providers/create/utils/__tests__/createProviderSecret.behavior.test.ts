import { encode } from 'js-base64';

import {
  type IoK8sApiCoreV1Secret,
  SecretModel,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { createProviderSecret } from '../createProviderSecret';

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sCreate: jest.fn(),
}));

jest.mock('@utils/crds/common/selectors', (): unknown => ({
  getUrl: (provider: { spec?: { url?: string } }) => provider?.spec?.url,
}));

const mockCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

const createdSecret: IoK8sApiCoreV1Secret = { metadata: { name: 'secret-1' } };

describe('createProviderSecret - behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue(createdSecret);
  });

  it('returns undefined when secret or provider is missing', async () => {
    const provider: V1beta1Provider = { metadata: { name: 'p' } };
    const secret: IoK8sApiCoreV1Secret = { data: {} };

    expect(
      await createProviderSecret(undefined as unknown as V1beta1Provider, secret),
    ).toBeUndefined();
    expect(
      await createProviderSecret(provider, undefined as unknown as IoK8sApiCoreV1Secret),
    ).toBeUndefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates a secret with cleaned data, url, generateName and labels', async () => {
    const provider: V1beta1Provider = {
      metadata: { name: 'vsphere' },
      spec: { type: 'vsphere', url: 'https://vcenter.example.com' },
    };
    const secret: IoK8sApiCoreV1Secret = {
      data: {
        cacert: encode('cert'),
        insecureSkipVerify: encode('false'),
        password: encode('secret'),
        user: '',
      },
      metadata: { labels: { existing: 'yes' }, namespace: 'ns' },
    };

    const result = await createProviderSecret(provider, secret);

    expect(result).toBe(createdSecret);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          data: expect.objectContaining({
            cacert: encode('cert'),
            password: encode('secret'),
            url: encode('https://vcenter.example.com'),
          }),
          metadata: expect.objectContaining({
            generateName: 'vsphere-',
            labels: expect.objectContaining({
              createdForProviderType: 'vsphere',
              createdForResourceType: 'providers',
              existing: 'yes',
            }),
          }),
        }),
        model: SecretModel,
      }),
    );
    const [createArg] = mockCreate.mock.calls[0];
    expect(createArg?.data.data?.user).toBeUndefined();
  });

  it('drops cacert when insecureSkipVerify is true', async () => {
    const provider: V1beta1Provider = {
      metadata: { name: 'p' },
      spec: { type: 'ovirt', url: 'https://x' },
    };
    const secret: IoK8sApiCoreV1Secret = {
      data: {
        cacert: encode('cert'),
        insecureSkipVerify: encode('true'),
        password: encode('pw'),
      },
      metadata: { namespace: 'ns' },
    };

    await createProviderSecret(provider, secret);
    const [createArg] = mockCreate.mock.calls[0];
    expect(createArg?.data.data?.cacert).toBeUndefined();
    expect(createArg?.data.data?.insecureSkipVerify).toBe(encode('true'));
  });
});
