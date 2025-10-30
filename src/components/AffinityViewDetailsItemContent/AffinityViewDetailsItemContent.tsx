import type { FC } from 'react';

import type { V1beta1PlanSpecTargetAffinity } from '@kubev2v/types/dist/generated/forklift/models/V1beta1PlanSpecTargetAffinity';
import { useForkliftTranslation } from '@utils/i18n';

import { getAffinityRules } from './utils/getAffinityRules';

type AffinityViewDetailsItemContentProps = {
  affinity: V1beta1PlanSpecTargetAffinity | undefined;
};

const AffinityViewDetailsItemContent: FC<AffinityViewDetailsItemContentProps> = ({ affinity }) => {
  const { t } = useForkliftTranslation();

  return <>{t('{{rules}} affinity rules', { rules: getAffinityRules(affinity)?.length ?? 0 })}</>;
};

export default AffinityViewDetailsItemContent;
