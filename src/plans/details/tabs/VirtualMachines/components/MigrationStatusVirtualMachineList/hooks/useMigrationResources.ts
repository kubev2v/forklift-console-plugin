import { useMemo } from 'react';

import type {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1PersistentVolumeClaim,
  IoK8sApiCoreV1Pod,
  V1beta1DataVolume,
  V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace, getUID } from '@utils/crds/common/selectors';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

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
    namespace: getNamespace(plan),
    namespaced: true,
    selector: { matchLabels: { plan: getUID(plan)! } },
  };

  const [pods = [], podsLoaded, podsError] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    groupVersionKind: { kind: 'Pod', version: 'v1' },
    ...watchOptions,
  });

  const [jobs = [], jobsLoaded, jobsError] = useK8sWatchResource<IoK8sApiBatchV1Job[]>({
    groupVersionKind: { group: 'batch', kind: 'Job', version: 'v1' },
    ...watchOptions,
  });

  const [pvcs = [], pvcsLoaded, pvcsError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: { kind: 'PersistentVolumeClaim', version: 'v1' },
    ...watchOptions,
  });

  const [dvs = [], dvsLoaded, dvsError] = useK8sWatchResource<V1beta1DataVolume[]>({
    groupVersionKind: { group: 'cdi.kubevirt.io', kind: 'DataVolume', version: 'v1beta1' },
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
    return virtualMachines.map((vmSpec) => ({
      dvs: dvsDict[vmSpec.id!],
      jobs: jobsDict[vmSpec.id!],
      pods: podsDict[vmSpec.id!],
      pvcs: pvcsDict[vmSpec.id!],
      specVM: vmSpec,
      statusVM: vmDict[vmSpec.id!],
      targetNamespace: plan?.spec?.targetNamespace,
    })) as MigrationStatusVirtualMachinePageData[];
  }, [virtualMachines, dvsDict, jobsDict, podsDict, pvcsDict, vmDict, plan?.spec?.targetNamespace]);

  return {
    error: podsError ?? jobsError ?? pvcsError ?? dvsError,
    loaded: podsLoaded && jobsLoaded && pvcsLoaded && dvsLoaded,
    migrationListData,
  };
};
