import type { NetworkMapping } from 'src/networkMaps/utils/types';
import type { MappingValue } from 'src/plans/create/types';

import type {
  OVirtNicProfile,
  ProviderVirtualMachine,
  V1beta1NetworkMap,
  V1beta1Provider,
} from '@forklift-ui/types';

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
