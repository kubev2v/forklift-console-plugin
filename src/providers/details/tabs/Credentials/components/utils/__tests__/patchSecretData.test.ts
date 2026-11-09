import { Base64 } from 'js-base64';
import { CA_CERT_SECRET_KEY, SecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { patchSecretData } from '../patchSecretData';

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sPatch: jest.fn(),
}));

type PatchData = {
  op: string;
  path: string;
  value: Record<string, string>;
};

type PatchConfig = {
  data: PatchData[];
};

const mockPatch = k8sPatch as jest.MockedFunction<typeof k8sPatch>;

// k8sPatch receives a single config object: { data: [{ op, path, value }], model, resource }
const getPatchData = (): PatchData => {
  const [config] = mockPatch.mock.calls[0] as unknown as [PatchConfig];
  return config.data[0];
};

const secretWith = (data: Record<string, string>): IoK8sApiCoreV1Secret => ({
  data,
  metadata: { name: 'secret', namespace: 'ns' },
});

describe('patchSecretData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatch.mockResolvedValue(secretWith({}));
  });

  it('REPLACE-patches a configured CA certificate to the canonical ca.crt key', async () => {
    const encodedCaCert = Base64.encode('canonical-cert');

    await patchSecretData(
      secretWith({
        [CA_CERT_SECRET_KEY]: encodedCaCert,
        insecureSkipVerify: Base64.encode('false'),
      }),
    );

    expect(mockPatch).toHaveBeenCalledTimes(1);

    const patch = getPatchData();

    expect(patch.op).toBe('replace');
    expect(patch.path).toBe('/data');
    expect(patch.value[CA_CERT_SECRET_KEY]).toBe(encodedCaCert);
    expect(patch.value[SecretFieldsId.CaCert]).toBeUndefined();
  });

  it('drops both CA certificate keys when insecureSkipVerify is true', async () => {
    await patchSecretData(
      secretWith({
        [CA_CERT_SECRET_KEY]: Base64.encode('canonical-cert'),
        [SecretFieldsId.CaCert]: Base64.encode('legacy-cert'),
        insecureSkipVerify: Base64.encode('true'),
      }),
    );

    const patch = getPatchData();

    expect(patch.value[CA_CERT_SECRET_KEY]).toBeUndefined();
    expect(patch.value[SecretFieldsId.CaCert]).toBeUndefined();
    expect(patch.value.insecureSkipVerify).toBe(Base64.encode('true'));
  });
});
