import { type FC, useMemo } from 'react';
import InventoryNotReachable from 'src/providers/list/components/InventoryNotReachable';

import type { V1beta1Provider } from '@forklift-ui/types';
import { PageSection } from '@patternfly/react-core';

import ProviderIssuesAlerts from './ProviderIssuesAlerts/ProviderIssuesAlerts';

import './ProviderPageHeaderAlerts.style.scss';

type ProviderPageHeaderAlertsProps = {
  inventoryError: Error | null;
  inventoryLoading: boolean;
  provider: V1beta1Provider;
  setShowProviderIssuesPanel?: (isOpen: boolean) => void;
};

const ProviderPageHeaderAlerts: FC<ProviderPageHeaderAlertsProps> = ({
  inventoryError,
  inventoryLoading,
  provider,
  setShowProviderIssuesPanel,
}) => {
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
      <ProviderIssuesAlerts provider={provider} setIsDrawerOpen={setShowProviderIssuesPanel} />
    </>
  );
};

export default ProviderPageHeaderAlerts;
