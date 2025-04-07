import type { FC } from 'react';
import { ProviderActionsDropdown } from 'src/modules/Providers/actions/ProviderActionsDropdown';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';

import {
  type ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import InventoryNotReachable from '../../list/components/InventoryNotReachable';
import ProviderCriticalCondition from '../../list/components/ProviderCriticalCondition';

export const ProviderPageHeadings: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const {
    error: inventoryError,
    inventory,
    loading: inventoryLoading,
  } = useProviderInventory<ProviderInventory>({
    provider,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data = { inventory, permissions, provider };
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
          <PageSection variant="light" className="forklift-page-headings-alerts">
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};
