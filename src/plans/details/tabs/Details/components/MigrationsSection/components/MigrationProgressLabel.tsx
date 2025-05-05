import type { FC } from 'react';
import { getMigrationPhase } from 'src/modules/Plans/utils/helpers/getMigrationPhase';
import { getMigrationVmsCounts } from 'src/modules/Plans/utils/helpers/getMigrationVmsCounts';
import { getPlanProgressVariant } from 'src/modules/Plans/utils/helpers/getPlanProgressVariant';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';

import type { V1beta1Migration } from '@kubev2v/types';
import { Progress, ProgressMeasureLocation, ProgressSize } from '@patternfly/react-core';
import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationProgressLabelProps = { migration: V1beta1Migration };

const MigrationProgressLabel: FC<MigrationProgressLabelProps> = ({ migration }) => {
  const { t } = useForkliftTranslation();

  const phase = getMigrationPhase(migration);
  const phaseLabel = PlanPhase[phase]
    ? t('{{phase}}', { phase: PlanPhase[phase] })
    : PlanPhase.Unknown;

  const progressVariant = getPlanProgressVariant(PlanPhase[phase]);
  const counters = getMigrationVmsCounts(migration?.status?.vms);

  if (!counters?.total || counters.total === 0) {
    return <>{EMPTY_MSG}</>;
  }

  return (
    <div className="forklift-table__status-cell-progress">
      <Progress
        title={t('{{success}} of {{total}} VMs migrated', counters)}
        value={counters?.total > 0 ? (100 * counters?.success) / counters?.total : 0}
        label={phaseLabel}
        valueText={phaseLabel}
        size={ProgressSize.sm}
        measureLocation={ProgressMeasureLocation.top}
        variant={progressVariant}
      />
    </div>
  );
};

export default MigrationProgressLabel;
