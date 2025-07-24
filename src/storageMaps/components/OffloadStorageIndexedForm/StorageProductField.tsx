import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import { FormGroup } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import {
  StorageMapFieldId,
  storageMapFieldLabels,
  storageVendorProductLabels,
  storageVendorProducts,
} from '../../constants';

type StorageProductFieldProps = { fieldId: string };

const StorageProductField: FC<StorageProductFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  const options = storageVendorProducts.map((product) => ({
    label: storageVendorProductLabels[product],
    value: product,
  }));

  return (
    <FormGroup
      fieldId={fieldId}
      label={storageMapFieldLabels[StorageMapFieldId.StorageProduct]}
      labelIcon={
        <HelpIconPopover>
          {t(
            'The commercial product name or model of the storage system being used. This helps ensure the correct features and APIs will be used.',
          )}
        </HelpIconPopover>
      }
    >
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={fieldId}
            isDisabled={isSubmitting}
            value={field.value}
            options={options}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            placeholder={t('Select storage product')}
          />
        )}
      />
    </FormGroup>
  );
};

export default StorageProductField;
