import {
  MigrationModel,
  type V1beta1Migration,
  type V1beta1MigrationSpec,
} from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { getIsInheritedVmCutover, isCutoverInPast, patchMigrationVmCutover } from '../utils';

const VM_ID = 'vm-1000';
const OTHER_VM_ID = 'vm-2000';
const PLAN_CUTOVER = '2030-10-20T10:00:00Z';
const VM_CUTOVER = '2030-11-11T22:30:00Z';
const NEW_CUTOVER = '2030-12-05T11:00:00Z';
const RESOURCE_VERSION = '12345';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({ k8sPatch: jest.fn() }));
const mockK8sPatch = k8sPatch as unknown as jest.Mock;

const buildMigration = (spec: Partial<V1beta1MigrationSpec>): V1beta1Migration =>
  ({
    metadata: {
      name: 'migration-1',
      namespace: 'openshift-mtv',
      resourceVersion: RESOURCE_VERSION,
    },
    spec,
  }) as unknown as V1beta1Migration;

/** Writes are guarded on resourceVersion so a concurrent edit cannot be overwritten. */
const expectPatch = (
  migration: V1beta1Migration,
  value: V1beta1MigrationSpec['vmCutover'],
): void => {
  expect(mockK8sPatch).toHaveBeenCalledWith({
    data: [
      { op: 'test', path: '/metadata/resourceVersion', value: RESOURCE_VERSION },
      { op: 'add', path: '/spec/vmCutover', value },
    ],
    model: MigrationModel,
    resource: migration,
  });
};

describe('getIsInheritedVmCutover', () => {
  it('prefers the VM override over the plan-wide cutover', () => {
    const migration = buildMigration({
      cutover: PLAN_CUTOVER,
      vmCutover: [{ cutover: VM_CUTOVER, id: VM_ID }],
    });

    expect(getIsInheritedVmCutover(migration, VM_ID)).toEqual({
      cutover: VM_CUTOVER,
      isInherited: false,
    });
  });

  it('falls back to the plan-wide cutover when the VM has no override', () => {
    const migration = buildMigration({
      cutover: PLAN_CUTOVER,
      vmCutover: [{ cutover: VM_CUTOVER, id: OTHER_VM_ID }],
    });

    expect(getIsInheritedVmCutover(migration, VM_ID)).toEqual({
      cutover: PLAN_CUTOVER,
      isInherited: true,
    });
  });
});

describe('isCutoverInPast', () => {
  it('distinguishes past from future timestamps', () => {
    expect(isCutoverInPast(new Date(Date.now() - ONE_DAY_MS).toISOString())).toBe(true);
    expect(isCutoverInPast(new Date(Date.now() + ONE_DAY_MS).toISOString())).toBe(false);
    expect(isCutoverInPast(undefined)).toBe(false);
  });

  it('handles an unparseable timestamp without reporting it as past', () => {
    // Regression guard: the validity check must run on getTime(), not on the Date object.
    // Number.isFinite(someDate) is always false, which short-circuited the comparison above
    // and silently disabled the past-cutover rule entirely while this suite stayed green.
    expect(isCutoverInPast('not-a-date')).toBe(false);
  });
});

describe('patchMigrationVmCutover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds an override for a VM that has none', async () => {
    const migration = buildMigration({ cutover: PLAN_CUTOVER });

    await patchMigrationVmCutover(migration, VM_ID, NEW_CUTOVER);

    expectPatch(migration, [{ cutover: NEW_CUTOVER, id: VM_ID }]);
  });

  it('updates an existing override in place, leaving siblings untouched', async () => {
    const migration = buildMigration({
      vmCutover: [
        { cutover: VM_CUTOVER, id: VM_ID },
        { cutover: PLAN_CUTOVER, id: OTHER_VM_ID },
      ],
    });

    await patchMigrationVmCutover(migration, VM_ID, NEW_CUTOVER);

    expectPatch(migration, [
      { cutover: NEW_CUTOVER, id: VM_ID },
      { cutover: PLAN_CUTOVER, id: OTHER_VM_ID },
    ]);
  });

  it('drops only this VM entry when removing', async () => {
    const migration = buildMigration({
      vmCutover: [
        { cutover: PLAN_CUTOVER, id: OTHER_VM_ID },
        { cutover: VM_CUTOVER, id: VM_ID },
      ],
    });

    await patchMigrationVmCutover(migration, VM_ID);

    expectPatch(migration, [{ cutover: PLAN_CUTOVER, id: OTHER_VM_ID }]);
  });
});
