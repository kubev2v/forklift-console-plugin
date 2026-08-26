import { encode } from 'js-base64';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { createProviderSecret } from '../createProviderSecret';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

jest.mock('@utils/crds/common/selectors', () => ({
  getUrl: (provider: { spec?: { url?: string } }) => provider?.spec?.url,
}));

const mockCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

describe('createProviderSecret - behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ metadata: { name: 'secret-1' } } as never);
  });

  it('returns undefined when secret or provider is missing', async () => {
    expect(await createProviderSecret(undefined as never, { data: {} } as never)).toBeUndefined();
    expect(
      await createProviderSecret({ metadata: { name: 'p' } } as never, undefined as never),
    ).toBeUndefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates a secret with cleaned data, url, generateName and labels', async () => {
    const provider = {
      metadata: { name: 'vsphere' },
      spec: { type: 'vsphere', url: 'https://vcenter.example.com' },
    };
    const secret = {
      data: {
        cacert: encode('cert'),
        insecureSkipVerify: encode('false'),
        password: encode('secret'),
        user: '',
      },
      metadata: { labels: { existing: 'yes' }, namespace: 'ns' },
    };

    await createProviderSecret(provider as never, secret as never);

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
      }),
    );
    const createdData = mockCreate.mock.calls[0][0].data.data as Record<string, string>;
    expect(createdData.user).toBeUndefined();
  });

  it('drops cacert when insecureSkipVerify is true', async () => {
    const provider = { metadata: { name: 'p' }, spec: { type: 'ovirt', url: 'https://x' } };
    const secret = {
      data: {
        cacert: encode('cert'),
        insecureSkipVerify: encode('true'),
        password: encode('pw'),
      },
      metadata: { namespace: 'ns' },
    };

    await createProviderSecret(provider as never, secret as never);
    const createdData = mockCreate.mock.calls[0][0].data.data as Record<string, string>;
    expect(createdData.cacert).toBeUndefined();
    expect(createdData.insecureSkipVerify).toBe(encode('true'));
  });
});
