import React, { useCallback } from 'react';
import { usePlanMigration } from 'src/modules/Plans/hooks';
import { isPlanArchived, isPlanExecuting } from 'src/modules/Plans/utils';
import { getVMMigrationStatus } from 'src/modules/Plans/views/details/tabs/VirtualMachines/Migration/MigrationVirtualMachinesList';
import { PlanVMsDeleteModal } from 'src/modules/Plans/views/details/tabs/VirtualMachines/modals/PlanVMsDeleteModal';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DropdownItem } from '@patternfly/react-core/deprecated';

import { MigrationVMsCancelModal } from '../modals/MigrationVMsCancelModal';
import { PlanData, VMData } from '../types';

export const VirtualMachinesActionsDropdownItems = ({
  planData,
  vmData,
}: VirtualMachinesActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const { plan } = planData;
  const { specVM, statusVM } = vmData;
  const [lastMigration] = usePlanMigration(plan);
  const selectedVm = plan?.status?.migration?.vms?.find((vm) => vm.id === specVM?.id);

  const isExecuting = isPlanExecuting(plan);
  const isArchived = isPlanArchived(plan);
  const vmMigrated = getVMMigrationStatus(selectedVm) === 'Succeeded';
  const lastVm = plan?.spec?.vms?.length === 1;

  const canSelectWhenExecuting = statusVM?.completed === undefined && isExecuting;
  const canSelectWhenNotExecuting =
    (statusVM?.started === undefined || statusVM?.error !== undefined) && !isExecuting;

  const getRemoveTooltip = () => {
    if (isExecuting) {
      return t('Cannot remove virtual machine while the plan is running.');
    }
    if (isArchived) {
      return t('Removing virtual machines from an archived migration plan is not allowed.');
    }
    if (vmMigrated) {
      return t('Cannot remove an already migrated VM.');
    }
    if (lastVm) {
      return t('Removing all virtual machines from a migration plan is not allowed.');
    }
    return null;
  };

  const getCancelTooltip = () => {
    if (!isExecuting) {
      return t('Migration plan has to be running.');
    }
    if (isArchived) {
      return t('Cancelling virtual machines from an archived migration plan is not allowed.');
    }
    if (vmMigrated) {
      return t('Cannot cancel an already migrated VM.');
    }
    if (!(canSelectWhenExecuting || canSelectWhenNotExecuting)) {
      return t('This VM is not in a cancellable state.');
    }
    return null;
  };

  const isRemoveDisabled = isExecuting || isArchived || vmMigrated || lastVm;
  const isCancelDisabled =
    !isExecuting ||
    isArchived ||
    vmMigrated ||
    !(canSelectWhenExecuting || canSelectWhenNotExecuting);

  const onRemoveClick = useCallback(
    () => showModal(<PlanVMsDeleteModal plan={plan} selected={[specVM?.id]} />),
    [plan, specVM?.id],
  );

  const onCancelClick = useCallback(
    () => showModal(<MigrationVMsCancelModal migration={lastMigration} selected={[specVM?.id]} />),
    [lastMigration, specVM?.id],
  );

  return [
    <DropdownItem
      key="remove"
      isAriaDisabled={isRemoveDisabled}
      onClick={onRemoveClick}
      tooltip={getRemoveTooltip()}
    >
      {t('Remove virtual machine')}
    </DropdownItem>,
    <DropdownItem
      key="cancel"
      isAriaDisabled={isCancelDisabled}
      onClick={onCancelClick}
      tooltip={getCancelTooltip()}
    >
      {t('Cancel migration')}
    </DropdownItem>,
  ];
};

interface VirtualMachinesActionsDropdownItemsProps {
  planData: PlanData;
  vmData: VMData;
}
