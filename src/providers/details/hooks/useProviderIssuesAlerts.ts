import { useMemo } from 'react';

import type { K8sResourceCondition, V1beta1Provider } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { selectElevatedProviderConditions } from '../utils/selectElevatedProviderConditions';

type UseProviderIssuesAlertsResult = {
  elevatedConditions: K8sResourceCondition[];
  showElevatedConditions: boolean;
};

const useProviderIssuesAlerts = (
  provider: V1beta1Provider | undefined,
): UseProviderIssuesAlertsResult => {
  const elevatedConditions = useMemo(
    () => selectElevatedProviderConditions(provider?.status?.conditions),
    [provider?.status?.conditions],
  );

  const showElevatedConditions = useMemo(() => !isEmpty(elevatedConditions), [elevatedConditions]);

  return { elevatedConditions, showElevatedConditions };
};

export default useProviderIssuesAlerts;
