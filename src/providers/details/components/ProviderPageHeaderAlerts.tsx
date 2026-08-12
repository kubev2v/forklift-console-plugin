import { type FC, useMemo } from 'react';
import InventoryNotReachable from 'src/providers/list/components/InventoryNotReachable';
import ProviderCriticalCondition from 'src/providers/list/components/ProviderCriticalCondition';

import type { V1beta1Provider } from '@forklift-ui/types';
import { PageSection } from '@patternfly/react-core';

import './ProviderPageHeaderAlerts.style.scss';

type ProviderPageHeaderAlertsProps = {
  inventoryError: Error | null;
  inventoryLoading: boolean;
  provider: V1beta1Provider;
};

const ProviderPageHeaderAlerts: FC<ProviderPageHeaderAlertsProps> = ({
  inventoryError,
  inventoryLoading,
  provider,
}) => {
  const criticalCondition = useMemo(
    () => provider?.status?.conditions?.find((condition) => condition?.category === 'Critical'),
    [provider?.status?.conditions],
  );

  const isInventoryNotReachable = useMemo(
    () =>
      provider?.status?.phase === 'Ready' &&
      !inventoryLoading &&
      inventoryError &&
      inventoryError.toString() !== 'Error: Invalid provider data',
    [inventoryError, inventoryLoading, provider?.status?.phase],
  );

  return (
    <>
      {isInventoryNotReachable && (
        <PageSection className="forklift-page-header-alerts" hasBodyWrapper={false}>
          <InventoryNotReachable key={'inventoryNotReachable'} />
        </PageSection>
      )}
      {criticalCondition && (
        <PageSection className="forklift-page-header-alerts" hasBodyWrapper={false}>
          <ProviderCriticalCondition
            key={'providerCriticalCondition'}
            message={criticalCondition?.message ?? ''}
            type={criticalCondition?.type}
          />
        </PageSection>
      )}
    </>
  );
};

export default ProviderPageHeaderAlerts;
