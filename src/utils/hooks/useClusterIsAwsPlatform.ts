import { type K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { AWS_PLATFORM, INFRASTRUCTURE_GVK } from '@utils/constants';

type InfrastructureResource = K8sResourceKind & {
  status?: {
    platformStatus?: {
      type?: string;
    };
  };
};

export const useClusterIsAwsPlatform = (): boolean => {
  const [infrastructure, loaded] = useK8sWatchResource<InfrastructureResource>({
    groupVersionKind: INFRASTRUCTURE_GVK,
    name: 'cluster',
  });

  if (!loaded) {
    return false;
  }

  return infrastructure?.status?.platformStatus?.type === AWS_PLATFORM;
};
