import type { FC } from 'react';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';

import type { V1beta1Plan } from '@kubev2v/types';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

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
    planPhase,
    sourceNetworks,
    sourceStorages,
    storageMaps,
  } = usePlanAlerts(plan);

  const alertsNotRelevant = planPhase === PlanPhase.Succeeded || planPhase === PlanPhase.Archived;

  if (alertsNotRelevant || !criticalCondition || !networkMapsLoaded || networkMapsError) {
    return null;
  }

  return (
    <PageSection variant={PageSectionVariants.light} className="plan-header-alerts">
      {criticalCondition && (
        <PlanCriticalCondition
          plan={plan}
          condition={criticalCondition}
          storageMaps={storageMaps}
          networkMaps={networkMaps}
          sourceStorages={sourceStorages}
          sourceNetworks={sourceNetworks}
        />
      )}

      <PlanPreserveIPWarning
        plan={plan}
        networkMaps={networkMaps}
        loaded={networkMapsLoaded}
        error={networkMapsError}
      />
    </PageSection>
  );
};

export default PlanAlerts;
