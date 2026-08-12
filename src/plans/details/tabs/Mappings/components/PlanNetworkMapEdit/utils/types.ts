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
  initialMappings: NetworkMapping[];
  isLoading: boolean;
  loadError: Error | null;
  networkMap: V1beta1NetworkMap;
  otherSourceNetworks: MappingValue[];
  oVirtNicProfiles: OVirtNicProfile[];
  sourceNetworksLoading: boolean;
  sourceProvider: V1beta1Provider;
  targetNetworks: Record<string, MappingValue>;
  usedSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
};
