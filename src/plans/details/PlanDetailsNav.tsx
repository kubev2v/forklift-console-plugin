import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import PlanPageHeader from './components/PlanPageHeader/PlanPageHeader';
import usePlanPages from './hooks/usePlanPages';
import type { PlanPageProps } from './utils/types';

const PlanDetailsNav: FC<PlanPageProps> = ({ name, namespace }) => {
  const pages = usePlanPages(name, namespace);

  return (
    <>
      <ModalHOC>
        <PlanPageHeader name={name} namespace={namespace} />
      </ModalHOC>
      <HorizontalNav pages={pages} />
    </>
  );
};

export default PlanDetailsNav;
