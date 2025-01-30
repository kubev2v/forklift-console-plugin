import React, { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

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

  return (
    <ToolbarItem>
      <Button variant="secondary" onClick={onClick} isDisabled={selectedIds?.length < 1}>
        {t('Remove virtual machines')}
      </Button>
    </ToolbarItem>
  );
};
