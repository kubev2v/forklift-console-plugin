import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import type { CellProps } from './CellProps';

export const VMsCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const plan = data?.plan;
  const specVms = plan?.spec?.vms;

  const planURL = getResourceUrl({
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
    reference: PlanModelRef,
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
