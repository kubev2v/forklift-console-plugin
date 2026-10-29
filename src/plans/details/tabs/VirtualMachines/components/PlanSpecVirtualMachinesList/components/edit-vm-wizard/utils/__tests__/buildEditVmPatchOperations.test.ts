import type { V1beta1Plan } from '@forklift-ui/types';

import type { EditVmWizardFormValues } from '../../types';
import { buildEditVmPatchOperations } from '../buildEditVmPatchOperations';
import { getDefaultEditVmWizardFormValues } from '../getDefaultEditVmWizardFormValues';

const basePlan = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: { name: 'test-plan', namespace: 'default' },
  spec: {
    map: {
      network: { name: 'net-map', namespace: 'default' },
      storage: { name: 'storage-map', namespace: 'default' },
    },
    provider: {
      destination: { name: 'target', namespace: 'default' },
      source: { name: 'source', namespace: 'default' },
    },
    targetNamespace: 'target-ns',
    targetPowerState: 'on',
    vms: [
      {
        id: 'vm-1',
        name: 'source-vm',
      },
    ],
  },
} satisfies V1beta1Plan;

const baseValues = (plan: V1beta1Plan): EditVmWizardFormValues =>
  getDefaultEditVmWizardFormValues(plan, 0);

describe('buildEditVmPatchOperations', () => {
  it('returns no operations when values are unchanged', () => {
    expect(buildEditVmPatchOperations(basePlan, 0, baseValues(basePlan))).toEqual([]);
  });

  it('ADDs targetName when unset', () => {
    const values = { ...baseValues(basePlan), targetName: 'new-target' };
    expect(buildEditVmPatchOperations(basePlan, 0, values)).toEqual([
      { op: 'add', path: '/spec/vms/0/targetName', value: 'new-target' },
    ]);
  });

  it('REPLACEs targetName when set', () => {
    const plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec,
        vms: [{ id: 'vm-1', name: 'source-vm', targetName: 'old' }],
      },
    } satisfies V1beta1Plan;
    const values = { ...baseValues(plan), targetName: 'new-target' };
    expect(buildEditVmPatchOperations(plan, 0, values)).toEqual([
      { op: 'replace', path: '/spec/vms/0/targetName', value: 'new-target' },
    ]);
  });

  it('REMOVEs instanceType when cleared', () => {
    const plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec,
        vms: [{ id: 'vm-1', instanceType: 'u1.small', name: 'source-vm' }],
      },
    } satisfies V1beta1Plan;
    const values = { ...baseValues(plan), instanceType: undefined };
    expect(buildEditVmPatchOperations(plan, 0, values)).toEqual([
      { op: 'remove', path: '/spec/vms/0/instanceType' },
    ]);
  });

  it('REMOVEs migrateSharedDisks when set to inherit', () => {
    const plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec,
        vms: [{ id: 'vm-1', migrateSharedDisks: false, name: 'source-vm' }],
      },
    } satisfies V1beta1Plan;
    const values = { ...baseValues(plan), migrateSharedDisks: undefined };
    expect(buildEditVmPatchOperations(plan, 0, values)).toEqual([
      { op: 'remove', path: '/spec/vms/0/migrateSharedDisks' },
    ]);
  });

  it('ADDs excludeDisks when newly set', () => {
    const values = { ...baseValues(basePlan), excludeDisks: ['disk-1'] };
    expect(buildEditVmPatchOperations(basePlan, 0, values)).toEqual([
      { op: 'add', path: '/spec/vms/0/excludeDisks', value: ['disk-1'] },
    ]);
  });

  it('REMOVEs pvcNameTemplate when cleared to inherit', () => {
    const plan = {
      ...basePlan,
      spec: {
        ...basePlan.spec,
        vms: [{ id: 'vm-1', name: 'source-vm', pvcNameTemplate: '{{.VmName}}' }],
      },
    } satisfies V1beta1Plan;
    const values = { ...baseValues(plan), pvcNameTemplate: undefined };
    expect(buildEditVmPatchOperations(plan, 0, values)).toEqual([
      { op: 'remove', path: '/spec/vms/0/pvcNameTemplate' },
    ]);
  });
});
