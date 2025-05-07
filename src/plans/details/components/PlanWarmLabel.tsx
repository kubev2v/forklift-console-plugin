import type { FC } from 'react';

import { Label } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type PlanWarmLabelProps = {
  isWarm?: boolean;
};

const PlanWarmLabel: FC<PlanWarmLabelProps> = ({ isWarm }) => {
  const { t } = useForkliftTranslation();
  return (
    <Label isCompact color={isWarm ? 'orange' : 'blue'}>
      {isWarm ? t('warm') : t('cold')}
    </Label>
  );
};

export default PlanWarmLabel;
