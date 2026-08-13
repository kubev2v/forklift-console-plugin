import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { onDiskDecryptionConfirm } from '../utils';

const mockK8sPatch = jest.fn();
const mockK8sCreate = jest.fn();
const mockK8sDelete = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn((...args) => mockK8sCreate(...args)),
  k8sDelete: jest.fn((...args) => mockK8sDelete(...args)),
  k8sPatch: jest.fn((...args) => mockK8sPatch(...args)),
}));

const plan = {
  metadata: { name: 'test-plan', namespace: 'test-ns', uid: 'plan-uid' },
  spec: {
    vms: [{ luks: { name: 'plan-owned-luks' }, name: 'vm-1' }],
  },
} as unknown as V1beta1Plan;

const findSecretDataPatch = ():
  { data: { op: string; path: string; value?: unknown }[] } | undefined =>
  mockK8sPatch.mock.calls
    .map(([arg]) => arg)
    .find((arg) => arg?.data?.some((op: { path?: string }) => op.path === '/data'));

describe('onDiskDecryptionConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockImplementation(({ data }) => {
      if (data?.[0]?.path === '/data') {
        return Promise.resolve({
          data: data[0].value,
          metadata: {
            labels: { [SOURCE_SECRET_LABEL]: 'luks-test-secret' },
            name: 'plan-owned-luks',
            namespace: 'test-ns',
          },
        });
      }
      return Promise.resolve(plan);
    });
  });

  it('removes source-secret label when updating existing secret with passphrases', async () => {
    await onDiskDecryptionConfirm({
      nbdeClevis: false,
      newValue: JSON.stringify(['new-passphrase']),
      resource: plan,
      stripSourceSecretLabel: true,
    });

    const secretPatchCall = findSecretDataPatch();
    expect(secretPatchCall).toBeDefined();
    expect(secretPatchCall?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ op: REPLACE, path: '/data' }),
        expect.objectContaining({
          op: REMOVE,
          path: `/metadata/labels/${SOURCE_SECRET_LABEL.replaceAll('/', '~1')}`,
        }),
      ]),
    );
  });

  it('does not remove source-secret label when secret was never a copy', async () => {
    await onDiskDecryptionConfirm({
      nbdeClevis: false,
      newValue: JSON.stringify(['new-passphrase']),
      resource: plan,
      stripSourceSecretLabel: false,
    });

    const secretPatchCall = findSecretDataPatch();
    expect(secretPatchCall).toBeDefined();
    expect(secretPatchCall?.data).toEqual([
      { op: REPLACE, path: '/data', value: { 0: btoa('new-passphrase') } },
    ]);
  });
});
