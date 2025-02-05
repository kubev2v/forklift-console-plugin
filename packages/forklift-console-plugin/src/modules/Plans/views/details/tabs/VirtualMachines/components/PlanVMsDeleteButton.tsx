import React, { FC, useMemo } from 'react';
import { isPlanArchived } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan } from '@kubev2v/types';
import { Button, ToolbarItem, Tooltip } from '@patternfly/react-core';

import { PlanVMsDeleteModal } from '../modals';

export const PlanVMsDeleteButton: FC<{
  selectedIds: string[];
  plan: V1beta1Plan;
}> = ({ selectedIds, plan }) => {
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
    if (!!selectedIds?.length) {
      return t('Select at least one virtual machine.');
    }
    if (!!remainingVms.length) {
      return t(
        'All virtual machines planned for migration are selected for deletion, deleting all virtual machines from a migration plan is not allowed.',
      );
    }
    return reason;
  }, [plan, selectedIds, remainingVms]);

  const button = (
    <Button variant="secondary" onClick={onClick} isAriaDisabled={Boolean(reason)}>
      {t('Remove virtual machines')}
    </Button>
  );

  return (
    <ToolbarItem>{reason ? <Tooltip content={reason}>{button}</Tooltip> : button}</ToolbarItem>
  );
};
