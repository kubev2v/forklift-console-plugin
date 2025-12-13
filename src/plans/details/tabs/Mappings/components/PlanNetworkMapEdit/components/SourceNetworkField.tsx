import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { NetworkMappingId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import EmptyCategorySelectOption from 'src/plans/components/EmptyCategorySelectOption';
import {
  NetworkMapFieldId,
  type NetworkMapping,
} from 'src/plans/create/steps/network-map/constants';
import type { MappingValue } from 'src/plans/create/types';

import Select from '@components/common/Select';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanNetworkEditFormValues } from '../utils/types';

type SourceNetworkFieldProps = {
  fieldId: NetworkMappingId;
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({
  fieldId,
  otherSourceNetworks,
  usedSourceNetworks,
}) => {
  const { t } = useForkliftTranslation();
  const { control, trigger } = useFormContext<PlanNetworkEditFormValues>();
  const networkMappings = useWatch({ control, name: NetworkMapFieldId.NetworkMap });

  const allNetworks = [...usedSourceNetworks, ...otherSourceNetworks];
  const duplicateNames = getDuplicateValues(allNetworks, (network) => network.name);

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Select
          ref={field.ref}
          id={fieldId}
          testId={`source-network-${fieldId}`}
          value={(field.value as MappingValue).name}
          onSelect={async (_event, value) => {
            field.onChange(value);
            await trigger(fieldId);
          }}
          placeholder={t('Select source network')}
        >
          <SelectGroup label={t('Networks used by the selected VMs')}>
            <SelectList>
              {isEmpty(usedSourceNetworks) ? (
                <EmptyCategorySelectOption resourceName="networks" />
              ) : (
                usedSourceNetworks.map((usedNetwork) => (
                  <SelectOption
                    key={usedNetwork.name}
                    value={usedNetwork}
                    description={duplicateNames.has(usedNetwork.name) ? usedNetwork.id : undefined}
                    isDisabled={networkMappings.some(
                      (mapping: NetworkMapping) =>
                        mapping[NetworkMapFieldId.SourceNetwork].id === usedNetwork.id,
                    )}
                  >
                    {usedNetwork.name}
                  </SelectOption>
                ))
              )}
            </SelectList>
          </SelectGroup>

          <SelectGroup label={t('Other networks present on the source provider')}>
            <SelectList>
              {isEmpty(otherSourceNetworks) ? (
                <EmptyCategorySelectOption resourceName="networks" />
              ) : (
                otherSourceNetworks?.map((otherNetwork) => (
                  <SelectOption
                    key={otherNetwork.name}
                    value={otherNetwork}
                    description={
                      duplicateNames.has(otherNetwork.name) ? otherNetwork.id : undefined
                    }
                    isDisabled={networkMappings.some(
                      (mapping: NetworkMapping) =>
                        mapping[NetworkMapFieldId.SourceNetwork].id === otherNetwork.id,
                    )}
                  >
                    {otherNetwork.name}
                  </SelectOption>
                ))
              )}
            </SelectList>
          </SelectGroup>
        </Select>
      )}
    />
  );
};

export default SourceNetworkField;
