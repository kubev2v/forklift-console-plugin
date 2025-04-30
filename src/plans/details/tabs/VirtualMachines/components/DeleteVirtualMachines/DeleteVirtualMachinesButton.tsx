import { type FC, useMemo } from 'react';
import { isPlanArchived } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ToolbarItem } from '@patternfly/react-core';

import VMsActionButton from '../VMsActionButton';

import type { DeleteVirtualMachineProps } from './utils/types';
import DeleteVirtualMachinesModal from './DeleteVirtualMachinesModal';

const DeleteVirtualMachinesButton: FC<DeleteVirtualMachineProps> = ({ plan, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onClick = () => {
    showModal(<DeleteVirtualMachinesModal plan={plan} selectedIds={selectedIds} />);
  };

  const reason = useMemo(() => {
    if (isPlanArchived(plan)) {
      return t('Deleting virtual machines from an archived migration plan is not allowed.');
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
