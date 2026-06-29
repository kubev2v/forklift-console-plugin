import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import type { InventoryNetwork } from 'src/utils/hooks/useNetworks';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { NetworkMapFieldId, type NetworkMapping } from '@utils/crds/maps/types';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { MappingValue } from '@utils/types';

import type { CreateNetworkMapFormData } from '../types';

/**
 * Displays a flat list of source networks from provider inventory.
 *
 * NOTE: This component does NOT perform Hyper-V VLAN disambiguation because it
 * operates at the provider inventory level without VM context. Per-VM VLAN
 * conflicts (multiple NICs on the same switch with different VLANs) are only
 * detected in the plan wizard flow where selected VMs are known.
 * See getHypervVlanQualifiedNetworks() in plans/create/steps/network-map/utils.ts.
 */
type InventorySourceNetworkFieldProps = {
  fieldId: string;
  sourceNetworks: InventoryNetwork[];
};

const InventorySourceNetworkField: FC<InventorySourceNetworkFieldProps> = ({
  fieldId,
  sourceNetworks,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext<CreateNetworkMapFormData>();
  const { t } = useForkliftTranslation();
  const networkMappings = useWatch({ control, name: NetworkMapFieldId.NetworkMap });

  const duplicateLabels = getDuplicateValues(sourceNetworks, (network) =>
    getMapResourceLabel(network),
  );

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={fieldId}
            testId={`source-network-${fieldId}`}
            isDisabled={isSubmitting}
            value={(field.value as MappingValue).name}
            onSelect={async (_event, value) => {
              field.onChange(value);
              await trigger();
            }}
            placeholder={t('Select source network')}
          >
            <SelectList>
              {isEmpty(sourceNetworks) ? (
                <SelectOption key="empty" isDisabled>
                  {t('Select a source provider to list available source networks')}
                </SelectOption>
              ) : (
                sourceNetworks.map((network) => {
                  const networkLabel = getMapResourceLabel(network);
                  const networkValue: MappingValue = {
                    id: network.id,
                    name: networkLabel,
                  };

                  return (
                    <SelectOption
                      key={network.id}
                      value={networkValue}
                      description={duplicateLabels.has(networkLabel) ? network.id : undefined}
                      isDisabled={networkMappings?.some(
                        (mapping: NetworkMapping) =>
                          mapping[NetworkMapFieldId.SourceNetwork].id === network.id,
                      )}
                    >
                      {networkLabel}
                    </SelectOption>
                  );
                })
              )}
            </SelectList>
          </Select>
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default InventorySourceNetworkField;
