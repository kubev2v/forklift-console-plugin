import type { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { AZURE_PLATFORM, INFRASTRUCTURE_GVK } from '@utils/constants';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

type InfrastructureResource = K8sResourceKind & {
  status?: {
    platformStatus?: {
      type?: string;
    };
  };
};

type ClusterAzurePlatformState = {
  isAzurePlatform: boolean;
  loaded: boolean;
};

const isForcedForDevelopment = (): boolean => process.env.FORCE_SHOW_AZURE_PROVIDER === 'true';

export const useClusterIsAzurePlatform = (): ClusterAzurePlatformState => {
  const [infrastructure, loaded] = useK8sWatchResource<InfrastructureResource>({
    groupVersionKind: INFRASTRUCTURE_GVK,
    name: 'cluster',
  });

  return {
    isAzurePlatform:
      isForcedForDevelopment() ||
      (loaded && infrastructure?.status?.platformStatus?.type === AZURE_PLATFORM),
    loaded,
  };
};
