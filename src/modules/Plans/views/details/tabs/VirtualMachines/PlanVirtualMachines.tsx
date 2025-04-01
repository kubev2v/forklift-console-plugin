import React from 'react';
import {
  canPlanReStart,
  isPlanExecuting,
  isPlanSucceeded,
} from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { PlanData } from 'src/modules/Plans/utils/types/PlanData';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import usePlanSourceProvider from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationVirtualMachinesList } from './Migration/MigrationVirtualMachinesList';
import { PlanVirtualMachinesList } from './Plan/PlanVirtualMachinesList';
import { Suspend } from '../../components/Suspend';

interface PlanVirtualMachinesProps {
  planData: PlanData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
  sourceProvider?: V1beta1Provider;
}

const PlanVirtualMachines_: React.FC<PlanVirtualMachinesProps> = (props) => {
  const plan = props?.planData.plan;

  if (isPlanExecuting(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else if (isPlanSucceeded(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else if (canPlanReStart(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else {
    return <PlanVirtualMachinesList {...props} />;
  }
};

export const PlanVirtualMachines: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [plan, planLoaded, planLoadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({ model: PlanModel, namespace });
  const [sourceProvider] = usePlanSourceProvider(plan, namespace);

  const data = { plan, permissions };

  return (
    <ModalHOC>
      <Suspend obj={plan} loaded={planLoaded} loadError={planLoadError}>
        <PlanVirtualMachines_
          planData={data}
          loaded={planLoaded}
          loadError={planLoadError}
          sourceProvider={sourceProvider}
        />
      </Suspend>
    </ModalHOC>
  );
};
