import { useCallback, useMemo, useState } from 'react';
import usePlanSourceProvider from 'src/plans/details/hooks/usePlanSourceProvider';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import {
  areExcludeDiskSelectionsEqual,
  getExcludeDiskSelectOptions,
  getSelectableBusAddresses,
  wouldExcludeAllDisks,
} from 'src/plans/utils/excludeDisks/getExcludeDiskSelectOptions';
import { useInventoryVms } from 'src/utils/hooks/useInventoryVms';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import MultiTypeaheadSelect from '@components/common/TypeaheadSelect/MultiTypeaheadSelect/MultiTypeaheadSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  Form,
  HelperText,
  HelperTextItem,
  Stack,
} from '@patternfly/react-core';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

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
  const { sourceProvider } = usePlanSourceProvider(resource);
  const vm = getPlanVirtualMachines(resource)[index] as EnhancedPlanSpecVms | undefined;
  const specExcluded = useMemo((): string[] => {
    const planVm = getPlanVirtualMachines(resource)[index] as EnhancedPlanSpecVms | undefined;
    return getVmExcludeDisks(planVm) ?? [];
  }, [resource, index]);
  const [selected, setSelected] = useState<string[]>(() => getVmExcludeDisks(vm) ?? []);

  const [inventoryVms, inventoryLoaded, inventoryError] = useInventoryVms({
    provider: sourceProvider,
  });

  const inventoryVm = useMemo(
    () => inventoryVms.find((entry) => entry.vm.name === vm?.name),
    [inventoryVms, vm?.name],
  );

  const disks = (inventoryVm?.vm as { disks?: unknown[] } | undefined)?.disks;

  const options = useMemo(
    () =>
      getExcludeDiskSelectOptions({
        disks,
        existingExcludeDisks: specExcluded,
      }),
    [disks, specExcluded],
  );

  const selectableAddresses = useMemo(() => getSelectableBusAddresses(disks), [disks]);

  const excludesAllDisks = wouldExcludeAllDisks(selected, selectableAddresses);

  const rootDisk = vm?.rootDisk;
  const showsRootDiskWarning = Boolean(rootDisk) && selected.includes(rootDisk);

  const handleChange = useCallback((values: (string | number)[]) => {
    setSelected(values.map(String));
  }, []);

  const inventoryUnavailable = !inventoryLoaded || Boolean(inventoryError);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Save excluded disks')}
      isDisabled={areExcludeDiskSelectionsEqual(selected, specExcluded) || excludesAllDisks}
      onConfirm={async () => onConfirmVmExcludeDisks(index)({ newValue: selected, resource })}
      testId="edit-vm-exclude-disks-modal"
      title={t('Edit excluded disks')}
    >
      <Stack hasGutter>
        {t(
          'Select disks on {{vmName}} that should not be migrated. Excluded disks remain on the source vSphere VM.',
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
        <Form>
          <FormGroupWithHelpText
            helperText={t(
              'Use vSphere bus addresses (for example, scsi0:1). At least one disk must still be migrated.',
            )}
            isRequired={false}
            label={t('Excluded disks')}
          >
            <MultiTypeaheadSelect
              isDisabled={inventoryUnavailable}
              onChange={handleChange}
              options={options}
              placeholder={t('Select disks to exclude')}
              testId="exclude-disks-select"
              values={selected}
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
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditVmExcludeDisks;
