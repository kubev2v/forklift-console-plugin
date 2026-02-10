import { type FC, useState } from 'react';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import PlanConcernsDrawer from './components/PlanConcernsPanel/PlanConcernsDrawer';
import PlanPageHeader from './components/PlanPageHeader/PlanPageHeader';
import usePlanPages from './hooks/usePlanPages';
import type { PlanPageProps } from './utils/types';

import './PlanDetailsNav.scss';

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
        <div className="forklift-details-page-layout">
          <PlanPageHeader
            name={name}
            namespace={namespace}
            setShowPlanConcernsPanel={setShowPlanConcernsPanel}
          />
          <div className="forklift-details-page-layout__content">
            <HorizontalNav pages={pages} />
          </div>
        </div>
      </PlanConcernsDrawer>
    </LearningExperienceDrawer>
  );
};

export default PlanDetailsNav;
