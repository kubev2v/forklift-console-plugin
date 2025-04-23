import { type FC, useCallback } from 'react';
import { type FieldPath, useFieldArray } from 'react-hook-form';

import { Button, ButtonVariant, Icon, Stack } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
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

import './NetworkMapFieldTable.style.scss';

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
    name: NetworkMapFieldId.NetworkMappings,
    rules: {
      validate,
    },
  });

  return (
    <Stack hasGutter>
      <Table className="network-map-table pf-m-grid-md" role="grid" variant="compact">
        <Thead>
          <Tr>
            <Th width={45}>{netMapFieldLabels[NetworkMapFieldId.SourceNetwork]}</Th>
            <Th width={45}>{netMapFieldLabels[NetworkMapFieldId.TargetNetwork]}</Th>
            <Th width={10} />
          </Tr>
        </Thead>
        <Tbody>
          {netMappingFields.map((netMappingField, index) => {
            const sourceNetworkFieldId = getNetworkMapFieldId(
              NetworkMapFieldId.SourceNetwork,
              index,
            );
            const targetNetworkFieldId = getNetworkMapFieldId(
              NetworkMapFieldId.TargetNetwork,
              index,
            );

            return (
              <Tr key={netMappingField.id}>
                <Td>
                  <SourceNetworkField
                    fieldId={sourceNetworkFieldId}
                    usedLabels={usedSourceLabels}
                    otherLabels={otherSourceLabels}
                  />
                </Td>

                <Td>
                  <TargetNetworkField
                    fieldId={targetNetworkFieldId}
                    targetNetworks={targetNetworks}
                  />
                </Td>

                <Td isActionCell>
                  <Button
                    icon={
                      <Icon size="md">
                        <MinusCircleIcon />
                      </Icon>
                    }
                    isInline
                    variant={ButtonVariant.plain}
                    onClick={() => {
                      if (netMappingFields.length > 1) {
                        remove(index);
                        return;
                      }

                      setValue<FieldPath<CreatePlanFormData>>(sourceNetworkFieldId, '');
                      setValue<FieldPath<CreatePlanFormData>>(
                        targetNetworkFieldId,
                        defaultNetMapping[NetworkMapFieldId.TargetNetwork],
                      );
                    }}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Button
        isInline
        variant={ButtonVariant.link}
        icon={<PlusCircleIcon />}
        isDisabled={
          [...usedSourceLabels, ...otherSourceLabels].length === netMappingFields.length ||
          isLoading ||
          Boolean(loadError)
        }
        onClick={() => {
          append({
            [NetworkMapFieldId.SourceNetwork]: '',
            [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
          });
        }}
      >
        {t('Add mapping')}
      </Button>
    </Stack>
  );
};

export default NetworkMapFieldTable;
