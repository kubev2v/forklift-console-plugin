import { type FC, useMemo } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import Loading from '@components/Loading';
import Suspend from '@components/Suspend';
import {
  ProviderModelGroupVersionKind,
  type ProviderVirtualMachine,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import type { PlanPageProps } from '../../utils/types';

import PlanResourcesTable from './components/PlanResourcesTable';
import { getPlanResourcesTableProps } from './utils/utils';

const PlanResourcesPage: FC<PlanPageProps> = ({ plan }) => {
  const [provider, providerLoaded, providerLodeError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name: plan?.spec?.provider?.source?.name,
    namespace: plan?.spec?.provider?.source?.namespace,
    namespaced: true,
  });

  const {
    error: inventoryLoadError,
    inventory: inventoryVms,
    loading: inventoryLoading,
  } = useProviderInventory<ProviderVirtualMachine[]>({
    disabled: !providerLoaded || Boolean(providerLodeError),
    provider,
    subPath: 'vms?detail=4',
  });

  const planVmIds = useMemo(() => (plan?.spec?.vms ?? []).map((vm) => vm.id), [plan?.spec?.vms]);

  const planInventory = useMemo(
    () => (inventoryVms ?? []).filter((vm) => planVmIds.includes(vm.id)),
    [inventoryVms, planVmIds],
  );

  const planResourcesTableProps = getPlanResourcesTableProps(planInventory, provider?.spec?.type);

  if (!planResourcesTableProps)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <Suspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
      <PlanResourcesTable {...planResourcesTableProps} />
    </Suspend>
  );
};

export default PlanResourcesPage;
