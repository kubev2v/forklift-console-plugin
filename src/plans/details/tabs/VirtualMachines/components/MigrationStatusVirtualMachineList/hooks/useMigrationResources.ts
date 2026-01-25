import { useMemo } from 'react';

import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
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
  const watchOptions = {
    isList: true,
    namespace: getPlanTargetNamespace(plan),
    namespaced: true,
    selector: { matchLabels: { plan: getUID(plan)! } },
  };

  const [pods, podsLoaded, podsError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    ...watchOptions,
    groupVersionKind: PodModelGroupVersionKind,
  });

  const [jobs, jobsLoaded, jobsError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>({
    ...watchOptions,
    groupVersionKind: JobModelGroupVersionKind,
    namespace: getNamespace(plan),
  });

  const [pvcs, pvcsLoaded, pvcsError] = useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    ...watchOptions,
    groupVersionKind: PersistentVolumeClaimModelGroupVersionKind,
  });

  const [dvs, dvsLoaded, dvsError] = useK8sWatchResource<V1beta1DataVolume[]>({
    ...watchOptions,
    groupVersionKind: DataVolumeModelGroupVersionKind,
  });

  const virtualMachines = getPlanVirtualMachines(plan);

  const dvsDict = useMemo(
    () => (dvsLoaded && !dvsError ? groupByVmId(dvs ?? []) : {}),
    [dvs, dvsLoaded, dvsError],
  );
  const jobsDict = useMemo(
    () => (jobsLoaded && !jobsError ? groupByVmId(jobs ?? []) : {}),
    [jobs, jobsLoaded, jobsError],
  );
  const podsDict = useMemo(
    () => (podsLoaded && !podsError ? groupByVmId(pods ?? []) : {}),
    [pods, podsLoaded, podsError],
  );
  const pvcsDict = useMemo(
    () => (pvcsLoaded && !pvcsError ? groupByVmId(pvcs ?? []) : {}),
    [pvcs, pvcsLoaded, pvcsError],
  );

  const vmDict = getPlanVirtualMachinesDict(plan);

  const migrationListData = useMemo(() => {
    return virtualMachines.map((specVM) => {
      const id = specVM?.id ?? getPlanVirtualMachineIdByName(plan, specVM?.name);
      return {
        dvs: dvsDict[id!],
        isWarm: getPlanIsWarm(plan),
        jobs: jobsDict[id!],
        plan,
        pods: podsDict[id!],
        pvcs: pvcsDict[id!],
        specVM,
        statusVM: vmDict[id!],
        targetNamespace: getPlanTargetNamespace(plan),
      };
    }) as MigrationStatusVirtualMachinePageData[];
  }, [virtualMachines, dvsDict, jobsDict, podsDict, pvcsDict, vmDict, plan]);

  return {
    error: podsError ?? jobsError ?? pvcsError ?? dvsError,
    loaded: podsLoaded && jobsLoaded && pvcsLoaded && dvsLoaded,
    migrationListData,
  };
};
