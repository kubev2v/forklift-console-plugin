import type { FC } from 'react';
import TipsAndTricksDrawer from 'src/onlineHelp/tipsAndTricksDrawer/TipsAndTricksDrawer';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import PlanPageHeader from './components/PlanPageHeader/PlanPageHeader';
import usePlanPages from './hooks/usePlanPages';
import type { PlanPageProps } from './utils/types';

const PlanDetailsNav: FC<PlanPageProps> = ({ name, namespace }) => {
  const pages = usePlanPages(name, namespace);

  return (
    <TipsAndTricksDrawer>
      <PlanPageHeader name={name} namespace={namespace} />
      <HorizontalNav pages={pages} />
    </TipsAndTricksDrawer>
  );
};

export default PlanDetailsNav;
