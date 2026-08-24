import type {
  OpenShiftNetworkAttachmentDefinition,
  OVirtNicProfile,
  ProviderVirtualMachine,
} from '@forklift-ui/types';
import { DEFAULT_NETWORK, Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';
import {
  defaultNetMapping,
  NetworkMapFieldId,
  type NetworkMapping,
} from '@utils/mappings/networkMap';
import type { MappingValue } from '@utils/types';

import type { CategorizedSourceMappings, ProviderNetwork } from '../../types';
import { hasMultiplePodNetworkMappings } from '../../utils/hasMultiplePodNetworkMappings';
import { getMapResourceLabel } from '../utils';

import { getHypervVlanQualifiedNetworks } from './hypervVlanNetworks';
import { getNetworksUsedByProviderVms } from './vmNetworkExtraction';

export { getHypervVlanQualifiedNetworks } from './hypervVlanNetworks';

type NetworkMappingId = `${NetworkMapFieldId.NetworkMap}.${number}.${keyof NetworkMapping}`;

type ValidateNetworkMapParams = {
  oVirtNicProfiles: OVirtNicProfile[];
  usedSourceNetworks: MappingValue[];
  values: NetworkMapping[];
  vms: Record<string, ProviderVirtualMachine>;
};

export const getNetworkMapFieldId = (id: keyof NetworkMapping, index: number): NetworkMappingId =>
  `${NetworkMapFieldId.NetworkMap}.${index}.${id}`;

export const getSourceNetworkValues = (
  availableSourceNetworks: (ProviderNetwork | OpenShiftNetworkAttachmentDefinition)[],
  vms: ProviderVirtualMachine[],
  nicProfiles: OVirtNicProfile[],
): CategorizedSourceMappings => {
  const usedNetworkIds = new Set(
    getNetworksUsedByProviderVms(vms, nicProfiles, availableSourceNetworks),
  );

  const vlanQualified = getHypervVlanQualifiedNetworks(vms, availableSourceNetworks);
  const networksWithVlanConflict = new Set(vlanQualified.map((entry) => entry.id));

  const used: MappingValue[] = [];
  const other: MappingValue[] = [];

  for (const network of availableSourceNetworks) {
    if (networksWithVlanConflict.has(network.id)) {
      // Network replaced by VLAN-qualified entries below
    } else {
      const mappingValue = {
        id: network.id,
        name: network.name === DEFAULT_NETWORK ? DEFAULT_NETWORK : getMapResourceLabel(network),
      };

      if (usedNetworkIds.has(mappingValue.id) || usedNetworkIds.has(mappingValue.name)) {
        used.push(mappingValue);
      } else {
        other.push(mappingValue);
      }
    }
  }

  used.push(...vlanQualified);

  return { other, used };
};

export const validateNetworkMap = (
  validateNetworkMapParams: ValidateNetworkMapParams,
): string | undefined => {
  const { oVirtNicProfiles, usedSourceNetworks, values, vms } = validateNetworkMapParams;
  const mappedNetworkNames = new Set(
    values.map((value) => value[NetworkMapFieldId.SourceNetwork].name),
  );

  const hasUnmappedNetwork = !usedSourceNetworks.every((sourceNetwork) =>
    mappedNetworkNames.has(sourceNetwork.name),
  );
  if (hasUnmappedNetwork) {
    return t('All networks detected on the selected VMs require a mapping.');
  }

  const hasMultiplePodNetwork = hasMultiplePodNetworkMappings(values, vms, oVirtNicProfiles);
  if (hasMultiplePodNetwork) {
    return t(
      'At least one VM is detected with more than one interface mapped to Default Network. This is not allowed.',
    );
  }

  return undefined;
};

export const filterTargetNetworksByProject = (
  availableTargetNetworks: OpenShiftNetworkAttachmentDefinition[],
  targetProject: string,
): Record<string, MappingValue> => {
  if (isEmpty(availableTargetNetworks) || !targetProject) {
    return { podNetwork: defaultNetMapping[NetworkMapFieldId.TargetNetwork] };
  }

  return availableTargetNetworks.reduce(
    (networkMap: Record<string, MappingValue>, network) => {
      const isValidNamespace =
        network.namespace === targetProject || network.namespace === Namespace.Default;

      if (isValidNamespace) {
        networkMap[network.uid] = {
          id: network.id,
          name: `${network.namespace}/${network.name}`,
        };
      }

      return networkMap;
    },
    { podNetwork: defaultNetMapping[NetworkMapFieldId.TargetNetwork] },
  );
};
