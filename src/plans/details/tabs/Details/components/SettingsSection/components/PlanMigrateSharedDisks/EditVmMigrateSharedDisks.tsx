import { useState } from 'react';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import type { EnhancedPlanSpecVms } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, Radio, Stack, StackItem } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import {
  getMigrateSharedDisksValue,
  getVmMigrateSharedDisks,
  onConfirmVmMigrateSharedDisks,
} from './utils/utils';

export type EditVmMigrateSharedDisksProps = EditPlanProps & {
  index: number;
};

const EditVmMigrateSharedDisks: ModalComponent<EditVmMigrateSharedDisksProps> = ({
  index,
  resource,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const { sourceProvider } = usePlanSourceProvider(resource);
  const isVddkInitImageNotSet = isEmpty(sourceProvider?.spec?.settings?.vddkInitImage);
  const vm = getPlanVirtualMachines(resource)[index] as EnhancedPlanSpecVms | undefined;
  const currentVmValue = getVmMigrateSharedDisks(vm);
  const planValue = getMigrateSharedDisksValue(resource);

  const [value, setValue] = useState<boolean | undefined>(currentVmValue);

  const isInherit = value === undefined;
  const resolvedValue = value ?? planValue;

  const sharedDisksSlowdownAlert = (
    <Alert
      className="pf-v6-u-mt-sm pf-v6-u-ml-lg"
      isPlain
      isInline
      variant={AlertVariant.info}
      title={t('This may slow down the migration process')}
    />
  );

  return (
    <ModalForm
      title={t('Edit shared disks')}
      description={t(
        'Choose whether to migrate shared disks for {{vmName}}. Changing this will override the plan wide setting for only this VM.',
        { vmName: vm?.name ?? t('selected') },
      )}
      headerHelp={
        <HelpIconPopover header={t('Migrate shared disks')}>
          {t(
            'When set, the VM-level value takes precedence over the plan setting. Select "Inherit plan wide setting" to use the plan value.',
          )}
        </HelpIconPopover>
      }
      confirmLabel={t('Save shared disks setting')}
      onConfirm={async () => onConfirmVmMigrateSharedDisks(index)({ newValue: value, resource })}
      isDisabled={value === currentVmValue}
      testId="edit-vm-shared-disks-modal"
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <Radio
            id="shared-disks-inherit"
            name="shared-disks-option"
            label={t('Inherit plan wide setting')}
            description={
              planValue
                ? t('Set to: Migrate shared disks')
                : t('Set to: Do not migrate shared disks')
            }
            isChecked={isInherit}
            onChange={() => {
              setValue(undefined);
            }}
            data-testid="shared-disks-option-inherit"
          />
          {isInherit && planValue && sharedDisksSlowdownAlert}
          {isInherit && !planValue && isVddkInitImageNotSet && (
            <PlanVddkForSharedDisksWarningAlert />
          )}
        </StackItem>
        <StackItem>
          <Radio
            id="shared-disks-enabled"
            name="shared-disks-option"
            label={t('Migrate shared disks')}
            isChecked={!isInherit && resolvedValue}
            onChange={() => {
              setValue(true);
            }}
            data-testid="shared-disks-option-enabled"
          />
          {!isInherit && resolvedValue && sharedDisksSlowdownAlert}
        </StackItem>
        <StackItem>
          <Radio
            id="shared-disks-disabled"
            name="shared-disks-option"
            label={t('Do not migrate shared disks')}
            isChecked={!isInherit && !resolvedValue}
            onChange={() => {
              setValue(false);
            }}
            data-testid="shared-disks-option-disabled"
          />
          {!isInherit && !resolvedValue && isVddkInitImageNotSet && (
            <PlanVddkForSharedDisksWarningAlert />
          )}
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditVmMigrateSharedDisks;
