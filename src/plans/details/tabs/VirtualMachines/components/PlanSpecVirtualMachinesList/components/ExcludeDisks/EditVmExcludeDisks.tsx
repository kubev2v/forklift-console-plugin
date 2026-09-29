import { useCallback, useMemo, useState } from 'react';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import {
  areExcludeDiskSelectionsEqual,
  wouldExcludeAllDisks,
} from 'src/plans/utils/excludeDisks/excludeDiskSelection';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  HelperText,
  HelperTextItem,
  ModalVariant,
  Stack,
} from '@patternfly/react-core';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import { buildExcludeDiskRows, getSelectableBusAddressesFromRows } from './buildExcludeDiskRows';
import ExcludeDisksSelectTable from './ExcludeDisksSelectTable';
import { onConfirmVmExcludeDisks } from './utils';

export type EditVmExcludeDisksProps = EditPlanProps & {
  index: number;
};

const EditVmExcludeDisks: OverlayComponent<EditVmExcludeDisksProps> = ({
  closeOverlay,
  index,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const {
    loaded: providerLoaded,
    loadError: providerLoadError,
    sourceProvider,
  } = usePlanSourceProvider(resource);
  const vm = getPlanVirtualMachines(resource)[index] as EnhancedPlanSpecVms | undefined;
  const specExcluded = useMemo((): string[] => {
    const planVm = getPlanVirtualMachines(resource)[index] as EnhancedPlanSpecVms | undefined;
    return getVmExcludeDisks(planVm) ?? [];
  }, [resource, index]);
  const [selected, setSelected] = useState<string[]>(() => getVmExcludeDisks(vm) ?? []);

  const [inventoryVms, inventoryLoading, inventoryError] = useInventoryVms(
    { provider: sourceProvider },
    providerLoaded,
    providerLoadError,
  );

  const inventoryVm = useMemo(() => {
    const planVmId = vm?.id;
    if (planVmId) {
      const byId = inventoryVms.find((entry) => entry.vm.id === planVmId);
      if (byId) {
        return byId;
      }
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

  const excludesAllDisks = wouldExcludeAllDisks(selected, selectableAddresses);

  const rootDisk = vm?.rootDisk;
  const showsRootDiskWarning = Boolean(rootDisk) && selected.includes(rootDisk);

  const handleSelect = useCallback((selectedIds: string[]) => {
    setSelected(selectedIds);
  }, []);

  const isInventoryLoading = !providerLoaded || Boolean(providerLoadError) || inventoryLoading;

  return (
    <ModalForm
      className="edit-vm-exclude-disks-modal"
      closeOverlay={closeOverlay}
      confirmLabel={t('Save excluded disks')}
      isDisabled={areExcludeDiskSelectionsEqual(selected, specExcluded) || excludesAllDisks}
      onConfirm={async () => onConfirmVmExcludeDisks(index)({ newValue: selected, resource })}
      testId="edit-vm-exclude-disks-modal"
      title={t('Edit excluded disks')}
      variant={ModalVariant.large}
    >
      <Stack hasGutter>
        {t(
          'Select disks on {{vmName}} that should not be migrated. Excluded disks remain on the source vSphere VM. Selected disks will not be migrated.',
          { vmName: vm?.name ?? t('the selected VM') },
        )}
        {showsRootDiskWarning && (
          <Alert
            isInline
            title={t(
              'Excluding the disk that contains the guest OS may cause guest conversion to fail.',
            )}
            variant={AlertVariant.info}
          />
        )}
        <ExcludeDisksSelectTable
          isLoading={isInventoryLoading}
          loadError={inventoryError}
          onSelect={handleSelect}
          rows={rows}
          selectedIds={selected}
        />
        {inventoryError && (
          <HelperText>
            <HelperTextItem variant="error">
              {t('Unable to load disks from the source provider.')}
            </HelperTextItem>
          </HelperText>
        )}
        {excludesAllDisks && (
          <HelperText>
            <HelperTextItem variant="error">
              {selectableAddresses.length === 1
                ? t('This VM has only one disk; it cannot be excluded.')
                : t('At least one disk must remain for migration.')}
            </HelperTextItem>
          </HelperText>
        )}
      </Stack>
    </ModalForm>
  );
};

export default EditVmExcludeDisks;
