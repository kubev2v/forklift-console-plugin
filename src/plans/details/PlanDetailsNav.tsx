import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import PlanPageHeader from './components/PlanPageHeader/PlanPageHeader';
import usePlanPages from './hooks/usePlanPages';
import type { PlanPageProps } from './utils/types';

import './PlanDetailsNav.scss';

const PlanDetailsNav: FC<PlanPageProps> = ({ name, namespace }) => {
  const pages = usePlanPages(name, namespace);

  return (
    <div className="forklift-details-page-layout">
      <ModalHOC>
        <PlanPageHeader name={name} namespace={namespace} />
      </ModalHOC>
      <div className="forklift-details-page-layout__content">
        <HorizontalNav pages={pages} />
      </div>
    </div>
  );
};

export default PlanDetailsNav;
