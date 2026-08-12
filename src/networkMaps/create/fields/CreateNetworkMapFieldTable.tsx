import type { FC } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { useSourceNetworks } from 'src/utils/hooks/useNetworks';
import useTargetNetworks from 'src/utils/hooks/useTargetNetworks';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping, networkMapFieldLabels } from '../../utils/constants';
import type { CreateNetworkMapFormData } from '../types';

import InventorySourceNetworkField from './InventorySourceNetworkField';
import { validateNetworkMaps } from './utils';

const CreateNetworkMapFieldTable: FC = () => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    setValue,
  } = useFormContext<CreateNetworkMapFormData>();
  const [sourceProvider, targetProvider] = useWatch({
    control,
    name: [NetworkMapFieldId.SourceProvider, NetworkMapFieldId.TargetProvider],
  });

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

  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [targetNetworks, _targetNetworksLoading, targetNetworksError] =
    useTargetNetworks(targetProvider);
  const loadError = sourceNetworksError ?? targetNetworksError;

  return (
    <FieldBuilderTable
      addButton={{
        isDisabled:
          isEmpty(sourceNetworks) || sourceNetworksLoading || isSubmitting || Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append(defaultNetworkMapping);
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
          width: 50,
        },
        {
          isRequired: true,
          label: networkMapFieldLabels[NetworkMapFieldId.TargetNetwork],
          width: 50,
        },
      ]}
      removeButton={{
        isDisabled: () => isSubmitting,
        onClick: (index) => {
          if (networkMappingFields.length >= 1) {
            remove(index);
            return;
          }

          setValue(NetworkMapFieldId.NetworkMap, [defaultNetworkMapping]);
        },
      }}
    />
  );
};

export default CreateNetworkMapFieldTable;
