import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import PlanActionsDropdown from 'src/plans/actions/PlanActionsDropdown';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { Level } from '@patternfly/react-core';

import PlanStatusLabel from '../PlanStatus/PlanStatusLabel';

import PlanAlerts from './components/PlanAlerts/PlanAlerts';

type PlanPageHeadingsProps = {
  plan: V1beta1Plan;
};

const PlanPageHeadings: FC<PlanPageHeadingsProps> = ({ plan }) => {
  return (
    <PageHeadings
      model={PlanModel}
      obj={plan}
      namespace={plan.metadata?.namespace}
      status={<PlanStatusLabel plan={plan} />}
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
