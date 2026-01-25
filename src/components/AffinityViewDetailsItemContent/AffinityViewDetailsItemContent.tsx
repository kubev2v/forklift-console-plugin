import type { FC } from 'react';

import type { V1beta1PlanSpecTargetAffinity } from '@forklift-ui/types/dist/generated/forklift/models/V1beta1PlanSpecTargetAffinity';
import { Label } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getAffinityRules } from './utils/getAffinityRules';

type AffinityViewDetailsItemContentProps = {
  affinity: V1beta1PlanSpecTargetAffinity | undefined;
};

const AffinityViewDetailsItemContent: FC<AffinityViewDetailsItemContentProps> = ({ affinity }) => {
  const { t } = useForkliftTranslation();

  const rulesCount = getAffinityRules(affinity)?.length ?? 0;
  const content = t('{{rules}} affinity rules', { rules: rulesCount });

  return rulesCount === 0 ? (
    <Label isCompact color="grey">
      {content}
    </Label>
  ) : (
    <>{content}</>
  );
};

export default AffinityViewDetailsItemContent;
