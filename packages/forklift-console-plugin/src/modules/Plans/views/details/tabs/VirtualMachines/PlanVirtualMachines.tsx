import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';
import { ProvidersPermissionStatus } from 'src/modules/Providers/utils/types/ProvidersPermissionStatus';

import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationVirtualMachinesList } from './Migration';
import { PlanVirtualMachinesList } from './Plan';

export interface PlanData {
  plan?: V1beta1Plan;
  permissions?: ProvidersPermissionStatus;
}

export interface PlanVirtualMachinesProps extends RouteComponentProps {
  obj: PlanData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

const PlanVirtualMachines_: React.FC<PlanVirtualMachinesProps> = (props) => {
  const migration = props?.obj?.plan?.status?.migration.vms;

  if (migration === undefined) {
    return <PlanVirtualMachinesList {...props} />;
  } else {
    return <MigrationVirtualMachinesList {...props} />;
  }
};

export const PlanVirtualMachines: React.FC<PlanVirtualMachinesProps> = (props) => (
  <ModalHOC>
    <PlanVirtualMachines_ {...props} />
  </ModalHOC>
);

export const PlanVirtualMachinesWrapper: React.FC<{ name: string; namespace: string }> = ({
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

  return <PlanVirtualMachines obj={data} loaded={planLoaded} loadError={planLoadError} />;
};
