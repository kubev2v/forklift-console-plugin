import React from 'react';
import { canPlanReStart, isPlanExecuting, isPlanSucceeded } from 'src/modules/Plans/utils';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import usePlanSourceProvider from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { ModalHOC } from 'src/modules/Providers/modals';

import {
  PlanModel,
  PlanModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { Suspend } from '../../components';

import { MigrationVirtualMachinesList } from './Migration';
import { PlanVirtualMachinesList } from './Plan';
import type { PlanData } from './types';

export type PlanVirtualMachinesProps = {
  obj: PlanData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
  sourceProvider?: V1beta1Provider;
};

const PlanVirtualMachines_: React.FC<PlanVirtualMachinesProps> = (props) => {
  const plan = props?.obj.plan;

  if (isPlanExecuting(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else if (isPlanSucceeded(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  } else if (canPlanReStart(plan)) {
    return <MigrationVirtualMachinesList {...props} />;
  }
  return <PlanVirtualMachinesList {...props} />;
};

export const PlanVirtualMachines: React.FC<{ name: string; namespace: string }> = ({
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
          obj={data}
          loaded={planLoaded}
          loadError={planLoadError}
          sourceProvider={sourceProvider}
        />
      </Suspend>
    </ModalHOC>
  );
};
