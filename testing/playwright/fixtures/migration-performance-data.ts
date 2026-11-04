import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

/** Frozen clock used by `page.clock.install`, so duration math is deterministic. */
export const PERFORMANCE_NOW = new Date('2026-02-01T12:00:00.000Z');

export const PERFORMANCE_PLAN_NAME = 'migration-performance-plan';
export const PERFORMANCE_PLAN_UID = 'plan-performance-uid';
export const NEVER_RUN_PLAN_NAME = 'migration-performance-never-run';
export const NEVER_RUN_PLAN_UID = 'plan-never-run-uid';

export const MIGRATION_SUCCEEDED_UID = 'mig-succeeded';
export const MIGRATION_PARTIAL_UID = 'mig-partial';
export const MIGRATION_RUNNING_UID = 'mig-running';
export const MIGRATION_CANCELED_UID = 'mig-canceled';
export const MIGRATION_LIVE_UID = 'mig-live';
export const MIGRATION_EMPTY_UID = 'mig-empty';

/** Live rate returned by the mocked Prometheus proxy: 50 MiB/s. */
export const LIVE_RATE_BYTES_PER_SECOND = 52_428_800;

const GIB_IN_MIB = 1024;

const at = (minutes: number): string =>
  new Date(PERFORMANCE_NOW.getTime() + minutes * 60_000).toISOString();

type Condition = { lastTransitionTime?: string; status: string; type: string };

const condition = (type: string, minutes?: number): Condition => ({
  lastTransitionTime: minutes === undefined ? undefined : at(minutes),
  status: 'True',
  type,
});

const diskStep = (
  started: number,
  completed: number | undefined,
  completedMib: number,
  totalMib: number,
) => ({
  completed: completed === undefined ? undefined : at(completed),
  name: 'DiskTransfer',
  started: at(started),
  tasks: [
    {
      completed: completed === undefined ? undefined : at(completed),
      name: 'DiskTransfer',
      progress: { completed: completedMib, total: totalMib },
      started: at(started),
    },
  ],
});

const migration = (
  name: string,
  started: number,
  completed: number | undefined,
  vms: unknown[],
  conditions: Condition[] = [],
) => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Migration',
  metadata: {
    name,
    namespace: MTV_NAMESPACE,
    ownerReferences: [{ kind: 'Plan', name: PERFORMANCE_PLAN_NAME, uid: PERFORMANCE_PLAN_UID }],
    uid: name,
  },
  spec: {
    plan: { name: PERFORMANCE_PLAN_NAME, namespace: MTV_NAMESPACE, uid: PERFORMANCE_PLAN_UID },
  },
  status: {
    completed: completed === undefined ? undefined : at(completed),
    conditions,
    started: at(started),
    vms,
  },
});

const succeededVms = [
  {
    completed: at(-145),
    conditions: [condition('Succeeded', -145)],
    id: 'vm-a',
    name: 'perf-vm-a',
    pipeline: [diskStep(-235, -145, 60 * GIB_IN_MIB, 60 * GIB_IN_MIB)],
    started: at(-238),
  },
  {
    completed: at(-150),
    conditions: [condition('Succeeded', -150)],
    id: 'vm-b',
    name: 'perf-vm-b',
    pipeline: [diskStep(-230, -150, 40 * GIB_IN_MIB, 40 * GIB_IN_MIB)],
    started: at(-233),
  },
];

const partialVms = [0, 1, 2]
  .map((index) => ({
    completed: at(-565),
    conditions: [condition('Succeeded', -565)],
    id: `partial-${index}`,
    name: `partial-vm-${index}`,
    pipeline: [diskStep(-598, -565, 10 * GIB_IN_MIB, 10 * GIB_IN_MIB)],
    started: at(-599),
  }))
  .concat(
    [3, 4].map((index) => ({
      completed: at(-562),
      conditions: [condition('Failed', -562)],
      id: `partial-${index}`,
      name: `partial-vm-${index}`,
      pipeline: [diskStep(-598, -562, 5 * GIB_IN_MIB, 10 * GIB_IN_MIB)],
      started: at(-599),
    })),
  );

