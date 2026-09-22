import { useMemo } from 'react';

import type { K8sResourceCondition, V1beta1Provider } from '@forklift-ui/types';
import { CATEGORY_TYPES } from '@utils/constants';
import { getProviderConditions } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { getConditionCategory } from '../utils/providerConditionUtils';
import { selectElevatedProviderConditions } from '../utils/selectElevatedProviderConditions';

type UseProviderIssuesAlertsResult = {
  elevatedConditions: K8sResourceCondition[];
  hasCriticalElevatedConditions: boolean;
  showElevatedConditions: boolean;
};

const useProviderIssuesAlerts = (
  provider: V1beta1Provider | undefined,
): UseProviderIssuesAlertsResult => {
  const conditions = useMemo(() => getProviderConditions(provider), [provider]);

  const elevatedConditions = useMemo(
    () => selectElevatedProviderConditions(conditions),
    [conditions],
  );

  const showElevatedConditions = useMemo(() => !isEmpty(elevatedConditions), [elevatedConditions]);

  const hasCriticalElevatedConditions = useMemo(
    () =>
      elevatedConditions.some(
        (condition) => getConditionCategory(condition) === CATEGORY_TYPES.CRITICAL,
      ),
    [elevatedConditions],
  );

  return { elevatedConditions, hasCriticalElevatedConditions, showElevatedConditions };
};

export default useProviderIssuesAlerts;
