import type { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { AWS_PLATFORM, INFRASTRUCTURE_GVK } from '@utils/constants';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

type InfrastructureResource = K8sResourceKind & {
  status?: {
    platformStatus?: {
      type?: string;
    };
  };
};

type ClusterAwsPlatformState = {
  isAwsPlatform: boolean;
  loaded: boolean;
};

export const useClusterIsAwsPlatform = (): ClusterAwsPlatformState => {
  const [infrastructure, loaded] = useK8sWatchResource<InfrastructureResource>({
    groupVersionKind: INFRASTRUCTURE_GVK,
    name: 'cluster',
  });

  return {
    isAwsPlatform: loaded && infrastructure?.status?.platformStatus?.type === AWS_PLATFORM,
    loaded,
  };
};
