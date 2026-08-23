import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from '@components/common/Select';
import {
  Divider,
  FormHelperText,
  HelperText,
  HelperTextItem,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { TargetStorage } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import type { StorageVendorProduct } from '../utils/types';
import { resolveProductFromCsiProvisioner } from '../utils/vendorLookupTables';

import { partitionTargetStoragesByVendor, renderStorageOption } from './targetStorageFieldUtils';

type TargetStorageFieldProps = {
  fieldId: string;
  suggestedVendorProduct?: StorageVendorProduct;
  targetStorages: TargetStorage[];
  testId?: string;
};

const TargetStorageField: FC<TargetStorageFieldProps> = ({
  fieldId,
  suggestedVendorProduct,
  targetStorages,
  testId,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext();
  const { t } = useForkliftTranslation();

  const { others, recommended } = useMemo(
    () =>
      partitionTargetStoragesByVendor(
        targetStorages,
        suggestedVendorProduct,
        resolveProductFromCsiProvisioner,
      ),
    [suggestedVendorProduct, targetStorages],
  );

  const hasRecommended = !isEmpty(recommended);

  return (
    <div>
      <Controller
        control={control}
        name={fieldId}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting}
            onSelect={async (_, value) => {
              field.onChange(value);
              await trigger();
            }}
            placeholder={t('Select target storage')}
            ref={field.ref}
            testId={testId}
            value={(field.value as MappingValue).name}
          >
            {hasRecommended ? (
              <>
                <SelectGroup label={t('Recommended (same vendor)')}>
                  <SelectList>
                    {recommended.map((storage) => (
                      <SelectOption key={storage.id} value={storage}>
                        {renderStorageOption(storage, t)}
                      </SelectOption>
                    ))}
                  </SelectList>
                </SelectGroup>
                <Divider component="li" />
                <SelectGroup label={t('Other options')}>
                  <SelectList>
                    {isEmpty(others) ? (
                      <SelectOption isDisabled key="empty-other">
                        {t('No other storage classes available')}
                      </SelectOption>
                    ) : (
                      others.map((storage) => (
                        <SelectOption key={storage.id} value={storage}>
                          {renderStorageOption(storage, t)}
                        </SelectOption>
                      ))
                    )}
                  </SelectList>
                </SelectGroup>
              </>
            ) : (
              <SelectList>
                {isEmpty(targetStorages) ? (
                  <SelectOption isDisabled key="empty">
                    {t('Select a target provider and project to list available target storages')}
                  </SelectOption>
                ) : (
                  targetStorages.map((storage) => (
                    <SelectOption key={storage.id} value={storage}>
                      {renderStorageOption(storage, t)}
                    </SelectOption>
                  ))
                )}
              </SelectList>
            )}
          </Select>
        )}
      />
      {hasRecommended && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              {t('Recommended options match the vendor of the selected source storage.')}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </div>
  );
};

export default TargetStorageField;
