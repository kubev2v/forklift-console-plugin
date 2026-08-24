import type { V1beta1NetworkMap, V1beta1Plan, V1beta1StorageMap } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import './duplicateModalUtils.fixtures';

import { createDuplicatePlanAndMapResources } from '../utils';

import {
  baseNetworkMap,
  basePlan,
  baseStorageMap,
  mockK8sCreate,
  setupK8sCreateMock,
} from './duplicateModalUtils.fixtures';

describe('createDuplicatePlanAndMapResources - maps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupK8sCreateMock();
  });

  it('always creates new NetworkMap and StorageMap', async () => {
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
