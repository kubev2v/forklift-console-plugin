import type { FC } from 'react';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import PlanActionsDropdown from 'src/plans/actions/PlanActionsDropdown';
import PlanEditCutoverButton from 'src/plans/actions/PlanEditCutoverButton';

import { PlanModel } from '@kubev2v/types';
import { ButtonVariant, Level, LevelItem } from '@patternfly/react-core';

import { usePlan } from '../../hooks/usePlan';
import PlanStatusLabel from '../PlanStatus/PlanStatusLabel';

import PlanAlerts from './components/PlanAlerts/PlanAlerts';

type PlanPageHeaderProps = {
  name: string;
  namespace: string;
};

const PlanPageHeader: FC<PlanPageHeaderProps> = ({ name, namespace }) => {
  const { plan } = usePlan(name, namespace);

  return (
    <PageHeadings
      model={PlanModel}
      obj={plan}
      namespace={namespace}
      testId="resource-details-title"
      status={<PlanStatusLabel plan={plan} />}
      actions={
        <Level hasGutter>
          <LevelItem>
            <PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />
          </LevelItem>
          <LevelItem>
            <PlanActionsDropdown plan={plan} />
          </LevelItem>
        </Level>
      }
    >
      <PlanAlerts plan={plan} />
    </PageHeadings>
  );
};

export default PlanPageHeader;
