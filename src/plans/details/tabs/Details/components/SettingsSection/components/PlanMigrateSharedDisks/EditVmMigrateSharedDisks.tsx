import { useState } from 'react';
import PlanVddkForSharedDisksWarningAlert from 'src/plans/components/PlanVddkForSharedDisksWarningAlert';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, Radio, Stack, StackItem } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import type { EditPlanProps } from '../../utils/types';

import {
  getMigrateSharedDisksValue,
  getVmMigrateSharedDisks,
  onConfirmVmMigrateSharedDisks,
} from './utils/utils';

export type EditVmMigrateSharedDisksProps = EditPlanProps & {
  index: number;
};

const EditVmMigrateSharedDisks: OverlayComponent<EditVmMigrateSharedDisksProps> = ({
  closeOverlay,
  index,
  resource,
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
      isInline
      isPlain
      title={t('This may slow down the migration process')}
      variant={AlertVariant.info}
    />
  );

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Save shared disks setting')}
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
      isDisabled={value === currentVmValue}
      onConfirm={async () => onConfirmVmMigrateSharedDisks(index)({ newValue: value, resource })}
      testId="edit-vm-shared-disks-modal"
      title={t('Edit shared disks')}
    >
      <Stack hasGutter>
        <StackItem>
          <Radio
            data-testid="shared-disks-option-inherit"
            description={
              planValue
                ? t('Set to: Migrate shared disks')
                : t('Set to: Do not migrate shared disks')
            }
            id="shared-disks-inherit"
            isChecked={isInherit}
            label={t('Inherit plan wide setting')}
            name="shared-disks-option"
            onChange={() => {
              setValue(undefined);
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
            id="shared-disks-enabled"
            isChecked={!isInherit && resolvedValue}
            label={t('Migrate shared disks')}
            name="shared-disks-option"
            onChange={() => {
              setValue(true);
            }}
          />
          {!isInherit && resolvedValue && sharedDisksSlowdownAlert}
        </StackItem>
        <StackItem>
          <Radio
            data-testid="shared-disks-option-disabled"
            id="shared-disks-disabled"
            isChecked={!isInherit && !resolvedValue}
            label={t('Do not migrate shared disks')}
            name="shared-disks-option"
            onChange={() => {
              setValue(false);
            }}
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
