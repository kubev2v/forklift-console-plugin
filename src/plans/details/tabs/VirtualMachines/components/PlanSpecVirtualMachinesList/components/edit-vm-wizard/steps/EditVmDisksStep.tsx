import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { wouldExcludeAllDisks } from 'src/plans/utils/excludeDisks/excludeDiskSelection';

import WizardStepContainer from '@components/common/WizardStepContainer';
import {
  Alert,
  AlertVariant,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import EditVmExcludeDisksField from '../components/EditVmExcludeDisksField';
import EditVmMigrateSharedDisksField from '../components/EditVmMigrateSharedDisksField';
import EditVmWizardSubsectionTitle from '../components/EditVmWizardSubsectionTitle';
import {
  editVmWizardStepDescriptions,
  EditVmWizardStepId,
  editVmWizardStepNames,
} from '../constants';
import { useEditVmWizardContext } from '../EditVmWizardContext';
import type { EditVmWizardFormValues } from '../types';

const EditVmDisksStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { watch } = useFormContext<EditVmWizardFormValues>();
  const { diskLoadError, isDiskInventoryLoading, plan, rows, selectableDiskAddresses, vmIndex } =
    useEditVmWizardContext();
  const vm = getPlanVirtualMachines(plan)[vmIndex];
  const excludeDisks = watch('excludeDisks');

  const excludesAllDisks = wouldExcludeAllDisks(excludeDisks, selectableDiskAddresses);
  const rootDisk = vm?.rootDisk;
  const showsRootDiskWarning = rootDisk ? excludeDisks.includes(rootDisk) : false;

  return (
    <WizardStepContainer
      className="edit-vm-disks-step"
      compactTitleDescription
      description={editVmWizardStepDescriptions[EditVmWizardStepId.Disks]}
      isFullWidth
      testId="edit-vm-disks-step"
      title={editVmWizardStepNames[EditVmWizardStepId.Disks]}
    >
      <Stack hasGutter>
        <StackItem className="edit-vm-wizard-form-width">
          <EditVmWizardSubsectionTitle
            description={t(
              'Select disks that will not be migrated, but will remain on the source VM.',
            )}
            title={t('Excluded disks')}
          />
        </StackItem>
        {showsRootDiskWarning && (
          <StackItem className="edit-vm-wizard-form-width">
            <Alert
              isInline
              title={t(
                'Excluding the disk that contains the guest OS may cause guest conversion to fail.',
              )}
              variant={AlertVariant.info}
            />
          </StackItem>
        )}
        <StackItem className="edit-vm-disks-step__exclude-disks-table">
          <EditVmExcludeDisksField
            diskLoadError={diskLoadError}
            isInventoryLoading={isDiskInventoryLoading}
            rows={rows}
          />
        </StackItem>
        {diskLoadError && (
          <StackItem className="edit-vm-wizard-form-width">
            <HelperText>
              <HelperTextItem variant="error">
                {t('Unable to load disks from the source provider.')}
              </HelperTextItem>
            </HelperText>
          </StackItem>
        )}
        {excludesAllDisks && (
          <StackItem className="edit-vm-wizard-form-width">
            <HelperText>
              <HelperTextItem variant="error">
                {selectableDiskAddresses.length === 1
                  ? t('This VM has only one disk; it cannot be excluded.')
                  : t('At least one disk must remain for migration.')}
              </HelperTextItem>
            </HelperText>
          </StackItem>
        )}
        <StackItem className="edit-vm-wizard-form-width">
          <EditVmWizardSubsectionTitle
            description={t('Select whether to migrate shared disks for this VM.')}
            title={t('Shared disks')}
          />
        </StackItem>
        <StackItem className="edit-vm-wizard-form-width">
          <EditVmMigrateSharedDisksField />
        </StackItem>
      </Stack>
    </WizardStepContainer>
  );
};

export default EditVmDisksStep;
