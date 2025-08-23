import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { NetworkMappingValue } from 'src/networkMaps/types';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { NetworkMapFieldId, type NetworkMapping } from '../../constants';
import type { CreateNetworkMapFormData } from '../types';

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

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={fieldId}
            testId="network-map-source-network-select"
            isDisabled={isSubmitting}
            value={(field.value as NetworkMappingValue).name}
            onSelect={async (_event, value) => {
              field.onChange(value);
              await trigger(NetworkMapFieldId.NetworkMap);
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
                  const networkValue: NetworkMappingValue = {
                    id: network.id,
                    name: networkLabel,
                  };

                  return (
                    <SelectOption
                      key={network.id}
                      value={networkValue}
                      isDisabled={networkMappings?.some(
                        (mapping: NetworkMapping) =>
                          mapping[NetworkMapFieldId.SourceNetwork].name === networkLabel,
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
