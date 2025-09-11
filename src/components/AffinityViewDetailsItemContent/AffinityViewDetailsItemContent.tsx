import type { FC } from 'react';

import type { K8sIoApiCoreV1Affinity } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import { getAffinityRules } from './utils/getAffinityRules';

type AffinityViewDetailsItemContentProps = {
  affinity: K8sIoApiCoreV1Affinity | undefined;
};

const AffinityViewDetailsItemContent: FC<AffinityViewDetailsItemContentProps> = ({ affinity }) => {
  const { t } = useForkliftTranslation();

  return <>{t('{{rules}} affinity rules', { rules: getAffinityRules(affinity)?.length ?? 0 })}</>;
};

export default AffinityViewDetailsItemContent;
