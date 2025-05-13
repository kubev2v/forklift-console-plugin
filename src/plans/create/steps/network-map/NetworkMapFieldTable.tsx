import { type FC, useCallback } from 'react';
import { type FieldPath, useFieldArray } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';
import type { CreatePlanFormData, MappingValue } from '../../types';

import {
  defaultNetMapping,
  netMapFieldLabels,
  NetworkMapFieldId,
  type NetworkMapping,
} from './constants';
import SourceNetworkField from './SourceNetworkField';
import TargetNetworkField from './TargetNetworkField';
import { getNetworkMapFieldId } from './utils';

type NetworkMapFieldTableProps = {
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
  targetNetworks,
  usedSourceNetworks,
}) => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();

  const validate = useCallback(
    (values: NetworkMapping[]) => {
      if (
        !usedSourceNetworks.every((sourceNetwork) =>
          values.find(
            (value) => value[NetworkMapFieldId.SourceNetwork].name === sourceNetwork.name,
          ),
        )
      ) {
        return t('All networks detected on the selected VMs require a mapping.');
      }

      return true;
    },
    [t, usedSourceNetworks],
  );

  const {
    append,
    fields: netMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate,
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
          append({
            [NetworkMapFieldId.SourceNetwork]: defaultNetMapping[NetworkMapFieldId.SourceNetwork],
            [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
          });
        },
      }}
      onRemove={(index) => {
        if (netMappingFields.length > 1) {
          remove(index);
          return;
        }

        setValue<FieldPath<CreatePlanFormData>>(
          getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index),
          defaultNetMapping[NetworkMapFieldId.SourceNetwork],
        );
        setValue<FieldPath<CreatePlanFormData>>(
          getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index),
          defaultNetMapping[NetworkMapFieldId.TargetNetwork],
        );
      }}
    />
  );
};

export default NetworkMapFieldTable;
