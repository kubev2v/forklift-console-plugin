import React, { FC } from 'react';
import { hasPlanEditable } from 'src/modules/Plans/views/details/utils/hasPlanEditable';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

import { PlanVMsEditModal } from '../modals';

export const PlanVMsEditButton: FC<{
  plan: V1beta1Plan;
}> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onClick = () => {
    showModal(<PlanVMsEditModal plan={plan} />);
  };

  return (
    <ToolbarItem>
      <Button variant="secondary" onClick={onClick} isDisabled={!hasPlanEditable(plan)}>
        {t('Edit virtual machines')}
      </Button>
    </ToolbarItem>
  );
};
