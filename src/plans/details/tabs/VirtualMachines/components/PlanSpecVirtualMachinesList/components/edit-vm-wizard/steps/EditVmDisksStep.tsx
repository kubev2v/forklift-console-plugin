import { type FC, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import { wouldExcludeAllDisks } from 'src/plans/utils/excludeDisks/excludeDiskSelection';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';

import WizardStepContainer from '@components/common/WizardStepContainer';
import {
  Alert,
  AlertVariant,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import {
  buildExcludeDiskRows,
  getSelectableBusAddressesFromRows,
} from '../../ExcludeDisks/buildExcludeDiskRows';
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
  const { plan, setSelectableDiskAddresses, vmIndex } = useEditVmWizardContext();
  const {
    loaded: providerLoaded,
    loadError: providerLoadError,
    sourceProvider,
  } = usePlanSourceProvider(plan);
  const vm = getPlanVirtualMachines(plan)[vmIndex];
  const excludeDisks = watch('excludeDisks');
  const specExcluded = useMemo(() => getVmExcludeDisks(vm) ?? [], [vm]);

  const [inventoryVms, inventoryLoading, inventoryError] = useInventoryVms(
    { provider: sourceProvider },
    providerLoaded,
    providerLoadError,
  );

  const inventoryVm = useMemo(() => {
    const planVmId = vm?.id;
    if (planVmId) {
      return inventoryVms.find((entry) => entry.vm.id === planVmId);
    }

    return inventoryVms.find((entry) => entry.vm.name === vm?.name);
  }, [inventoryVms, vm?.id, vm?.name]);

  const disks = (inventoryVm?.vm as { disks?: unknown[] } | undefined)?.disks;

  const rows = useMemo(
    () =>
      buildExcludeDiskRows({
        disks,
        existingExcludeDisks: specExcluded,
      }),
    [disks, specExcluded],
  );

  const selectableAddresses = useMemo(() => getSelectableBusAddressesFromRows(rows), [rows]);

  useEffect(() => {
    setSelectableDiskAddresses(selectableAddresses);
  }, [selectableAddresses, setSelectableDiskAddresses]);

  const excludesAllDisks = wouldExcludeAllDisks(excludeDisks, selectableAddresses);
  const diskLoadError = providerLoadError ?? inventoryError;
  const isInventoryLoading = !providerLoaded || inventoryLoading;
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
              'Selected disks will not be migrated, but will remain on the source VM.',
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
            isInventoryLoading={isInventoryLoading}
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
                {selectableAddresses.length === 1
                  ? t('This VM has only one disk; it cannot be excluded.')
                  : t('At least one disk must remain for migration.')}
              </HelperTextItem>
            </HelperText>
          </StackItem>
        )}
        <StackItem className="edit-vm-wizard-form-width">
          <EditVmWizardSubsectionTitle
            description={t('Choose whether to migrate shared disks for this VM.')}
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
