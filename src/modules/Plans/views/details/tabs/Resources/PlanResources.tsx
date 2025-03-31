import React from 'react';
import { useProviderInventory, type UseProviderInventoryParams } from 'src/modules/Providers/hooks';

import {
  type OpenshiftVM,
  type OpenstackVM,
  type OvaVM,
  type OVirtVM,
  PlanModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  type ProviderVirtualMachine,
  type V1beta1Plan,
  type V1beta1Provider,
  type VSphereVM,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { Loading, Suspend } from '../../components';

import { OpenshiftPlanResources } from './OpenshiftPlanResources';
import { OpenstackPlanResources } from './OpenstackPlanResources';
import { OVAPlanResources } from './OVAPlanResources';
import { OvirtPlanResources } from './OvirtPlanResources';
import { VSpherePlanResources } from './VSpherePlanResources';

export const PlanResources: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const [provider, providerLoaded, providerLodeError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name: plan?.spec?.provider?.source?.name,
    namespace: plan?.spec?.provider?.source?.namespace,
    namespaced: true,
  });

  const inventoryOptions: UseProviderInventoryParams = {
    disabled: !loaded || loadError || !providerLoaded || providerLodeError,
    provider,
    subPath: 'vms?detail=4',
  };

  const {
    error: inventoryLoadError,
    inventory: inventoryVms,
    loading: inventoryLoading,
  } = useProviderInventory<ProviderVirtualMachine[]>(inventoryOptions);

  const planVmIds: string[] = [];
  (plan?.spec?.vms || []).forEach((vm) => planVmIds.push(vm.id));

  const planInventory = (inventoryVms || []).filter((vm) => planVmIds.includes(vm.id));

  switch (provider?.spec?.type) {
    case 'ovirt':
      return (
        <Suspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
          <OvirtPlanResources planInventory={planInventory as OVirtVM[]} />
        </Suspend>
      );
    case 'openshift':
      return (
        <Suspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
          <OpenshiftPlanResources planInventory={planInventory as OpenshiftVM[]} />
        </Suspend>
      );
    case 'openstack':
      return (
        <Suspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
          <OpenstackPlanResources planInventory={planInventory as OpenstackVM[]} />
        </Suspend>
      );
    case 'vsphere':
      return (
        <Suspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
          <VSpherePlanResources planInventory={planInventory as VSphereVM[]} />
        </Suspend>
      );
    case 'ova':
      return (
        <Suspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
          <OVAPlanResources planInventory={planInventory as OvaVM[]} />
        </Suspend>
      );
    default:
      return (
        <Bullseye>
          <Loading></Loading>
        </Bullseye>
      );
  }
};
