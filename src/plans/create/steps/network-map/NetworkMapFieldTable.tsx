import { type FC, useCallback } from 'react';
import { type FieldPath, useFieldArray } from 'react-hook-form';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreatePlanFormData } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';

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
  targetNetworks: Record<string, string>;
  usedSourceLabels: string[];
  otherSourceLabels: string[];
  isLoading: boolean;
  loadError: Error | null;
};

const NetworkMapFieldTable: FC<NetworkMapFieldTableProps> = ({
  isLoading,
  loadError,
  otherSourceLabels,
  targetNetworks,
  usedSourceLabels,
}) => {
  const { t } = useForkliftTranslation();
  const { control, setValue } = useCreatePlanFormContext();

  const validate = useCallback(
    (values: NetworkMapping[]) => {
      if (
        !usedSourceLabels.every((label) =>
          values.find((value) => value[NetworkMapFieldId.SourceNetwork] === label),
        )
      ) {
        return t('All networks detected on the selected VMs require a mapping.');
      }

      return true;
    },
    [t, usedSourceLabels],
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
            usedLabels={usedSourceLabels}
            otherLabels={otherSourceLabels}
          />,
          <TargetNetworkField
            fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            targetNetworks={targetNetworks}
          />,
        ],
      }))}
      addButton={{
        isDisabled:
          [...usedSourceLabels, ...otherSourceLabels].length === netMappingFields.length ||
          isLoading ||
          Boolean(loadError),
        label: t('Add mapping'),
        onClick: () => {
          append({
            [NetworkMapFieldId.SourceNetwork]: '',
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
          '',
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
