import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { IoK8sApiCoreV1Secret, V1beta1Plan } from '@forklift-ui/types';
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

const labeledSecret = {
  data: { 0: btoa('old-passphrase') },
  metadata: {
    labels: { [SOURCE_SECRET_LABEL]: 'luks-test-secret' },
    name: 'plan-owned-luks',
    namespace: 'test-ns',
  },
} as unknown as IoK8sApiCoreV1Secret;

const unlabeledSecret = {
  data: { 0: btoa('old-passphrase') },
  metadata: {
    name: 'plan-owned-luks',
    namespace: 'test-ns',
  },
} as unknown as IoK8sApiCoreV1Secret;

const findSecretDataPatch = ():
  { data: { op: string; path: string; value?: unknown }[] } | undefined =>
  mockK8sPatch.mock.calls
    .map(([arg]) => arg)
    .find((arg) => arg?.data?.some((op: { path?: string }) => op.path === '/data'));

const findSecretLabelRemovePatch = ():
  { data: { op: string; path: string; value?: unknown }[] } | undefined =>
  mockK8sPatch.mock.calls
    .map(([arg]) => arg)
    .find((arg) =>
      arg?.data?.some(
        (op: { op?: string; path?: string }) => op.op === REMOVE && op.path !== '/data',
      ),
    );

const sourceSecretLabelPatchPath = `/metadata/labels/${SOURCE_SECRET_LABEL.replaceAll('~', '~0').replaceAll('/', '~1')}`;

describe('onDiskDecryptionConfirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sPatch.mockImplementation(({ data }) => {
      if (data?.[0]?.path === '/data') {
        return Promise.resolve({
          data: data[0].value,
          metadata: {
            name: 'plan-owned-luks',
            namespace: 'test-ns',
          },
        });
      }
      return Promise.resolve(plan);
    });
  });

  it('replaces secret data then best-effort removes source-secret label', async () => {
    await onDiskDecryptionConfirm({
      currentSecret: labeledSecret,
      nbdeClevis: false,
      newValue: JSON.stringify(['new-passphrase']),
      resource: plan,
    });

    const secretPatchCall = findSecretDataPatch();
    expect(secretPatchCall).toBeDefined();
    expect(secretPatchCall?.data).toEqual([
      { op: REPLACE, path: '/data', value: { 0: btoa('new-passphrase') } },
    ]);

    const labelRemovePatch = findSecretLabelRemovePatch();
    expect(labelRemovePatch?.data).toEqual([{ op: REMOVE, path: sourceSecretLabelPatchPath }]);

    const dataPatchIndex = mockK8sPatch.mock.calls.findIndex(([arg]) =>
      arg?.data?.some((op: { path?: string }) => op.path === '/data'),
    );
    const labelPatchIndex = mockK8sPatch.mock.calls.findIndex(([arg]) =>
      arg?.data?.some((op: { op?: string }) => op.op === REMOVE),
    );
    expect(dataPatchIndex).toBeGreaterThanOrEqual(0);
    expect(labelPatchIndex).toBeGreaterThan(dataPatchIndex);
  });

  it('still updates passphrases when label REMOVE fails', async () => {
    mockK8sPatch.mockImplementation(({ data }) => {
      if (data?.[0]?.op === REMOVE) {
        return Promise.reject(new Error('422 Unprocessable Entity'));
      }
      if (data?.[0]?.path === '/data') {
        return Promise.resolve({
          data: data[0].value,
          metadata: {
            name: 'plan-owned-luks',
            namespace: 'test-ns',
          },
        });
      }
      return Promise.resolve(plan);
    });

    await expect(
      onDiskDecryptionConfirm({
        currentSecret: labeledSecret,
        nbdeClevis: false,
        newValue: JSON.stringify(['new-passphrase']),
        resource: plan,
      }),
    ).resolves.toBeDefined();

    expect(findSecretDataPatch()?.data).toEqual([
      { op: REPLACE, path: '/data', value: { 0: btoa('new-passphrase') } },
    ]);
  });

  it('does not remove source-secret label when secret was never a copy', async () => {
    await onDiskDecryptionConfirm({
      currentSecret: unlabeledSecret,
      nbdeClevis: false,
      newValue: JSON.stringify(['new-passphrase']),
      resource: plan,
    });

    const secretPatchCall = findSecretDataPatch();
    expect(secretPatchCall).toBeDefined();
    expect(secretPatchCall?.data).toEqual([
      { op: REPLACE, path: '/data', value: { 0: btoa('new-passphrase') } },
    ]);
    expect(findSecretLabelRemovePatch()).toBeUndefined();
  });

  it('does not remove source-secret label when currentSecret is omitted', async () => {
    await onDiskDecryptionConfirm({
      nbdeClevis: false,
      newValue: JSON.stringify(['new-passphrase']),
      resource: plan,
    });

    const secretPatchCall = findSecretDataPatch();
    expect(secretPatchCall).toBeDefined();
    expect(secretPatchCall?.data).toEqual([
      { op: REPLACE, path: '/data', value: { 0: btoa('new-passphrase') } },
    ]);
    expect(findSecretLabelRemovePatch()).toBeUndefined();
  });
});
