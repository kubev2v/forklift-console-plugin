import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import PlanActionsDropdown from 'src/plans/actions/PlanActionsDropdown';
import PlanEditCutoverButton from 'src/plans/actions/PlanEditCutoverButton';

import { PlanModel } from '@forklift-ui/types';
import { ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';

import { usePlan } from '../../hooks/usePlan';
import PlanStatusLabel from '../PlanStatus/PlanStatusLabel';

import PlanAlerts from './components/PlanAlerts/PlanAlerts';

type PlanPageHeaderProps = {
  name: string;
  namespace: string;
  setShowPlanConcernsPanel?: (isOpen: boolean) => void;
};

const PlanPageHeader: FC<PlanPageHeaderProps> = ({ name, namespace, setShowPlanConcernsPanel }) => {
  const { plan } = usePlan(name, namespace);

  return (
    <PageHeadings
      model={PlanModel}
      obj={plan}
      namespace={namespace}
      testId="resource-details-title"
      status={<PlanStatusLabel plan={plan} />}
      actions={
        <Flex
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>
            <LearningExperienceButton />
          </FlexItem>
          <FlexItem>
            <PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />
          </FlexItem>
          <FlexItem>
            <PlanActionsDropdown plan={plan} />
          </FlexItem>
        </Flex>
      }
    >
      <PlanAlerts plan={plan} setIsDrawerOpen={setShowPlanConcernsPanel} />
    </PageHeadings>
  );
};

export default PlanPageHeader;
