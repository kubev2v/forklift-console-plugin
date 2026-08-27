import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn(),
}));

import { PlanModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationTypeValue } from '../../steps/migration-type/constants';
import { createPlan } from '../createPlan';

const mockK8sCreate = k8sCreate as jest.Mock;

const provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'src', namespace: 'ns', uid: 'p1' },
} as never;

const mapRef = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'NetworkMap',
  metadata: { name: 'nm', namespace: 'ns', uid: 'm1' },
} as never;

describe('createPlan - create', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sCreate.mockImplementation(({ data }: { data: unknown }) => Promise.resolve(data));
  });

  it('creates a cold plan and returns an object ref', async () => {
    const ref = await createPlan({
      migrateSharedDisks: true,
      migrationType: MigrationTypeValue.Cold,
      networkMap: mapRef,
      planName: 'plan-1',
      planProject: 'ns',
      preserveStaticIps: true,
      sourceProvider: provider,
      storageMap: {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'StorageMap',
        metadata: { name: 'sm', namespace: 'ns', uid: 's1' },
      },
      targetPowerState: 'on',
      targetProject: 'target-ns',
      targetProvider: provider,
      vms: [{ id: 'vm-1', name: 'vm-1', providerType: 'vsphere' } as never],
    });

    expect(mockK8sCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: { name: 'plan-1', namespace: 'ns' },
          spec: expect.objectContaining({
            targetNamespace: 'target-ns',
            type: MigrationTypeValue.Cold,
            warm: false,
          }),
        }),
        model: PlanModel,
      }),
    );
    expect(ref.name).toBe('plan-1');
  });

  it('sets warm true for warm migration type and includes description', async () => {
    await createPlan({
      migrateSharedDisks: false,
      migrationType: MigrationTypeValue.Warm,
      networkMap: mapRef,
      planDescription: 'desc',
      planName: 'warm-plan',
      planProject: 'ns',
      preserveStaticIps: false,
      sourceProvider: provider,
      storageMap: mapRef,
      targetPowerState: 'off',
      targetProject: 'target-ns',
      targetProvider: provider,
      vms: [],
    });

    const [firstCall] = mockK8sCreate.mock.calls;
    const [createArg] = firstCall as [{ data: { spec: { description?: string; warm?: boolean } } }];
    const { spec } = createArg.data;
    expect(spec.warm).toBe(true);
    expect(spec.description).toBe('desc');
  });
});
