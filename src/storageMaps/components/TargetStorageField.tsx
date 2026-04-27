import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Select from '@components/common/Select';
import {
  Divider,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  SelectGroup,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { StorageMappingValue, StorageVendorProduct, TargetStorage } from '../utils/types';
import { resolveProductFromCsiProvisioner } from '../utils/vendorLookupTables';

type TargetStorageFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
  testId?: string;
  suggestedVendorProduct?: StorageVendorProduct;
};

const renderStorageOption = (storage: TargetStorage, t: (k: string) => string) => (
  <Split hasGutter>
    <SplitItem isFilled>{storage.name}</SplitItem>
    {storage.isNetAppShift && (
      <SplitItem>
        <Label isCompact color="blue">
          {t('NetApp Shift')}
        </Label>
      </SplitItem>
    )}
  </Split>
);

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

  const { others, recommended } = useMemo(() => {
    if (!suggestedVendorProduct) {
      return { others: targetStorages, recommended: [] };
    }

    const rec: TargetStorage[] = [];
    const oth: TargetStorage[] = [];

    for (const storage of targetStorages) {
      const resolved = storage.provisioner
        ? resolveProductFromCsiProvisioner(storage.provisioner)
        : undefined;

      if (resolved === suggestedVendorProduct) {
        rec.push(storage);
      } else {
        oth.push(storage);
      }
    }

    return { others: oth, recommended: rec };
  }, [suggestedVendorProduct, targetStorages]);

  const hasRecommended = !isEmpty(recommended);

  return (
    <div>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={fieldId}
            testId={testId}
            onSelect={async (_, value) => {
              field.onChange(value);
              await trigger();
            }}
            placeholder={t('Select target storage')}
            isDisabled={isSubmitting}
            value={(field.value as StorageMappingValue).name}
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
                      <SelectOption key="empty-other" isDisabled>
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
                  <SelectOption key="empty" isDisabled>
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
