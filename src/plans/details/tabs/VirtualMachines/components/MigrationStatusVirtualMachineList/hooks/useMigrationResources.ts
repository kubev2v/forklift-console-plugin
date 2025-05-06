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

  const [pods = [], podsLoaded, podsError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    ...watchOptions,
    groupVersionKind: PodModelGroupVersionKind,
    namespace: getNamespace(plan),
  });

  const [jobs = [], jobsLoaded, jobsError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>({
    groupVersionKind: JobModelGroupVersionKind,
    ...watchOptions,
  });

  const [pvcs = [], pvcsLoaded, pvcsError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: PersistentVolumeClaimModelGroupVersionKind,
    ...watchOptions,
  });

  const [dvs = [], dvsLoaded, dvsError] = useK8sWatchResource<V1beta1DataVolume[]>({
    groupVersionKind: DataVolumeModelGroupVersionKind,
    ...watchOptions,
  });

  const virtualMachines = getPlanVirtualMachines(plan);

  const dvsDict = useMemo(
    () => (dvsLoaded && !dvsError ? groupByVmId(dvs) : {}),
    [dvs, dvsLoaded, dvsError],
  );
  const jobsDict = useMemo(
    () => (jobsLoaded && !jobsError ? groupByVmId(jobs) : {}),
    [jobs, jobsLoaded, jobsError],
  );
  const podsDict = useMemo(
    () => (podsLoaded && !podsError ? groupByVmId(pods) : {}),
    [pods, podsLoaded, podsError],
  );
  const pvcsDict = useMemo(
    () => (pvcsLoaded && !pvcsError ? groupByVmId(pvcs) : {}),
    [pvcs, pvcsLoaded, pvcsError],
  );

  const vmDict = getPlanVirtualMachinesDict(plan);

  const migrationListData = useMemo(() => {
    return virtualMachines.map((specVM) => ({
      dvs: dvsDict[specVM.id!],
      isWarm: getPlanIsWarm(plan),
      jobs: jobsDict[specVM.id!],
      pods: podsDict[specVM.id!],
      pvcs: pvcsDict[specVM.id!],
      specVM,
      statusVM: vmDict[specVM.id!],
      targetNamespace: getPlanTargetNamespace(plan),
    })) as MigrationStatusVirtualMachinePageData[];
  }, [virtualMachines, dvsDict, jobsDict, podsDict, pvcsDict, vmDict, plan]);

  return {
    error: podsError ?? jobsError ?? pvcsError ?? dvsError,
    loaded: podsLoaded && jobsLoaded && pvcsLoaded && dvsLoaded,
    migrationListData,
  };
};
