import type {
  OVirtNicProfile,
  ProviderVirtualMachine,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import type { NetworkMapping } from '@utils/mappings/networkMap';
import type { StorageMapping, TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

export type UsePlanMappingsPageData = (
  name: string,
  namespace: string,
) => {
  availableSourceStorages: InventoryStorage[];
  availableTargetStorages: TargetStorage[];
  isLoading: boolean;
  message: string | null;
  networkMap: V1beta1NetworkMap | undefined;
  networkMappings: NetworkMapping[];
  otherSourceNetworks: MappingValue[];
  otherSourceStorages: MappingValue[];
  oVirtNicProfiles: OVirtNicProfile[];
  plan: V1beta1Plan;
  sourceNetworksError: Error | null;
  sourceProvider: V1beta1Provider;
  sourceStoragesLoadError: Error | null;
  sourceStoragesLoading: boolean;
  storageMap: V1beta1StorageMap | undefined;
  storageMappings: StorageMapping[];
  targetNetworksError: Error | null;
  targetNetworksMap: Record<string, MappingValue>;
  targetStoragesLoadError: Error | null;
  targetStoragesLoading: boolean;
  usedSourceNetworks: MappingValue[];
  usedSourceStorages: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
};
