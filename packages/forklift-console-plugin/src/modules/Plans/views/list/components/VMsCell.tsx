import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import { CellProps } from './CellProps';

export const VMsCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const plan = data?.obj;
  const specVms = plan?.spec?.vms;

  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
  });

  return (
    <Link to={`${planURL}/vms`}>
      <Split>
        <SplitItem className="forklift-overview__controller-card__status-icon">
          <VirtualMachineIcon />
        </SplitItem>
        <SplitItem>
          {t('{{total}} VM', { count: specVms?.length, total: specVms?.length })}
        </SplitItem>
      </Split>
    </Link>
  );
};
