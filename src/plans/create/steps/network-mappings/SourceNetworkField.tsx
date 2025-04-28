import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

import { NetworkMapFieldId, type NetworkMapping } from './constants';

type SourceNetworkFieldProps = {
  fieldId: string;
  usedLabels: string[];
  otherLabels: string[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({ fieldId, otherLabels, usedLabels }) => {
  const { t } = useForkliftTranslation();
  const { control, trigger } = useCreatePlanFormContext();
  const netMappings = useWatch({ control, name: NetworkMapFieldId.NetworkMappings });

  return (
    <FormGroupWithErrorText isRequired fieldId={fieldId}>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={fieldId}
            value={field.value}
            onSelect={async (_event, value) => {
              field.onChange(value);
              await trigger(NetworkMapFieldId.NetworkMappings);
            }}
            placeholder={t('Select source network')}
          >
            <SelectGroup label={t('Networks used by the selected VMs')}>
              <SelectList>
                {isEmpty(usedLabels) ? (
                  <SelectOption isDisabled={true}>{t('No networks in this category')}</SelectOption>
                ) : (
                  usedLabels.map((usedNetworkLabel) => (
                    <SelectOption
                      key={usedNetworkLabel}
                      value={usedNetworkLabel}
                      isDisabled={netMappings.some(
                        (mapping: NetworkMapping) =>
                          mapping[NetworkMapFieldId.SourceNetwork] === usedNetworkLabel,
                      )}
                    >
                      {usedNetworkLabel}
                    </SelectOption>
                  ))
                )}
              </SelectList>
            </SelectGroup>

            <SelectGroup label={t('Other networks present on the source provider')}>
              <SelectList>
                {isEmpty(otherLabels) ? (
                  <SelectOption isDisabled={true}>{t('No networks in this category')}</SelectOption>
                ) : (
                  otherLabels?.map((otherNetworkLabel) => (
                    <SelectOption
                      key={otherNetworkLabel}
                      value={otherNetworkLabel}
                      isDisabled={netMappings.some(
                        (mapping: NetworkMapping) =>
                          mapping[NetworkMapFieldId.SourceNetwork] === otherNetworkLabel,
                      )}
                    >
                      {otherNetworkLabel}
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
