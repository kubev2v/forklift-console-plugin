import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import './duplicateModalUtils.fixtures';

import { createDuplicatePlanAndMapResources } from '../utils';

import {
  baseNetworkMap,
  basePlan,
  baseStorageMap,
  mockK8sCreate,
  postHook,
  preHook,
  setupK8sCreateMock,
} from './duplicateModalUtils.fixtures';

describe('createDuplicatePlanAndMapResources - hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupK8sCreateMock();
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

    if (!planCreate) throw new Error('Expected Plan k8sCreate call not found');
    const planData = (planCreate[0] as { data: V1beta1Plan }).data;
    const vmHooks = planData.spec?.vms?.[0]?.hooks;

    expect(vmHooks).toHaveLength(2);
    expect(vmHooks?.[0]?.hook?.name).toBe('copy-of-plan-pre-hook-abcde');
    expect(vmHooks?.[1]?.hook?.name).toBe('copy-of-plan-post-hook-abcde');
  });

  it('does not create hooks when plan has no hooks', async () => {
    const planNoHooks: V1beta1Plan = {
      ...basePlan,
      spec: { ...basePlan.spec, vms: [{ id: 'vm-1', name: 'test-vm' }] },
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
});
