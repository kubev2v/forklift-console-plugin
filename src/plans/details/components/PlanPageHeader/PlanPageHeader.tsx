import type { FC } from 'react';
import PlanActionsDropdown from 'src/modules/Plans/actions/PlanActionsDropdown';
import { getPlanPhase } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { Level } from '@patternfly/react-core';

import PlanAlerts from './components/PlanAlerts/PlanAlerts';

type PlanPageHeadingsProps = {
  plan: V1beta1Plan;
};

const PlanPageHeadings: FC<PlanPageHeadingsProps> = ({ plan }) => {
  const planPhase = getPlanPhase({ plan });

  return (
    <PageHeadings
      model={PlanModel}
      obj={plan}
      namespace={plan.metadata?.namespace}
      status={planPhase}
      actions={
        <Level hasGutter>
          <ModalHOC>
            <PlanActionsDropdown plan={plan} />
          </ModalHOC>
        </Level>
      }
    >
      <PlanAlerts plan={plan} />
    </PageHeadings>
  );
};

export default PlanPageHeadings;
