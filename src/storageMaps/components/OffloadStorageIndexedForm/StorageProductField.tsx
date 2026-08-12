import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import type { StorageVendorProduct } from 'src/storageMaps/utils/types';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import {
  Divider,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';

import { useStorageVendorProducts } from '../../hooks/useStorageVendorProducts';
import { getVendorProductLabel } from '../../utils/labelHelpers';

type StorageProductFieldProps = {
  fieldId: string;
  suggestedProduct?: StorageVendorProduct;
};

const StorageProductField: FC<StorageProductFieldProps> = ({ fieldId, suggestedProduct }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  const { loading, storageVendorProducts } = useStorageVendorProducts();

  const allOptions = useMemo(
    () =>
      storageVendorProducts.map((product) => ({
        label: getVendorProductLabel(product),
        value: product,
      })),
    [storageVendorProducts],
  );

  const { otherProducts, recommendedProducts } = useMemo(() => {
    if (!suggestedProduct) {
      return { otherProducts: storageVendorProducts, recommendedProducts: [] };
    }

    const recommended: string[] = [];
    const others: string[] = [];

    for (const product of storageVendorProducts) {
      if (product === (suggestedProduct as string)) {
        recommended.push(product);
      } else {
        others.push(product);
      }
    }

    return { otherProducts: others, recommendedProducts: recommended };
  }, [storageVendorProducts, suggestedProduct]);

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
        control={control}
        name={fieldId}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting || loading}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            options={allOptions}
            placeholder={t('Select storage product')}
            ref={field.ref}
            testId={fieldId}
            value={field.value}
          >
            {suggestedProduct ? (
              <>
                <SelectGroup label={t('Recommended')}>
                  <SelectList>
                    {recommendedProducts.map((product) => (
                      <SelectOption key={product} value={product}>
                        {getVendorProductLabel(product)}
                      </SelectOption>
                    ))}
                  </SelectList>
                </SelectGroup>
                <Divider component="li" />
                <SelectGroup label={t('Other options')}>
                  <SelectList>
                    {otherProducts.map((product) => (
                      <SelectOption key={product} value={product}>
                        {getVendorProductLabel(product)}
                      </SelectOption>
                    ))}
                  </SelectList>
                </SelectGroup>
              </>
            ) : (
              <SelectList>
                {storageVendorProducts.map((product) => (
                  <SelectOption key={product} value={product}>
                    {getVendorProductLabel(product)}
                  </SelectOption>
                ))}
              </SelectList>
            )}
          </Select>
        )}
      />
      {suggestedProduct && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              {t('Recommended options are based on the selected source datastore vendor.')}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default StorageProductField;
