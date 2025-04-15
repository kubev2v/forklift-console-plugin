import type { FC } from 'react';

import Suspend from '@components/Suspend';
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
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      <PlanPageHeader plan={plan} />
      <HorizontalNav pages={pages} resource={plan} />
    </Suspend>
  );
};

export default PlanDetailsNav;
