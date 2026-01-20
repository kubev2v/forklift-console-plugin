import type { FC } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { useSourceNetworks } from 'src/providers/hooks/useNetworks';
import useTargetNetworks from 'src/utils/hooks/useTargetNetworks';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping, networkMapFieldLabels } from '../../utils/constants';
import { NetworkMapFieldId } from '../../utils/types';
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
  const [project, sourceProvider, targetProvider] = useWatch({
    control,
    name: [
      NetworkMapFieldId.Project,
      NetworkMapFieldId.SourceProvider,
      NetworkMapFieldId.TargetProvider,
    ],
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
  const [targetNetworks, _targetNetworksLoading, targetNetworksError] = useTargetNetworks(
    targetProvider,
    project,
  );
  const loadError = sourceNetworksError ?? targetNetworksError;

  return (
    <FieldBuilderTable
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
      fieldRows={networkMappingFields.map((field, index) => ({
        ...field,
        inputs: [
          <InventorySourceNetworkField
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
            sourceNetworks={sourceNetworks}
          />,
          <TargetNetworkField
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            targetNetworks={targetNetworks}
            emptyStateMessage={t(
              'Select a target provider and project to list available target networks',
            )}
            isDisabled={isSubmitting}
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          isEmpty(sourceNetworks) ||
          sourceNetworks.length === networkMappingFields.length ||
          sourceNetworksLoading ||
          isSubmitting ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append(defaultNetworkMapping);
        },
      }}
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
