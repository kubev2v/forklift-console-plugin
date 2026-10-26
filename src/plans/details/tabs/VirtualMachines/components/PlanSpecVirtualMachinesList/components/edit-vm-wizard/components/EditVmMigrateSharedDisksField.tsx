import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { getMigrateSharedDisksValue } from 'src/plans/details/tabs/Details/components/SettingsSection/components/PlanMigrateSharedDisks/utils/utils';

import { Alert, AlertVariant, Radio, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useEditVmWizardContext } from '../EditVmWizardContext';
import type { EditVmWizardFormValues } from '../types';

const EditVmMigrateSharedDisksField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<EditVmWizardFormValues>();
  const { plan } = useEditVmWizardContext();
  const { sourceProvider } = usePlanSourceProvider(plan);
  const isVddkInitImageNotSet = isEmpty(sourceProvider?.spec?.settings?.vddkInitImage);
  const planValue = getMigrateSharedDisksValue(plan);

  const sharedDisksSlowdownAlert = (
    <Alert
      className="pf-v6-u-mt-sm pf-v6-u-ml-lg"
      isInline
      isPlain
      title={t('This may slow down the migration process')}
      variant={AlertVariant.info}
    />
  );

  return (
    <Controller
      control={control}
      name="migrateSharedDisks"
      render={({ field: { onChange, value } }) => {
        const isInherit = value === undefined;
        const resolvedValue = value ?? planValue;

        return (
          <Stack hasGutter>
            <StackItem>
              <Radio
                data-testid="shared-disks-option-inherit"
                description={
                  planValue
                    ? t('Set to: Migrate shared disks')
                    : t('Set to: Do not migrate shared disks')
                }
                id="edit-vm-wizard-shared-disks-inherit"
                isChecked={isInherit}
                label={t('Inherit plan wide setting')}
                name="edit-vm-wizard-shared-disks-option"
                onChange={() => {
                  onChange(undefined);
                }}
              />
              {isInherit && planValue && sharedDisksSlowdownAlert}
              {isInherit && !planValue && isVddkInitImageNotSet && (
                <PlanVddkForSharedDisksWarningAlert />
              )}
            </StackItem>
            <StackItem>
              <Radio
                data-testid="shared-disks-option-enabled"
                id="edit-vm-wizard-shared-disks-enabled"
                isChecked={!isInherit && resolvedValue}
                label={t('Migrate shared disks')}
                name="edit-vm-wizard-shared-disks-option"
                onChange={() => {
                  onChange(true);
                }}
              />
              {!isInherit && resolvedValue && sharedDisksSlowdownAlert}
            </StackItem>
            <StackItem>
              <Radio
                data-testid="shared-disks-option-disabled"
                id="edit-vm-wizard-shared-disks-disabled"
                isChecked={!isInherit && !resolvedValue}
                label={t('Do not migrate shared disks')}
                name="edit-vm-wizard-shared-disks-option"
                onChange={() => {
                  onChange(false);
                }}
              />
              {!isInherit && !resolvedValue && isVddkInitImageNotSet && (
                <PlanVddkForSharedDisksWarningAlert />
              )}
            </StackItem>
          </Stack>
        );
      }}
    />
  );
};

export default EditVmMigrateSharedDisksField;
