import { type FC, useMemo } from 'react';
import { isPlanArchived } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@kubev2v/types';
import { ToolbarItem } from '@patternfly/react-core';

import { PlanVMsDeleteModal } from '../modals/PlanVMsDeleteModal';

import { VMsActionButton } from './VMsActionButton';

export const PlanVMsDeleteButton: FC<{
  selectedIds: string[];
  plan: V1beta1Plan;
}> = ({ plan, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onClick = () => {
    showModal(<PlanVMsDeleteModal plan={plan} selected={selectedIds} />);
  };

  const remainingVms = useMemo(() => {
    return (plan?.spec?.vms || []).filter((vm) => !selectedIds.includes(vm.id)) || [];
  }, [plan, selectedIds]);

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
    if (!remainingVms?.length) {
      return t(
        'All virtual machines planned for migration are selected for deletion, deleting all virtual machines from a migration plan is not allowed.',
      );
    }
    return '';
  }, [plan, selectedIds, remainingVms]);

  return (
    <ToolbarItem>
      <VMsActionButton onClick={onClick} disabledReason={reason}>
        {t('Delete virtual machines')}
      </VMsActionButton>
    </ToolbarItem>
  );
};
