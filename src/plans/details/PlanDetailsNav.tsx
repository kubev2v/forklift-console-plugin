import { type FC, useState } from 'react';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import PlanConcernsDrawer from './components/PlanConcernsPanel/PlanConcernsDrawer';
import PlanPageHeader from './components/PlanPageHeader/PlanPageHeader';
import usePlanPages from './hooks/usePlanPages';
import type { PlanPageProps } from './utils/types';

const PlanDetailsNav: FC<PlanPageProps> = ({ name, namespace }) => {
  const pages = usePlanPages(name, namespace);
  const [showPlanConcernsPanel, setShowPlanConcernsPanel] = useState(false);

  return (
    <LearningExperienceDrawer>
      <PlanConcernsDrawer
        name={name}
        namespace={namespace}
        showPlanConcernsPanel={showPlanConcernsPanel}
        setShowPlanConcernsPanel={setShowPlanConcernsPanel}
      >
        <PlanPageHeader
          name={name}
          namespace={namespace}
          setShowPlanConcernsPanel={setShowPlanConcernsPanel}
        />
        <HorizontalNav pages={pages} />
      </PlanConcernsDrawer>
    </LearningExperienceDrawer>
  );
};

export default PlanDetailsNav;
