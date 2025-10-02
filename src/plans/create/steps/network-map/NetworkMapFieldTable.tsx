import type { FC } from 'react';
import { useFieldArray } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import type { OVirtNicProfile } from '@kubev2v/types';
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
import TargetNetworkField from './TargetNetworkField';
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

  return (
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
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          [...usedSourceNetworks, ...otherSourceNetworks].length === netMappingFields.length ||
          isLoading ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          const missingNetwork = usedSourceNetworks.find(
            (sourceNetwork) =>
              !netMappingFields.find(
                (netMapping) => netMapping.sourceNetwork.id === sourceNetwork.id,
              ),
          );

          append({
            [NetworkMapFieldId.SourceNetwork]:
              missingNetwork ?? defaultNetMapping[NetworkMapFieldId.SourceNetwork],
            [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
          });
        },
      }}
      removeButton={{
        isDisabled: (index) => {
          if (netMappingFields.length <= 1) {
            return true;
          }
          return Boolean(
            usedSourceNetworks.find(
              (network) => network.id === netMappingFields[index].sourceNetwork.id,
            ),
          );
        },
        onClick: (index) => {
          if (
            netMappingFields.length > 1 &&
            !usedSourceNetworks.find(
              (network) => network.id === netMappingFields[index].sourceNetwork.id,
            )
          ) {
            remove(index);
          }
        },
        tooltip: (index) => {
          if (netMappingFields.length <= 1) {
            return t('At least one network mapping must be provided.');
          }
          if (
            usedSourceNetworks.find(
              (network) => network.id === netMappingFields[index].sourceNetwork.id,
            )
          ) {
            return t('All networks detected on the selected VMs require a mapping.');
          }
          return undefined;
        },
      }}
    />
  );
};

export default NetworkMapFieldTable;
