import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import EmptyCategorySelectOption from 'src/plans/components/EmptyCategorySelectOption';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';
import type { MappingValue } from '../../types';

import { NetworkMapFieldId, type NetworkMapping } from './constants';

type SourceNetworkFieldProps = {
  fieldId: string;
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({
  fieldId,
  otherSourceNetworks,
  usedSourceNetworks,
}) => {
  const { t } = useForkliftTranslation();
  const { control, trigger } = useCreatePlanFormContext();
  const networkMappings = useWatch({ control, name: NetworkMapFieldId.NetworkMap });

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={fieldId}
            value={(field.value as MappingValue).name}
            onSelect={async (_event, value) => {
              field.onChange(value);
              await trigger(NetworkMapFieldId.NetworkMap);
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
                      isDisabled={networkMappings.some(
                        (mapping: NetworkMapping) =>
                          mapping[NetworkMapFieldId.SourceNetwork].name === usedNetwork.name,
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
                      isDisabled={networkMappings.some(
                        (mapping: NetworkMapping) =>
                          mapping[NetworkMapFieldId.SourceNetwork].name === otherNetwork.name,
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
    </FormGroupWithErrorText>
  );
};

export default SourceNetworkField;
