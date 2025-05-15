import type { FC } from 'react';
import { type FieldPath, useFieldArray } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';
import type { CreatePlanFormData, MappingValue } from '../../types';

import { defaultNetMapping, netMapFieldLabels, NetworkMapFieldId } from './constants';
import SourceNetworkField from './SourceNetworkField';
import TargetNetworkField from './TargetNetworkField';
import { getNetworkMapFieldId, validateNetworkMap } from './utils';

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

  const {
    append,
    fields: netMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) => validateNetworkMap(values, usedSourceNetworks),
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
