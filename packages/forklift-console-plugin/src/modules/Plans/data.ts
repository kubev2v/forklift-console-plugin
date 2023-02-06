import { useMemo } from 'react';
import * as C from 'src/utils/constants';
import { useMigrations, usePlans, useProviders } from 'src/utils/fetch';
import { groupVersionKindForObj, resolveProviderRef } from 'src/utils/resources';
import { MigrationResource, PlanResource, ProviderRef, ProviderResource } from 'src/utils/types';

import { PlanState } from '@kubev2v/legacy/common/constants';
import { getPlanState } from '@kubev2v/legacy/Plans/components/helpers';
import { findLatestMigration } from '@kubev2v/legacy/queries';
import { IPlan, PlanType } from '@kubev2v/legacy/queries/types';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
export interface FlatPlan {
  //plan.metadata.name
  [C.NAME]: string;
  [C.NAMESPACE]: string;
  [C.GVK]: K8sGroupVersionKind;
  // plan.spec.description
  [C.DESCRIPTION]: string;
  // plan.spec.warm
  [C.TYPE]: PlanType;
  // plan.spec.provider.source.name
  [C.SOURCE]: string;
  [C.SOURCE_GVK]: K8sGroupVersionKind;
  [C.SOURCE_READY]: boolean;
  //plan.spec.provider.destination.name
  [C.TARGET]: string;
  [C.TARGET_GVK]: K8sGroupVersionKind;
  [C.TARGET_READY]: boolean;
  [C.STATUS]: PlanState;
  // plan.spec.vms.length
  [C.VM_COUNT]: number;
  [C.VM_DONE]: number;
  //plan.status?.migration?.completed
  [C.MIGRATION_COMPLETED]?: string;
  [C.MIGRATION_STARTED]?: string;
  [C.LATEST_MIGRATION]?: LatestMigration;
  // plan.spec.archived
  [C.ARCHIVED]: boolean;
  // escape hatch to work with legacy code (which operates on full object)
  [C.OBJECT]: IPlan;
}

interface LatestMigration {
  [C.CUTOVER]?: string;
}

export const mergeData = (
  plans: PlanResource[],
  migrations: MigrationResource[],
  providers: ProviderResource[],
): FlatPlan[] =>
  plans
    .map(
      (
        plan,
      ): [
        IPlan,
        IPlan,
        PlanState,
        K8sGroupVersionKind,
        LatestMigration,
        ProviderRef,
        ProviderRef,
      ] => {
        const latestMigration = findLatestMigration(plan, migrations);
        return [
          plan, // for flattening/deconstructing
          plan, // to be forwarded as 'object' ref
          getPlanState(plan, latestMigration, migrations),
          groupVersionKindForObj(plan),
          latestMigration ? { cutover: latestMigration.spec?.cutover } : undefined,
          resolveProviderRef(plan.spec.provider.source, providers),
          resolveProviderRef(plan.spec.provider.destination, providers),
        ];
      },
    )
    .map(
      ([
        {
          metadata: { name, namespace },
          spec: { archived, description, warm, vms },
          status: { migration = {} } = {},
        },
        plan,
        planState,
        gvk,
        latestMigration,
        source,
        target,
      ]): FlatPlan => ({
        archived,
        name,
        namespace,
        gvk,
        description,
        source: source.name,
        sourceGvk: source.gvk,
        sourceReady: source.ready,
        target: target.name,
        targetGvk: target.gvk,
        targetReady: target.ready,
        type: warm ? 'Warm' : 'Cold',
        status: planState,
        vmCount: vms?.length || 0,
        vmDone:
          migration?.vms?.filter(
            (vm) =>
              !!vm.completed &&
              !vm.error &&
              !vm.conditions?.find((condition) => condition.type === 'Canceled'),
          ).length || 0,
        migrationCompleted: migration?.completed,
        migrationStarted: migration?.started,
        latestMigration,
        object: plan,
      }),
    );

export const useFlatPlans = ({
  namespace,
  name = undefined,
  groupVersionKind: { group, version },
}): [FlatPlan[], boolean, boolean] => {
  const [plans, pLoaded, pError] = usePlans({ namespace, name }, { group, version });
  const [migrations, mLoaded, mError] = useMigrations({ namespace }, { group, version });
  const [providers] = useProviders({ namespace }, { group, version });

  const merged = useMemo(
    () => (plans && migrations && providers ? mergeData(plans, migrations, providers) : []),
    [plans, migrations, providers],
  );

  const totalSuccess = pLoaded && mLoaded;
  const totalError = pError || mError;

  // extra memo to keep the tuple reference stable
  // the tuple is used as data source and passed as prop
  // which triggres unnecessary re-renders
  return useMemo(() => [merged, totalSuccess, totalError], [merged, totalSuccess, totalError]);
};
