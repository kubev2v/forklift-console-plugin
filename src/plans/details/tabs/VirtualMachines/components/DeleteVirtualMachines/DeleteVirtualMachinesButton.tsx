import { type FC, useMemo } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { ToolbarItem } from '@patternfly/react-core';

import VMsActionButton from '../VMsActionButton';

import type { DeleteVirtualMachineProps } from './utils/types';
import DeleteVirtualMachinesModal from './DeleteVirtualMachinesModal';

const DeleteVirtualMachinesButton: FC<DeleteVirtualMachineProps> = ({ plan, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const onClick = () => {
    launcher<DeleteVirtualMachineProps>(DeleteVirtualMachinesModal, { plan, selectedIds });
  };

  const reason = useMemo(() => {
    if (!isPlanEditable(plan)) {
      return t('The migration plan is not editable.');
    }
    if (plan?.spec?.vms.length === 1) {
      return t('Deleting all virtual machines from a migration plan is not allowed.');
    }
    if (!selectedIds?.length) {
      return t('Select at least one virtual machine.');
    }

    const remainingVms = (plan?.spec?.vms ?? []).filter((vm) => !selectedIds.includes(vm.id!));
    if (!remainingVms?.length) {
      return t(
        'All virtual machines planned for migration are selected for deletion, deleting all virtual machines from a migration plan is not allowed.',
      );
    }
    return null;
  }, [plan, selectedIds, t]);

  return (
    <ToolbarItem>
      <VMsActionButton onClick={onClick} disabledReason={reason}>
        {t('Delete virtual machines')}
      </VMsActionButton>
    </ToolbarItem>
  );
};

export default DeleteVirtualMachinesButton;
