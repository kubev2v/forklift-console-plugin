import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Split, SplitItem } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';

import type { PlanFieldProps } from '../utils/types';

const PlanVirtualMachines: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const planVMs = getPlanVirtualMachines(plan);

  const planURL = getPlanURL(plan);

  return (
    <Link to={`${planURL}/vms`}>
      <Split>
        <SplitItem className="forklift-overview__controller-card__status-icon">
          <VirtualMachineIcon />
        </SplitItem>
        <SplitItem>
          {t('{{total}} VM', {
            count: planVMs?.length,
            total: planVMs?.length,
          })}
        </SplitItem>
      </Split>
    </Link>
  );
};

export default PlanVirtualMachines;
