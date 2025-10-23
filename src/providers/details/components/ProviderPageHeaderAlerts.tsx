import { type FC, useMemo } from 'react';
import InventoryNotReachable from 'src/modules/Providers/views/list/components/InventoryNotReachable';
import ProviderCriticalCondition from 'src/modules/Providers/views/list/components/ProviderCriticalCondition';

import type { V1beta1Provider } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';

import './ProviderPageHeaderAlerts.style.scss';

type ProviderPageHeaderAlertsProps = {
  provider: V1beta1Provider;
  inventoryLoading: boolean;
  inventoryError: Error | null;
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
        <PageSection hasBodyWrapper={false} className="forklift-page-header-alerts">
          <InventoryNotReachable key={'inventoryNotReachable'} />
        </PageSection>
      )}
      {criticalCondition && (
        <PageSection hasBodyWrapper={false} className="forklift-page-header-alerts">
          <ProviderCriticalCondition
            type={criticalCondition?.type}
            message={criticalCondition?.message ?? ''}
            key={'providerCriticalCondition'}
          />
        </PageSection>
      )}
    </>
  );
};

export default ProviderPageHeaderAlerts;
