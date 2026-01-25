import { type FC, useMemo } from 'react';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import LoadingSuspend from '@components/LoadingSuspend';
import {
  ProviderModelGroupVersionKind,
  type ProviderVirtualMachine,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import PlanResourcesTable from './components/PlanResourcesTable';
import { getPlanResourcesTableProps } from './utils/utils';

const PlanResourcesPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { plan } = usePlan(name, namespace);
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

  if (!planResourcesTableProps) return <LoadingSuspend />;

  return (
    <LoadingSuspend obj={plan} loaded={!inventoryLoading} loadError={inventoryLoadError}>
      <PlanResourcesTable {...planResourcesTableProps} />
    </LoadingSuspend>
  );
};

export default PlanResourcesPage;
