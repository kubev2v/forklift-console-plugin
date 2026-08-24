import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import './duplicateModalUtils.fixtures';

import { createDuplicatePlanAndMapResources } from '../utils';

import {
  baseNetworkMap,
  basePlan,
  baseStorageMap,
  configMap,
  mockK8sCreate,
  setupK8sCreateMock,
} from './duplicateModalUtils.fixtures';

describe('createDuplicatePlanAndMapResources - config maps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupK8sCreateMock();
  });

  it('creates duplicated ConfigMap when plan has customization scripts', async () => {
    const planWithScripts: V1beta1Plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec,
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

  it('sets customizationScripts on new plan referencing the new ConfigMap', async () => {
    const planWithScripts: V1beta1Plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec,
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

    if (!planCreate) throw new Error('Expected Plan k8sCreate call not found');
    const planData = (planCreate[0] as { data: V1beta1Plan }).data;
    expect(planData.spec?.customizationScripts?.name).toBe('copy-of-plan-scripts-abcde');
    expect(planData.spec?.customizationScripts?.namespace).toBe('openshift-mtv');
  });

  it('does not create ConfigMap when plan has no customization scripts', async () => {
    const planNoScripts: V1beta1Plan = {
      ...basePlan,
      spec: { ...basePlan.spec, vms: [{ id: 'vm-1', name: 'test-vm' }] },
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
});
