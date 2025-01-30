import React, { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Plan } from '@kubev2v/types';
import { Button } from '@patternfly/react-core';

import { PlanVMsEditModal } from '../modals';

export const PlanVMsEditButton: FC<{
  plan: V1beta1Plan;
}> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onClick = () => {
    showModal(<PlanVMsEditModal plan={plan} editAction="VMS" />);
  };

  return (
    <Button variant="secondary" onClick={onClick}>
      {t('Edit virtual machines')}
    </Button>
  );
};
