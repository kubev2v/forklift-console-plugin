import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import Select from '@components/common/Select';
import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import type { AccessMode, TargetStorage } from '@utils/storage/types';

const ACCESS_MODE_OPTIONS: { label: string; value: AccessMode }[] = [
  { label: 'ReadWriteOnce', value: 'ReadWriteOnce' },
  { label: 'ReadWriteMany', value: 'ReadWriteMany' },
  { label: 'ReadOnlyMany', value: 'ReadOnlyMany' },
];

// cspell:disable-next-line
const RWX_CAPABLE_PROVISIONER_PATTERNS = ['rbd.csi.ceph.com', 'cephfs.csi.ceph.com'];

const isRwxCapableProvisioner = (provisioner: string): boolean =>
  RWX_CAPABLE_PROVISIONER_PATTERNS.some((pattern) => provisioner.includes(pattern));

type AccessModeFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
  targetStorageFieldId: string;
};

const AccessModeField: FC<AccessModeFieldProps> = ({
  fieldId,
  targetStorageFieldId,
  targetStorages,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext();
  const { t } = useForkliftTranslation();

  const accessMode = useWatch({ control, name: fieldId }) as AccessMode | undefined;
  const targetStorageValue = useWatch({ control, name: targetStorageFieldId }) as
    | { name?: string }
    | string
    | undefined;

  const selectedProvisioner = targetStorages.find(
    (storage) =>
      storage.name ===
      (typeof targetStorageValue === 'object' ? targetStorageValue?.name : targetStorageValue),
  )?.provisioner;

  const showRwoWarning =
    (!accessMode || accessMode === 'ReadWriteOnce') &&
    Boolean(selectedProvisioner) &&
    isRwxCapableProvisioner(selectedProvisioner!);

  return (
    <div>
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={fieldId}
            options={ACCESS_MODE_OPTIONS.map(({ label, value }) => ({ label: t(label), value }))}
            onSelect={async (_, value) => {
              field.onChange(value as AccessMode);
              await trigger();
            }}
            placeholder={t('Select access mode')}
            isDisabled={isSubmitting}
            value={(field.value as AccessMode | undefined) ?? 'ReadWriteOnce'}
          />
        )}
      />
      {showRwoWarning && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="warning">
              {t(
                'ReadWriteOnce may prevent Live Migration. This storage class supports ReadWriteMany.',
              )}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </div>
  );
};

export default AccessModeField;
