import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import { FormGroup } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, storageMapFieldLabels } from '../../constants';
import { useStorageVendorProducts } from '../../hooks/useStorageVendorProducts';
import { getVendorProductLabel } from '../../utils/labelHelpers';

type StorageProductFieldProps = { fieldId: string };

const StorageProductField: FC<StorageProductFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const { loading, storageVendorProducts } = useStorageVendorProducts();

  const options = useMemo(
    () =>
      storageVendorProducts.map((product) => ({
        label: getVendorProductLabel(product),
        value: product,
      })),
    [storageVendorProducts],
  );

  return (
    <FormGroup
      fieldId={fieldId}
      label={storageMapFieldLabels[StorageMapFieldId.StorageProduct]}
      labelHelp={
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
            isDisabled={isSubmitting || loading}
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
