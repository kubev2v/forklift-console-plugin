import { useMemo } from 'react';
import { useLatestPlanMigration } from 'src/plans/hooks/useLatestPlanMigration';

import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1Plan,
} from '@forklift-ui/types';
import { useK8sWatchResource, type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  DataVolumeModelGroupVersionKind,
  JobModelGroupVersionKind,
  PersistentVolumeClaimModelGroupVersionKind,
  PodModelGroupVersionKind,
} from '@utils/crds/common/models';
import { getNamespace, getUID } from '@utils/crds/common/selectors';
import {
  getPlanIsWarm,
  getPlanTargetNamespace,
  getPlanVirtualMachines,
} from '@utils/crds/plans/selectors';

import { getPlanVirtualMachineIdByName } from '../../utils/getPlanVirtualMachineIdByName';
import { getPlanVirtualMachinesDict } from '../../utils/utils';
import type { MigrationStatusVirtualMachinePageData } from '../utils/types';
import { groupByVmId } from '../utils/utils';

type MigrationResources = {
  migrationListData: MigrationStatusVirtualMachinePageData[];
  loaded: boolean;
  error: unknown;
};

export const useMigrationResources = (plan: V1beta1Plan): MigrationResources => {
  const [latestMigration, migrationLoaded, migrationError] = useLatestPlanMigration(plan);
  const migrationUid = latestMigration ? getUID(latestMigration) : undefined;
  const planUid = getUID(plan);

  const watchOptions = useMemo((): WatchK8sResource | null => {
    if (!migrationUid || !planUid) {
      return null;
    }

    return {
      isList: true,
      namespace: getPlanTargetNamespace(plan),
      namespaced: true,
      selector: {
        matchLabels: {
          migration: migrationUid,
          plan: planUid,
        },
      },
    };
  }, [migrationUid, plan, planUid]);

  const [pods, podsLoaded, podsError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>(
    watchOptions ? { ...watchOptions, groupVersionKind: PodModelGroupVersionKind } : null,
  );

  const [jobs, jobsLoaded, jobsError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>(
    watchOptions
      ? {
          ...watchOptions,
          groupVersionKind: JobModelGroupVersionKind,
          namespace: getNamespace(plan),
        }
      : null,
  );

  const [pvcs, pvcsLoaded, pvcsError] = useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>(
    watchOptions
      ? { ...watchOptions, groupVersionKind: PersistentVolumeClaimModelGroupVersionKind }
      : null,
  );

  const [dvs, dvsLoaded, dvsError] = useK8sWatchResource<V1beta1DataVolume[]>(
    watchOptions ? { ...watchOptions, groupVersionKind: DataVolumeModelGroupVersionKind } : null,
  );

  const virtualMachines = getPlanVirtualMachines(plan);
  const hasWatchScope = Boolean(migrationUid && planUid);
  const resourcesLoaded = !hasWatchScope || (podsLoaded && jobsLoaded && pvcsLoaded && dvsLoaded);

  const dvsDict = useMemo(
    () => (hasWatchScope && dvsLoaded && !dvsError ? groupByVmId(dvs) : {}),
    [hasWatchScope, dvs, dvsLoaded, dvsError],
  );
  const jobsDict = useMemo(
    () => (hasWatchScope && jobsLoaded && !jobsError ? groupByVmId(jobs) : {}),
    [hasWatchScope, jobs, jobsLoaded, jobsError],
  );
  const podsDict = useMemo(
    () => (hasWatchScope && podsLoaded && !podsError ? groupByVmId(pods) : {}),
    [hasWatchScope, pods, podsLoaded, podsError],
  );
  const pvcsDict = useMemo(
    () => (hasWatchScope && pvcsLoaded && !pvcsError ? groupByVmId(pvcs) : {}),
    [hasWatchScope, pvcs, pvcsLoaded, pvcsError],
  );

  const vmDict = getPlanVirtualMachinesDict(plan);

  const migrationListData = useMemo(() => {
    return virtualMachines.map((specVM) => {
      const id = specVM?.id ?? getPlanVirtualMachineIdByName(plan, specVM?.name) ?? '';
      return {
        dvs: dvsDict[id],
        isWarm: getPlanIsWarm(plan),
        jobs: jobsDict[id],
        plan,
        pods: podsDict[id],
        pvcs: pvcsDict[id],
        specVM,
        statusVM: vmDict[id],
        targetNamespace: getPlanTargetNamespace(plan),
      };
    }) as MigrationStatusVirtualMachinePageData[];
  }, [virtualMachines, dvsDict, jobsDict, podsDict, pvcsDict, vmDict, plan]);

  return {
    error: migrationError ?? podsError ?? jobsError ?? pvcsError ?? dvsError,
    loaded: migrationLoaded && resourcesLoaded,
    migrationListData,
  };
};
