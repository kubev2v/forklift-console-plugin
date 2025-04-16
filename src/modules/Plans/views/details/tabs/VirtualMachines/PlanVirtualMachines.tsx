import type { FC } from 'react';
import {
  canPlanReStart,
  isPlanExecuting,
  isPlanSucceeded,
} from 'src/modules/Plans/utils/helpers/getPlanPhase';
import type { PlanData } from 'src/modules/Plans/utils/types/PlanData';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import usePlanSourceProvider from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import Suspend from '@components/Suspend';
import {
  PlanModel,
  PlanModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationVirtualMachinesList } from './Migration/MigrationVirtualMachinesList';
import { PlanVirtualMachinesList } from './Plan/PlanVirtualMachinesList';

type PlanVirtualMachinesProps = {
  planData: PlanData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
  sourceProvider?: V1beta1Provider;
};

const PlanVirtualMachines_: FC<PlanVirtualMachinesProps> = (props) => {
  const plan = props?.planData.plan;

  if (isPlanExecuting(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else if (isPlanSucceeded(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else if (canPlanReStart(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  }
  return <PlanVirtualMachinesList {...props} />;
};

export const PlanVirtualMachines: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [plan, planLoaded, planLoadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({ model: PlanModel, namespace });
  const [sourceProvider] = usePlanSourceProvider(plan, namespace);

  const data = { permissions, plan };

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
