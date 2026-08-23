import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';

import type { V1beta1Plan } from '@forklift-ui/types';

export const createPlan = ({
  archived = false,
  name,
  namespace = 'default',
  ownerName,
  startedVm = false,
  status,
  uid,
}: {
  archived?: boolean;
  name: string;
  namespace?: string;
  ownerName?: string;
  startedVm?: boolean;
  status?: PlanStatuses;
  uid?: string;
}): V1beta1Plan => {
  let conditionType: string | undefined = status;
  if (status === PlanStatuses.Completed) {
    conditionType = 'Succeeded';
  } else if (status === PlanStatuses.Pending || status === PlanStatuses.Executing) {
    conditionType = PlanStatuses.Executing;
  }

  const hasStartedMigration =
    status === PlanStatuses.Executing || status === PlanStatuses.Pending
      ? {
          migration: {
            vms: startedVm ? [{ id: 'vm-1', name: 'vm-1', started: '2024-01-01T00:00:00Z' }] : [],
          },
        }
      : {};

  return {
    metadata: {
      name,
      namespace,
      ...(ownerName
        ? {
            ownerReferences: [
              { apiVersion: 'v1', kind: 'ConfigMap', name: ownerName, uid: 'owner-1' },
            ],
          }
        : {}),
      uid,
    },
    spec: { archived },
    status: {
      conditions: conditionType ? [{ status: 'True', type: conditionType }] : [],
      ...hasStartedMigration,
    },
  } as V1beta1Plan;
};
