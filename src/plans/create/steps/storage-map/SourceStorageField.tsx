import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import Select from '@components/common/MtvSelect';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

import { StorageMapFieldId, type StorageMapping } from './constants';

type SourceStorageFieldProps = {
  fieldId: string;
  usedLabels: string[];
  otherLabels: string[];
};

const SourceStorageField: FC<SourceStorageFieldProps> = ({ fieldId, otherLabels, usedLabels }) => {
  const { control, trigger } = useCreatePlanFormContext();
  const { t } = useForkliftTranslation();
  const storageMappings = useWatch({ control, name: StorageMapFieldId.StorageMap });
  const noStorageOption = useMemo(
    () => <SelectOption isDisabled={true}>{t('No storages in this category')}</SelectOption>,
    [t],
  );

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
              await trigger(StorageMapFieldId.StorageMap);
            }}
            placeholder={t('Select source storage')}
          >
            <SelectGroup label={t('Storages used by the selected VMs')}>
              <SelectList>
                {isEmpty(usedLabels)
                  ? noStorageOption
                  : usedLabels.map((usedStorageLabel) => (
                      <SelectOption
                        key={usedStorageLabel}
                        value={usedStorageLabel}
                        isDisabled={storageMappings.some(
                          (mapping: StorageMapping) =>
                            mapping[StorageMapFieldId.SourceStorage] === usedStorageLabel,
                        )}
                      >
                        {usedStorageLabel}
                      </SelectOption>
                    ))}
              </SelectList>
            </SelectGroup>

            <SelectGroup label={t('Other storages present on the source provider')}>
              <SelectList>
                {isEmpty(otherLabels)
                  ? noStorageOption
                  : otherLabels?.map((otherStorageLabel) => (
                      <SelectOption
                        key={otherStorageLabel}
                        value={otherStorageLabel}
                        isDisabled={storageMappings.some(
                          (mapping: StorageMapping) =>
                            mapping[StorageMapFieldId.SourceStorage] === otherStorageLabel,
                        )}
                      >
                        {otherStorageLabel}
                      </SelectOption>
                    ))}
              </SelectList>
            </SelectGroup>
          </Select>
        )}
      />
    </FormGroupWithErrorText>
  );
};

export default SourceStorageField;
