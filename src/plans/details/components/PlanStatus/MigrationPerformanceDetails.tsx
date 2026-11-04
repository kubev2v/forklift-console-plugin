import type { FC } from 'react';
import { shouldShowCopyTime } from 'src/plans/utils/migrationPerformanceTime';
import type { MigrationPerformance } from 'src/plans/utils/migrationPerformanceTypes';
import { useForkliftTranslation } from 'src/utils/i18n';

import { EMPTY_MSG } from '@utils/constants';
import { formatBytes } from '@utils/format/formatBytes';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';
import { isEmpty } from '@utils/helpers';

type MigrationPerformanceDetailsProps = {
  performance: MigrationPerformance;
};

const MigrationPerformanceDetails: FC<MigrationPerformanceDetailsProps> = ({ performance }) => {
  const { t } = useForkliftTranslation();
  const {
    avgTransferRate,
    copiedBytes,
    durationSeconds,
    expectedBytes,
    overallRate,
    transferSeconds,
    vms,
  } = performance;
  const succeeded = vms.filter((vm) => vm.status === 'Succeeded').length;

  return (
    <div className="pf-v6-u-font-size-sm">
      <div>{t('Total duration: {{duration}}', { duration: formatDuration(durationSeconds) })}</div>
      {shouldShowCopyTime(durationSeconds, transferSeconds) && (
        <div>{t('Copy time: {{duration}}', { duration: formatDuration(transferSeconds) })}</div>
      )}
      <div>
        {t('Data transferred: {{copied}} of {{expected}}', {
          copied: formatBytes(copiedBytes),
          expected: expectedBytes ? formatBytes(expectedBytes) : EMPTY_MSG,
        })}
      </div>
      <div>
        {t('Average rate: {{rate}}', {
          rate: avgTransferRate ? formatThroughput(avgTransferRate) : EMPTY_MSG,
        })}
      </div>
      <div>
        {t('Overall rate: {{rate}}', {
          rate: overallRate ? formatThroughput(overallRate) : EMPTY_MSG,
        })}
      </div>
      {!isEmpty(vms) && (
        <div>
          {t('VMs succeeded: {{succeeded}} of {{total}}', { succeeded, total: vms.length })}
        </div>
      )}
    </div>
  );
};

export default MigrationPerformanceDetails;
