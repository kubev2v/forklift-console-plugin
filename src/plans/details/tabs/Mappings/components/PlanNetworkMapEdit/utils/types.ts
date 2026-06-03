import type {
  OVirtNicProfile,
  ProviderVirtualMachine,
  V1beta1NetworkMap,
  V1beta1Provider,
} from '@forklift-ui/types';
import type { NetworkMapping } from '@utils/crds/maps/types';
import type { MappingValue } from '@utils/types';

export type PlanNetworkEditFormValues = {
  networkMap: NetworkMapping[];
};

export type PlanNetworkMapEditProps = {
  sourceProvider: V1beta1Provider;
  networkMap: V1beta1NetworkMap;
  initialMappings: NetworkMapping[];
  isLoading: boolean;
  oVirtNicProfiles: OVirtNicProfile[];
  usedSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
  otherSourceNetworks: MappingValue[];
  sourceNetworksLoading: boolean;
  targetNetworks: Record<string, MappingValue>;
  loadError: Error | null;
};
