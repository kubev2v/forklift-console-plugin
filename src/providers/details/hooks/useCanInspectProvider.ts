import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { getVddkInitImage } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type UseCanInspectProviderResult = {
  canInspect: boolean;
  disabledReason: string | undefined;
  isVsphere: boolean;
};

export const useCanInspectProvider = (
  provider: V1beta1Provider | undefined,
): UseCanInspectProviderResult => {
  const { t } = useForkliftTranslation();
  const isVsphere = provider?.spec?.type === PROVIDER_TYPES.vsphere;

  if (!isVsphere || !provider) {
    return { canInspect: false, disabledReason: undefined, isVsphere };
  }

  const isVddkConfigured = !isEmpty(getVddkInitImage(provider));
  const providerReady = provider.status?.conditions?.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.READY && condition.status === CONDITION_STATUS.TRUE,
  );

  if (!providerReady) {
    return {
      canInspect: false,
      disabledReason: t('Provider is not ready.'),
      isVsphere,
    };
  }

  if (!isVddkConfigured) {
    return {
      canInspect: false,
      disabledReason: t(
        'VDDK image is required for deep inspection. Configure it in the provider settings.',
      ),
      isVsphere,
    };
  }

  return { canInspect: true, disabledReason: undefined, isVsphere };
};
