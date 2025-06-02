import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';

import {
  type ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Split, SplitItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import InventoryNotReachable from '../../list/components/InventoryNotReachable';
import ProviderCriticalCondition from '../../list/components/ProviderCriticalCondition';
import { MigrationAction } from '../tabs/VirtualMachines/components/MigrationAction';

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

  const data: ProviderData = { inventory, permissions, provider };
  const alerts = [];

  const criticalCondition =
    providerLoaded &&
    provider?.status?.conditions?.find((condition) => condition?.category === 'Critical');

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
        message={criticalCondition?.message ?? ''}
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
        actions={
          <Split hasGutter>
            <SplitItem>
              <MigrationAction namespace={namespace} provider={data.provider} />
            </SplitItem>

            <SplitItem>
              <ProviderActionsDropdown data={data} />
            </SplitItem>
          </Split>
        }
      >
        {!isEmpty(alerts) && (
          <PageSection variant="light" className="forklift-page-headings-alerts">
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};
