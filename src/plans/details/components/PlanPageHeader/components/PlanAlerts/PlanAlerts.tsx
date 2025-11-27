import { type FC, useMemo } from 'react';
import { useSpecVirtualMachinesListData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/hooks/useSpecVirtualMachinesListData';
import { getCriticalConcernsVmsMap } from 'src/plans/details/utils/utils';

import type { V1beta1Plan } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';

import { PlanStatuses } from '../../../PlanStatus/utils/types';
import usePlanAlerts from '../../hooks/usePlanAlerts';
import PlanCriticalAlerts from '../PlanCriticalAlerts';

import './PlanAlerts.scss';

type Props = {
  plan: V1beta1Plan;
  setIsDrawerOpen?: (isOpen: boolean) => void;
};

const PlanAlerts: FC<Props> = ({ plan, setIsDrawerOpen }) => {
  const { criticalConditions, showCriticalConditions, status } = usePlanAlerts(plan);
  const [specVirtualMachinesListData] = useSpecVirtualMachinesListData(plan);
  const criticalConcerns = useMemo(
    () => getCriticalConcernsVmsMap(specVirtualMachinesListData),
    [specVirtualMachinesListData],
  );
  const alertsNotRelevant = useMemo(
    () => status === PlanStatuses.Completed || status === PlanStatuses.Archived,
    [status],
  );

  // criticalConcerns alone won't fail the migration plan
  if (alertsNotRelevant || !showCriticalConditions) return null;

  return (
    <PageSection hasBodyWrapper={false} className="plan-header-alerts">
      <PlanCriticalAlerts
        conditions={criticalConditions}
        concerns={criticalConcerns}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </PageSection>
  );
};

export default PlanAlerts;
