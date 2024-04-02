import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { isPlanExecuting } from 'src/modules/Plans/utils';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';

import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { Suspend } from '../../components';

import { MigrationVirtualMachinesList } from './Migration';
import { PlanVirtualMachinesList } from './Plan';
import { PlanData } from './types';

export interface PlanVirtualMachinesProps extends RouteComponentProps {
  obj: PlanData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

const PlanVirtualMachines_: React.FC<PlanVirtualMachinesProps> = (props) => {
  const plan = props?.obj.plan;

  if (isPlanExecuting(plan)) {
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

  const data = { plan, permissions };

  return (
    <ModalHOC>
      <Suspend obj={plan} loaded={planLoaded} loadError={planLoadError}>
        <PlanVirtualMachines_ obj={data} loaded={planLoaded} loadError={planLoadError} />
      </Suspend>
    </ModalHOC>
  );
};
