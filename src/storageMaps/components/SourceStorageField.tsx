import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from '@components/common/Select';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { getDuplicateValues, isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { MappingValue } from '@utils/types';

type SourceStorageFieldProps = {
  fieldId: string;
  sourceStorages: MappingValue[];
};

/**
 * Flat source storage selector without grouping.
 * Used in storage map details page where categorization by VM usage is not applicable.
 */
const SourceStorageField: FC<SourceStorageFieldProps> = ({ fieldId, sourceStorages }) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext();
  const { t } = useForkliftTranslation();

  const duplicateNames = getDuplicateValues(sourceStorages, (storage) => storage.name);

  return (
    <Controller
      control={control}
      name={fieldId}
      render={({ field }) => (
        <Select
          id={fieldId}
          isDisabled={isSubmitting}
          onSelect={async (_event, value) => {
            field.onChange(value);
            await trigger();
          }}
          placeholder={t('Select source storage')}
          ref={field.ref}
          testId={`source-storage-${fieldId}`}
          value={(field.value as MappingValue).name}
        >
          <SelectList>
            {isEmpty(sourceStorages) ? (
              <SelectOption isDisabled value="">
                {t('No storages available')}
              </SelectOption>
            ) : (
              sourceStorages.map((storage) => (
                <SelectOption
                  description={duplicateNames.has(storage.name) ? storage.id : undefined}
                  key={storage.name}
                  value={storage}
                >
                  {storage.name}
                </SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      )}
    />
  );
};

export default SourceStorageField;
