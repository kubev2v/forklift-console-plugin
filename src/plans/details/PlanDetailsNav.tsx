import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import LoadingSuspend from '@components/LoadingSuspend';
import { PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import PlanPageHeader from './components/PlanPageHeader/PlanPageHeader';
import usePlanPages from './hooks/usePlanPages';

type PlanDetailsNavProps = {
  name: string;
  namespace: string;
};

const PlanDetailsNav: FC<PlanDetailsNavProps> = ({ name, namespace }) => {
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const pages = usePlanPages(plan);

  return (
    <LoadingSuspend obj={plan} loaded={loaded} loadError={loadError}>
      <ModalHOC>
        <PlanPageHeader plan={plan} />
      </ModalHOC>
      <HorizontalNav pages={pages} />
    </LoadingSuspend>
  );
};

export default PlanDetailsNav;
