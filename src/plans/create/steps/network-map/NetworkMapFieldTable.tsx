import { type FC, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import MultiNicInfoAlert from '@components/mappings/network-mappings/MultiNicInfoAlert';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import { getMultiNicSourceNetworks } from '@components/mappings/network-mappings/utils/getMultiNicSourceNetworks';
import type {
  OVirtNicProfile,
  ProviderVirtualMachine as TypesProviderVirtualMachine,
} from '@forklift-ui/types';
import { Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { MappingValue, ProviderVirtualMachine } from '../../types';

import {
  defaultNetMapping,
  netMapFieldLabels,
  NetworkMapFieldId,
  type NetworkMapping,
} from './constants';
import SourceNetworkField from './SourceNetworkField';
import { getNetworkMapFieldId, validateNetworkMap } from './utils';

type NetworkMapFieldTableProps = {
  networkMap: NetworkMapping[];
  vms: Record<string, ProviderVirtualMachine>;
  oVirtNicProfiles: OVirtNicProfile[];
  targetNetworks: Record<string, MappingValue>;
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
  isLoading: boolean;
  loadError: Error | null;
};

const NetworkMapFieldTable: FC<NetworkMapFieldTableProps> = ({
  isLoading,
  loadError,
  otherSourceNetworks,
  oVirtNicProfiles,
  targetNetworks,
  usedSourceNetworks,
  vms,
}) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const {
    append,
    fields: netMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) =>
        validateNetworkMap({ oVirtNicProfiles, usedSourceNetworks, values, vms }),
    },
  });

  const vmsList = useMemo(() => Object.values(vms) as TypesProviderVirtualMachine[], [vms]);
  const networkNames = useMemo(
    () =>
      new Map(
        [...usedSourceNetworks, ...otherSourceNetworks]
          .filter((net) => net.id)
          .map((net) => [net.id!, net.name]),
      ),
    [usedSourceNetworks, otherSourceNetworks],
  );
  const multiNicNetworkIds = useMemo(() => {
    const multiNicMap = getMultiNicSourceNetworks(vmsList, oVirtNicProfiles);
    return new Set(multiNicMap.keys());
  }, [vmsList, oVirtNicProfiles]);

  return (
    <Stack hasGutter>
      <MultiNicInfoAlert
        vms={vmsList}
        oVirtNicProfiles={oVirtNicProfiles}
        networkNames={networkNames}
      />
      <FieldBuilderTable
        headers={[
          { label: netMapFieldLabels[NetworkMapFieldId.SourceNetwork], width: 45 },
          { label: netMapFieldLabels[NetworkMapFieldId.TargetNetwork], width: 45 },
        ]}
        fieldRows={netMappingFields.map((field, index) => ({
          ...field,
          inputs: [
            <SourceNetworkField
              fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
              usedSourceNetworks={usedSourceNetworks}
              otherSourceNetworks={otherSourceNetworks}
            />,
            <TargetNetworkField
              fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
              targetNetworks={targetNetworks}
              showIgnoreNetworkOption
              hideNonNadTargets={multiNicNetworkIds.has(field.sourceNetwork?.id ?? '')}
              triggerFieldId={NetworkMapFieldId.NetworkMap}
              testId="network-map-target-network-select"
            />,
          ],
        }))}
        addButton={{
          isDisabled: isLoading || Boolean(loadError),
          label: t('Add mapping'),
          onClick: () => {
            append({
              [NetworkMapFieldId.SourceNetwork]: defaultNetMapping[NetworkMapFieldId.SourceNetwork],
              [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
            });
          },
        }}
        removeButton={{
          isDisabled: () => netMappingFields.length <= 1,
          onClick: (index) => {
            if (netMappingFields.length > 1) {
              remove(index);
            }
          },
          tooltip: (index) => {
            if (netMappingFields.length <= 1) {
              return t('At least one network mapping must be provided.');
            }
            return undefined;
          },
        }}
      />
    </Stack>
  );
};

export default NetworkMapFieldTable;
