import type {
  IoK8sApiCoreV1ConfigMap,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { createDuplicatePlanAndMapResources } from '../utils';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

jest.mock('src/plans/create/utils/addOwnerRefs', () => ({
  addOwnerRefs: jest.fn(async () => {
    await Promise.resolve();
  }),
}));

jest.mock('@utils/crds/common/utils', () => ({
  getRandomChars: () => 'abcde',
}));

const mockK8sCreate = k8sCreate as jest.MockedFunction<typeof k8sCreate>;

const basePlan: V1beta1Plan = {
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
};

const baseNetworkMap: V1beta1NetworkMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'NetworkMap',
  metadata: { name: 'old-netmap', namespace: 'openshift-mtv' },
  spec: { map: [], provider: { destination: { name: 'target' }, source: { name: 'source' } } },
};

const baseStorageMap: V1beta1StorageMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'StorageMap',
  metadata: { name: 'old-storagemap', namespace: 'openshift-mtv' },
  spec: { map: [], provider: { destination: { name: 'target' }, source: { name: 'source' } } },
};

const preHook: V1beta1Hook = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: { name: 'original-plan-pre-hook', namespace: 'openshift-mtv' },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: 'pre-playbook' },
};

const postHook: V1beta1Hook = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: { name: 'original-plan-post-hook', namespace: 'openshift-mtv' },
  spec: { image: 'quay.io/konveyor/hook-runner', playbook: 'post-playbook' },
};

const configMap: IoK8sApiCoreV1ConfigMap = {
  apiVersion: 'v1',
  data: { 'script.sh': '#!/bin/bash\necho hello' },
  kind: 'ConfigMap',
  metadata: { name: 'original-plan-scripts', namespace: 'openshift-mtv' },
};

describe('createDuplicatePlanAndMapResources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockK8sCreate.mockImplementation(async ({ data }) => {
      const result = await Promise.resolve({
        ...data,
        metadata: { ...data.metadata, uid: `uid-${data.metadata?.name}` },
      });
      return result;
    });
  });

  it('creates duplicated hooks when plan has hooks', async () => {
    await createDuplicatePlanAndMapResources({
      configMap: undefined,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: basePlan,
      postHook,
      preHook,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const hookCreates = createCalls.filter(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'Hook',
    );

    expect(hookCreates).toHaveLength(2);

    const preHookData = (hookCreates[0][0] as { data: V1beta1Hook }).data;
    expect(preHookData.metadata?.name).toBe('copy-of-plan-pre-hook-abcde');
    expect(preHookData.spec?.playbook).toBe('pre-playbook');

    const postHookData = (hookCreates[1][0] as { data: V1beta1Hook }).data;
    expect(postHookData.metadata?.name).toBe('copy-of-plan-post-hook-abcde');
    expect(postHookData.spec?.playbook).toBe('post-playbook');
  });

  it('creates duplicated ConfigMap when plan has customization scripts', async () => {
    const planWithScripts: V1beta1Plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec!,
        customizationScripts: { name: 'original-plan-scripts', namespace: 'openshift-mtv' },
        vms: [{ id: 'vm-1', name: 'test-vm' }],
      },
    };

    await createDuplicatePlanAndMapResources({
      configMap,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: planWithScripts,
      postHook: undefined,
      preHook: undefined,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const configMapCreates = createCalls.filter(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'ConfigMap',
    );

    expect(configMapCreates).toHaveLength(1);

    const cmData = (configMapCreates[0][0] as { data: IoK8sApiCoreV1ConfigMap }).data;
    expect(cmData.metadata?.name).toBe('copy-of-plan-scripts-abcde');
    expect(cmData.data).toEqual({ 'script.sh': '#!/bin/bash\necho hello' });
  });

  it('updates plan vms hooks to reference new hooks', async () => {
    await createDuplicatePlanAndMapResources({
      configMap: undefined,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: basePlan,
      postHook,
      preHook,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const planCreate = createCalls.find(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'Plan',
    );

    expect(planCreate).toBeDefined();
    const planData = (planCreate![0] as { data: V1beta1Plan }).data;
    const vmHooks = planData.spec?.vms?.[0]?.hooks;

    expect(vmHooks).toHaveLength(2);
    expect(vmHooks?.[0]?.hook?.name).toBe('copy-of-plan-pre-hook-abcde');
    expect(vmHooks?.[1]?.hook?.name).toBe('copy-of-plan-post-hook-abcde');
  });

  it('sets customizationScripts on new plan referencing the new ConfigMap', async () => {
    const planWithScripts: V1beta1Plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec!,
        customizationScripts: { name: 'original-plan-scripts', namespace: 'openshift-mtv' },
        vms: [{ id: 'vm-1', name: 'test-vm' }],
      },
    };

    await createDuplicatePlanAndMapResources({
      configMap,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: planWithScripts,
      postHook: undefined,
      preHook: undefined,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const planCreate = createCalls.find(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'Plan',
    );

    expect(planCreate).toBeDefined();
    const planData = (planCreate![0] as { data: V1beta1Plan }).data;
    expect(planData.spec?.customizationScripts?.name).toBe('copy-of-plan-scripts-abcde');
    expect(planData.spec?.customizationScripts?.namespace).toBe('openshift-mtv');
  });

  it('does not create hooks when plan has no hooks', async () => {
    const planNoHooks: V1beta1Plan = {
      ...basePlan,
      spec: { ...basePlan.spec!, vms: [{ id: 'vm-1', name: 'test-vm' }] },
    };

    await createDuplicatePlanAndMapResources({
      configMap: undefined,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: planNoHooks,
      postHook: undefined,
      preHook: undefined,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const hookCreates = createCalls.filter(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'Hook',
    );

    expect(hookCreates).toHaveLength(0);
  });

  it('does not create ConfigMap when plan has no customization scripts', async () => {
    const planNoScripts: V1beta1Plan = {
      ...basePlan,
      spec: { ...basePlan.spec!, vms: [{ id: 'vm-1', name: 'test-vm' }] },
    };

    await createDuplicatePlanAndMapResources({
      configMap: undefined,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: planNoScripts,
      postHook: undefined,
      preHook: undefined,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const configMapCreates = createCalls.filter(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'ConfigMap',
    );

    expect(configMapCreates).toHaveLength(0);
  });

  it('always creates new NetworkMap and StorageMap', async () => {
    const planNoHooks: V1beta1Plan = {
      ...basePlan,
      spec: { ...basePlan.spec!, vms: [{ id: 'vm-1', name: 'test-vm' }] },
    };

    await createDuplicatePlanAndMapResources({
      configMap: undefined,
      networkMap: baseNetworkMap,
      newPlanName: 'copy-of-plan',
      plan: planNoHooks,
      postHook: undefined,
      preHook: undefined,
      storageMap: baseStorageMap,
    });

    const createCalls = mockK8sCreate.mock.calls;
    const networkMapCreates = createCalls.filter(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'NetworkMap',
    );
    const storageMapCreates = createCalls.filter(
      ([args]) => (args as { data: { kind: string } }).data.kind === 'StorageMap',
    );

    expect(networkMapCreates).toHaveLength(1);
    expect(storageMapCreates).toHaveLength(1);
    expect((networkMapCreates[0][0] as { data: V1beta1NetworkMap }).data.metadata?.name).toBe(
      'copy-of-plan-abcde',
    );
    expect((storageMapCreates[0][0] as { data: V1beta1StorageMap }).data.metadata?.name).toBe(
      'copy-of-plan-abcde',
    );
  });
});
