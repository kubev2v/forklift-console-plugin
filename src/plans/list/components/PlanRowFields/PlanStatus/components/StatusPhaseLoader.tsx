import type { FC } from 'react';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';

import { Label, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type StatusPhaseLoaderProps = {
  loading: boolean;
  phase: PlanPhase;
};

const StatusPhaseLoader: FC<StatusPhaseLoaderProps> = ({ loading, phase }) => {
  const { t } = useForkliftTranslation();
  if (loading) {
    return <Spinner size="md" />;
  }

  if (phase === PlanPhase.NotReady) {
    return <>{t('Validating...')}</>;
  }
  return <Label isCompact>{phase}</Label>;
};

export default StatusPhaseLoader;
