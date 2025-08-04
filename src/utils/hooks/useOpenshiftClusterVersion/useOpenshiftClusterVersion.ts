import { useMemo } from 'react';

import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { type ClusterVersion, ClusterVersionModel } from './utils/constants';

const useOpenshiftClusterVersion = (): [string | undefined, boolean, unknown] => {
  const [clusterVersionResources, clusterVersionLoaded, clusterVersionError] = useK8sWatchResource<
    ClusterVersion[]
  >({
    groupVersionKind: getGroupVersionKindForModel(ClusterVersionModel),
    isList: true,
  });

  const clusterVersion = useMemo(() => {
    return clusterVersionResources?.find((versionCR) => versionCR?.status?.desired?.version)?.status
      ?.desired?.version;
  }, [clusterVersionResources]);

  return [clusterVersion, clusterVersionLoaded, clusterVersionError];
};

export default useOpenshiftClusterVersion;
