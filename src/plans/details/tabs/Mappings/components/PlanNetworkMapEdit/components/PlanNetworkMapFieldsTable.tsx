import { type FC, useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { networkMapFieldLabels } from 'src/networkMaps/utils/constants';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { NetworkMapFieldId } from 'src/networkMaps/utils/types';
import { defaultNetMapping, ignoreNetMapping } from 'src/plans/create/steps/network-map/constants';
import { validateNetworkMap } from 'src/plans/create/steps/network-map/utils';
import type { MappingValue } from 'src/plans/create/types';
import { hasPodNetworkMappings } from 'src/plans/create/utils/hasMultiplePodNetworkMappings';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import type { OVirtNicProfile, ProviderVirtualMachine } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanNetworkEditFormValues } from '../utils/types';

import SourceNetworkField from './SourceNetworkField';

type PlanNetworkMapFieldsTableProps = {
  oVirtNicProfiles: OVirtNicProfile[];
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
  isLoading: boolean;
  targetNetworks: Record<string, MappingValue>;
  loadError: Error | null;
};

const PlanNetworkMapFieldsTable: FC<PlanNetworkMapFieldsTableProps> = ({
  isLoading,
  loadError,
  otherSourceNetworks,
  oVirtNicProfiles,
  targetNetworks,
  usedSourceNetworks,
  vms,
}) => {
  const { t } = useForkliftTranslation();
  const { control, trigger } = useFormContext<PlanNetworkEditFormValues>();

  const networkMappings = useWatch({
    control,
    name: NetworkMapFieldId.NetworkMap,
  });

  const {
    append,
    fields: networkMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) => {
        return validateNetworkMap({
          oVirtNicProfiles,
          usedSourceNetworks,
          values,
          vms,
        });
      },
    },
  });

  useEffect(() => {
    setTimeout(() => {
      trigger().catch(() => undefined);
    }, 0);
  }, [trigger]);

  return (
    <FieldBuilderTable
      headers={[
        {
          label: networkMapFieldLabels[NetworkMapFieldId.SourceNetwork],
          width: 45,
        },
        {
          label: networkMapFieldLabels[NetworkMapFieldId.TargetNetwork],
          width: 45,
        },
      ]}
      fieldRows={networkMappingFields.map((field, index) => ({
        ...field,
        inputs: [
          <SourceNetworkField
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
            key={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
            usedSourceNetworks={usedSourceNetworks}
            otherSourceNetworks={otherSourceNetworks}
          />,
          <TargetNetworkField
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            key={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            targetNetworks={targetNetworks}
            showIgnoreNetworkOption
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          [...usedSourceNetworks, ...otherSourceNetworks].length === networkMappingFields.length ||
          isLoading ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          const missingNetwork = usedSourceNetworks.find(
            (sourceNetwork) =>
              !networkMappingFields.some(
                (netMapping) => netMapping.sourceNetwork.id === sourceNetwork.id,
              ),
          );

          append({
            [NetworkMapFieldId.SourceNetwork]:
              missingNetwork ?? defaultNetMapping[NetworkMapFieldId.SourceNetwork],
            [NetworkMapFieldId.TargetNetwork]: hasPodNetworkMappings(networkMappings)
              ? ignoreNetMapping[NetworkMapFieldId.TargetNetwork]
              : defaultNetMapping[NetworkMapFieldId.TargetNetwork],
          });

          trigger().catch(() => undefined);
        },
      }}
      removeButton={{
        isDisabled: (index) => {
          if (networkMappingFields.length <= 1) {
            return true;
          }
          return usedSourceNetworks.some(
            (network) => network.id === networkMappingFields[index].sourceNetwork.id,
          );
        },
        onClick: (index) => {
          if (
            networkMappingFields.length > 1 &&
            !usedSourceNetworks.some(
              (network) => network.id === networkMappingFields[index].sourceNetwork.id,
            )
          ) {
            remove(index);
          }
        },
        tooltip: (index) => {
          if (networkMappingFields.length <= 1) {
            return t('At least one network mapping must be provided.');
          }
          if (
            usedSourceNetworks.some(
              (network) => network.id === networkMappingFields[index].sourceNetwork.id,
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

export default PlanNetworkMapFieldsTable;
