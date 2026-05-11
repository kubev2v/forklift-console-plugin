import { type FC, useMemo } from 'react';
import { useSpecVirtualMachinesListData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/hooks/useSpecVirtualMachinesListData';
import {
  getCriticalConcernsVmsMap,
  getCriticalInspectionConcernsVmsMap,
  mergeConcernsMaps,
} from 'src/plans/details/utils/utils';

import type { V1beta1Plan } from '@forklift-ui/types';
import { PageSection } from '@patternfly/react-core';
import { getNamespace, getUID } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { useWatchConversions } from '@utils/hooks/useWatchConversions';

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

  const [conversions]: [V1beta1Conversion[], boolean, unknown] = useWatchConversions({
    namespace: getNamespace(plan) ?? '',
    selector: {
      matchLabels: {
        [CONVERSION_LABELS.CONVERSION_TYPE]: CONVERSION_TYPE.DEEP_INSPECTION,
        ...(getUID(plan) ? { [CONVERSION_LABELS.PLAN]: getUID(plan)! } : {}),
      },
    },
  });

  const mergedConcerns: Map<string, number> = useMemo(() => {
    const inventoryConcerns = getCriticalConcernsVmsMap(specVirtualMachinesListData);
    const inspectionConcerns = getCriticalInspectionConcernsVmsMap(conversions);
    return mergeConcernsMaps(inventoryConcerns, inspectionConcerns);
  }, [specVirtualMachinesListData, conversions]);

  const alertsNotRelevant = useMemo(
    () => status === PlanStatuses.Completed || status === PlanStatuses.Archived,
    [status],
  );

  if (alertsNotRelevant || !showCriticalConditions) return null;

  return (
    <PageSection hasBodyWrapper={false} className="plan-header-alerts">
      <PlanCriticalAlerts
        conditions={criticalConditions}
        concerns={mergedConcerns}
        setIsDrawerOpen={setIsDrawerOpen}
      />
    </PageSection>
  );
};

export default PlanAlerts;
