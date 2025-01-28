import React, { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan } from '@kubev2v/types';
import { Button, Tooltip } from '@patternfly/react-core';

import { PlanVMsEditModal } from '../modals';

export const PlanVMsEditButton: FC<{
  plan: V1beta1Plan;
}> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const planEditable = isPlanEditable(plan);

  const onClick = () => {
    showModal(<PlanVMsEditModal plan={plan} editAction="VMS" />);
  };

  return !planEditable ? (
    <Tooltip
      content={t(
        'The edit virtual machines button is disabled when the plan status does not enable editing.',
      )}
    >
      <Button variant="secondary" onClick={onClick} isAriaDisabled>
        {t('Edit virtual machines')}
      </Button>
    </Tooltip>
  ) : (
    <Button variant="secondary" onClick={onClick}>
      {t('Edit virtual machines')}
    </Button>
  );
};
