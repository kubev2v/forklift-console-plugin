import type { ReactElement } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import InventorySourceNetworkField from 'src/networkMaps/create/fields/InventorySourceNetworkField';
import { validateNetworkMaps } from 'src/networkMaps/create/fields/utils';
import { defaultNetworkMapping, networkMapFieldLabels } from 'src/networkMaps/utils/constants';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { isEmpty } from '@utils/helpers';
import type { InventoryNetwork } from '@utils/hooks/useNetworks';
import { useForkliftTranslation } from '@utils/i18n';
import { defaultNetMapping } from '@utils/mappings/networkMap';
import type { MappingValue } from '@utils/types';

import type { NetworkEditFormValues } from '../utils/types';

type NetworkMapEditFieldTableProps = {
  isSubmitting: boolean;
  loadError: Error | null;
  sourceNetworks: InventoryNetwork[];
  sourceNetworksLoading: boolean;
  targetNetworks: MappingValue[];
  targetNetworksLoading: boolean;
};

const NetworkMapEditFieldTable = ({
  isSubmitting,
  loadError,
  sourceNetworks,
  sourceNetworksLoading,
  targetNetworks,
  targetNetworksLoading,
}: NetworkMapEditFieldTableProps): ReactElement => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useFormContext<NetworkEditFormValues>();

  const {
    append,
    fields: networkMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) => validateNetworkMaps(values),
    },
  });

  return (
    <FieldBuilderTable
      addButton={{
        isDisabled:
          isEmpty(sourceNetworks) ||
          sourceNetworksLoading ||
          targetNetworksLoading ||
          isSubmitting ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append({
            [NetworkMapFieldId.SourceNetwork]: defaultNetMapping[NetworkMapFieldId.SourceNetwork],
            [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
          });
        },
      }}
      fieldRows={networkMappingFields.map((field, index) => ({
        ...field,
        inputs: [
          <InventorySourceNetworkField
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
            key={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
            sourceNetworks={sourceNetworks}
          />,
          <TargetNetworkField
            emptyStateMessage={t('Select a target provider to list available target networks')}
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            isDisabled={isSubmitting}
            key={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            showIgnoreNetworkOption
            targetNetworks={targetNetworks}
          />,
        ],
      }))}
      headers={[
        {
          isRequired: true,
          label: networkMapFieldLabels[NetworkMapFieldId.SourceNetwork],
          width: 45,
        },
        {
          isRequired: true,
          label: networkMapFieldLabels[NetworkMapFieldId.TargetNetwork],
          width: 45,
        },
      ]}
      removeButton={{
        isDisabled: () => isSubmitting,
        onClick: (index) => {
          if (networkMappingFields.length > 1) {
            remove(index);
            return;
          }

          setValue(NetworkMapFieldId.NetworkMap, [defaultNetworkMapping]);
        },
      }}
    />
  );
};

export default NetworkMapEditFieldTable;
