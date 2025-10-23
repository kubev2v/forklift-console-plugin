import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';

import { PlanStatuses } from '../../../PlanStatus/utils/types';
import usePlanAlerts from '../../hooks/usePlanAlerts';
import PlanCriticalCondition from '../PlanCriticalCondition';
import PlanPreserveIPWarning from '../PlanPreserveIPWarning';

import './PlanAlerts.scss';

type Props = {
  plan: V1beta1Plan;
};

const PlanAlerts: FC<Props> = ({ plan }) => {
  const {
    criticalCondition,
    networkMaps,
    networkMapsError,
    networkMapsLoaded,
    showCriticalCondition,
    showPreserveIPWarning,
    sourceNetworks,
    sourceStorages,
    status,
    storageMaps,
  } = usePlanAlerts(plan);

  const alertsNotRelevant = status === PlanStatuses.Completed || status === PlanStatuses.Archived;

  if (alertsNotRelevant || !networkMapsLoaded || networkMapsError) {
    return null;
  }

  if (!showCriticalCondition && !showPreserveIPWarning) {
    return null;
  }

  return (
    <PageSection hasBodyWrapper={false} className="plan-header-alerts">
      {showCriticalCondition && (
        <PlanCriticalCondition
          plan={plan}
          condition={criticalCondition}
          storageMaps={storageMaps}
          networkMaps={networkMaps}
          sourceStorages={sourceStorages}
          sourceNetworks={sourceNetworks}
        />
      )}
      {showPreserveIPWarning && <PlanPreserveIPWarning />}
    </PageSection>
  );
};

export default PlanAlerts;
