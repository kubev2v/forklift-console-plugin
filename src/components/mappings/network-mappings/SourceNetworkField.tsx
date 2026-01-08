import { useMemo } from 'react';
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type UseFormTrigger,
  useWatch,
} from 'react-hook-form';
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

import { isNetworkMappingDisabled } from './utils/utils';

type SourceNetworkFieldProps<T extends FieldValues> = {
  fieldId: Path<T>;
  control: Control<T>;
  trigger: UseFormTrigger<T>;
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
};

const SourceNetworkField = <T extends FieldValues>({
  control,
  fieldId,
  otherSourceNetworks,
  trigger,
  usedSourceNetworks,
}: SourceNetworkFieldProps<T>) => {
  const { t } = useForkliftTranslation();
  const networkMappings: NetworkMapping[] = useWatch({
    control,
    name: NetworkMapFieldId.NetworkMap as Path<T>,
  });

  const allNetworks = useMemo(
    () => [...usedSourceNetworks, ...otherSourceNetworks],
    [usedSourceNetworks, otherSourceNetworks],
  );
  const duplicateNames = useMemo(
    () => getDuplicateValues(allNetworks, (network) => network.name),
    [allNetworks],
  );

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
                    description={duplicateNames.has(usedNetwork.name) ? usedNetwork.id : null}
                    isDisabled={isNetworkMappingDisabled(networkMappings, usedNetwork)}
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
                    description={duplicateNames.has(otherNetwork.name) ? otherNetwork.id : null}
                    isDisabled={isNetworkMappingDisabled(networkMappings, otherNetwork)}
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