const runningVms = [
  {
    conditions: [],
    id: 'running-0',
    name: 'running-vm-0',
    pipeline: [diskStep(-28, undefined, 50 * GIB_IN_MIB, 100 * GIB_IN_MIB)],
    started: at(-28),
  },
];

const canceledVms = [
  {
    completed: at(-281),
    conditions: [condition('Canceled', -281)],
    id: 'canceled-0',
    name: 'canceled-vm-0',
    pipeline: [],
    started: at(-299),
  },
];

const liveVms = [0, 1].map((index) => ({
  completed: at(-46),
  conditions: [condition('Succeeded', -46)],
  id: `live-${index}`,
  name: `live-vm-${index}`,
  pipeline: [],
  started: at(-49),
}));

export const PERFORMANCE_MIGRATIONS = [
  migration(MIGRATION_SUCCEEDED_UID, -240, -140, succeededVms),
  migration(MIGRATION_PARTIAL_UID, -600, -560, partialVms),
  migration(MIGRATION_RUNNING_UID, -30, undefined, runningVms),
  migration(MIGRATION_CANCELED_UID, -300, undefined, canceledVms, [condition('Canceled', -280)]),
  migration(MIGRATION_LIVE_UID, -50, -45, liveVms),
  migration(MIGRATION_EMPTY_UID, -120, -110, []),
];

const providerRef = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  name: 'test-source-provider',
  namespace: MTV_NAMESPACE,
  uid: 'test-source-provider-uid',
};

const destinationRef = {
  ...providerRef,
  name: 'test-target-provider',
  uid: 'test-target-provider-uid',
};

const planStatus = {
  conditions: [condition('Ready', -700)],
  migration: {
    completed: at(-140),
    started: at(-240),
    vms: succeededVms,
  },
};

export const PERFORMANCE_PLAN = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: {
    creationTimestamp: at(-720),
    name: PERFORMANCE_PLAN_NAME,
    namespace: MTV_NAMESPACE,
    uid: PERFORMANCE_PLAN_UID,
  },
  spec: {
    provider: { destination: destinationRef, source: providerRef },
    targetNamespace: 'test-target-project',
    vms: [
      { id: 'vm-a', name: 'perf-vm-a' },
      { id: 'vm-b', name: 'perf-vm-b' },
    ],
  },
  status: planStatus,
};

export const NEVER_RUN_PLAN = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: {
    creationTimestamp: at(-720),
    name: NEVER_RUN_PLAN_NAME,
    namespace: MTV_NAMESPACE,
    uid: NEVER_RUN_PLAN_UID,
  },
  spec: {
    provider: { destination: destinationRef, source: providerRef },
    targetNamespace: 'test-target-project',
    vms: [{ id: 'vm-a', name: 'perf-vm-a' }],
  },
  status: { conditions: [condition('Ready', -700)] },
};

const PLAN_ID_LABEL = 'plan_id';

export const PROMETHEUS_LIVE_RATE_RESPONSE = {
  data: {
    result: [
      {
        metric: { [PLAN_ID_LABEL]: PERFORMANCE_PLAN_UID },
        value: [Math.floor(PERFORMANCE_NOW.getTime() / 1000), String(LIVE_RATE_BYTES_PER_SECOND)],
      },
    ],
    resultType: 'vector',
  },
  status: 'success',
};

export const PROMETHEUS_ZERO_RATE_RESPONSE = {
  data: {
    result: [
      {
        metric: { [PLAN_ID_LABEL]: PERFORMANCE_PLAN_UID },
        value: [Math.floor(PERFORMANCE_NOW.getTime() / 1000), '0'],
      },
    ],
    resultType: 'vector',
  },
  status: 'success',
};
