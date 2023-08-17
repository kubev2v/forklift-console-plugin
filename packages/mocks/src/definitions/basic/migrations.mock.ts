import { MigrationModelGroupVersionKind as gvk, V1beta1Migration } from '@kubev2v/types';
import { V1beta1MigrationStatus } from '@kubev2v/types/dist/models/V1beta1MigrationStatus';
import { V1beta1PlanStatusMigration } from '@kubev2v/types/dist/models/V1beta1PlanStatusMigration';
import { V1beta1MigrationSpec } from '@kubev2v/types/src/models/V1beta1MigrationSpec';

import { EPOCH, nameAndNamespace, NOW } from '../utils';

import { plan1, plan3, plan4, plan5, plan7, plan8, plan9, plan10, plan11 } from './plans.mock';

const cancelSpec = [
  {
    id: 'vm-1630',
    name: 'test-migration',
  },
];

const runningPlans = [plan1, plan3, plan4, plan5, plan7, plan8, plan9, plan10, plan11];

const uidToSpec: { [uid: string]: Partial<V1beta1MigrationSpec> } = {
  [plan3.metadata.uid]: { cancel: cancelSpec },
  [plan7.metadata.uid]: {
    cancel: cancelSpec,
  },
  [plan8.metadata.uid]: {
    cancel: cancelSpec,
    //has a scheduled cutover
    cutover: NOW.plus({ days: 1 }).toISO(),
  },
  [plan9.metadata.uid]: {
    // is in cutover
    cutover: EPOCH.toISO(),
  },
  [plan11.metadata.uid]: { cancel: cancelSpec },
};

const toMigrationStatus = ({
  completed,
  started,
  history,
}: V1beta1PlanStatusMigration): V1beta1MigrationStatus => ({
  completed,
  started,
  conditions: [...history].pop()?.conditions ?? [],
});

export const MOCK_MIGRATIONS: V1beta1Migration[] = runningPlans.map((plan) => ({
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Migration',
  metadata: {
    name: `${plan.metadata.name}-mock-migration`,
    namespace: plan.metadata.namespace,
  },
  spec: {
    plan: nameAndNamespace(plan.metadata),
    ...(uidToSpec[plan.metadata.uid] ?? {}),
  },
  status: toMigrationStatus(plan.status?.migration),
}));
