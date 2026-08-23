import type {
  IoK8sApiCoreV1ConfigMap,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

jest.mock('src/plans/create/utils/addOwnerRefs', () => ({
  addOwnerRefs: jest.fn(() => Promise.resolve()),
}));

jest.mock('@utils/crds/common/utils', () => ({
  getRandomChars: (): string => 'abcde',
}));

export const mockK8sCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

export const basePlan = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: { name: 'original-plan', namespace: 'openshift-mtv', uid: 'plan-uid-1' },
  spec: {
    archived: false,
    map: {
      network: { name: 'old-netmap', namespace: 'openshift-mtv' },
      storage: { name: 'old-storagemap', namespace: 'openshift-mtv' },
    },
    provider: {
      destination: { name: 'target', namespace: 'openshift-mtv' },
      source: { name: 'source', namespace: 'openshift-mtv' },
    },
    targetNamespace: 'default',
    vms: [
      {
        hooks: [
          { hook: { name: 'original-plan-pre-hook', namespace: 'openshift-mtv' }, step: 'PreHook' },
          {
            hook: { name: 'original-plan-post-hook', namespace: 'openshift-mtv' },
            step: 'PostHook',
          },
        ],
        id: 'vm-1',
        name: 'test-vm',
      },
    ],
  },
} satisfies V1beta1Plan;

export const baseNetworkMap: V1beta1NetworkMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'NetworkMap',
  metadata: { name: 'old-netmap', namespace: 'openshift-mtv' },
  spec: { map: [], provider: { destination: { name: 'target' }, source: { name: 'source' } } },
};

export const baseStorageMap: V1beta1StorageMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'StorageMap',
  metadata: { name: 'old-storagemap', namespace: 'openshift-mtv' },
  spec: { map: [], provider: { destination: { name: 'target' }, source: { name: 'source' } } },
};

export const preHook: V1beta1Hook = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: { name: 'original-plan-pre-hook', namespace: 'openshift-mtv' },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: 'pre-playbook' },
};

export const postHook: V1beta1Hook = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: { name: 'original-plan-post-hook', namespace: 'openshift-mtv' },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: 'post-playbook' },
};

export const configMap: IoK8sApiCoreV1ConfigMap = {
  apiVersion: 'v1',
  data: { 'script.sh': '#!/bin/bash\necho hello' },
  kind: 'ConfigMap',
  metadata: { name: 'original-plan-scripts', namespace: 'openshift-mtv' },
};

export const setupK8sCreateMock = (): void => {
  mockK8sCreate.mockImplementation(({ data }) =>
    Promise.resolve({
      ...data,
      metadata: { ...data.metadata, uid: `uid-${data.metadata?.name}` },
    }),
  );
};
