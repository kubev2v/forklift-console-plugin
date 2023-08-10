import React from 'react';
import { ProviderActionsDropdown } from 'src/modules/Providers/actions';
import { useGetDeleteAndEditAccessReview, useProviderInventory } from 'src/modules/Providers/hooks';
import { PageHeadings } from 'src/modules/Providers/utils';

import {
  ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { InventoryNotReachable, ProviderCriticalCondition } from '../../list';

export const ProviderPageHeadings: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const {
    inventory,
    loading: inventoryLoading,
    error: inventoryError,
  } = useProviderInventory<ProviderInventory>({
    provider,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data = { provider, inventory, permissions };
  const alerts = [];

  const criticalCondition =
    providerLoaded &&
    provider?.status?.conditions.find((condition) => condition?.category === 'Critical');

  const inventoryNotReachable =
    providerLoaded &&
    provider?.status?.phase === 'Ready' &&
    !inventoryLoading &&
    inventoryError &&
    inventoryError.toString() !== 'Error: Invalid provider data';

  if (inventoryNotReachable) {
    alerts.push(<InventoryNotReachable key={'inventoryNotReachable'} />);
  } else if (criticalCondition) {
    alerts.push(
      <ProviderCriticalCondition
        type={criticalCondition?.type}
        message={criticalCondition?.message}
        key={'providerCriticalCondition'}
      />,
    );
  }

  return (
    <>
      <PageHeadings
        model={ProviderModel}
        obj={data?.provider}
        namespace={namespace}
        actions={<ProviderActionsDropdown data={data} fieldId={''} fields={[]} />}
      >
        {alerts && alerts.length > 0 && (
          <PageSection className="forklift-page-headings-alerts">{alerts}</PageSection>
        )}
      </PageHeadings>
    </>
  );
};
