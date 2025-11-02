import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { AlertGroup, PageSection } from '@patternfly/react-core';

import { PlanStatuses } from '../../../PlanStatus/utils/types';
import usePlanAlerts from '../../hooks/usePlanAlerts';
import PlanCriticalAlert from '../PlanCriticalAlert';
import PlanPreserveIPWarningsAlerts from '../PlanPreserveIPWarningsAlerts';

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
    preserveIPWarningsConditions,
    showCriticalCondition,
    showPreserveIPWarningsConditions,
    sourceNetworks,
    sourceStorages,
    status,
    storageMaps,
  } = usePlanAlerts(plan);

  const alertsNotRelevant = status === PlanStatuses.Completed || status === PlanStatuses.Archived;

  if (alertsNotRelevant || !networkMapsLoaded || networkMapsError) {
    return null;
  }

  if (!showCriticalCondition && !showPreserveIPWarningsConditions) {
    return null;
  }

  return (
    <PageSection hasBodyWrapper={false} className="plan-header-alerts">
      <AlertGroup>
        {showCriticalCondition && (
          <PlanCriticalAlert
            plan={plan}
            condition={criticalCondition}
            storageMaps={storageMaps}
            networkMaps={networkMaps}
            sourceStorages={sourceStorages}
            sourceNetworks={sourceNetworks}
          />
        )}
        {showPreserveIPWarningsConditions && (
          <PlanPreserveIPWarningsAlerts plan={plan} conditions={preserveIPWarningsConditions} />
        )}
      </AlertGroup>
    </PageSection>
  );
};

export default PlanAlerts;
