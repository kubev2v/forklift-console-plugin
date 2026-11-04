import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { formatBytes } from '@utils/format/formatBytes';
import { EMPTY_VALUE } from '@utils/format/formatConstants';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';
import { isEmpty } from '@utils/helpers';
import { shouldShowCopyTime } from '@utils/migrations/migrationPerformanceTime';
import type { MigrationPerformance } from '@utils/migrations/migrationPerformanceTypes';

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
      <div>
        <strong>{t('Total duration')}:</strong> {formatDuration(durationSeconds)}
      </div>
      {shouldShowCopyTime(durationSeconds, transferSeconds) && (
        <div>
          <strong>{t('Copy time')}:</strong> {formatDuration(transferSeconds)}
        </div>
      )}
      <div>
        <strong>{t('Data transferred')}:</strong> {formatBytes(copiedBytes)}{' '}
        {t('of {{expected}}', {
          expected: expectedBytes ? formatBytes(expectedBytes) : EMPTY_VALUE,
        })}
      </div>
      <div>
        <strong>{t('Average rate')}:</strong>{' '}
        {avgTransferRate === undefined ? EMPTY_VALUE : formatThroughput(avgTransferRate)}
      </div>
      <div>
        <strong>{t('Overall rate')}:</strong>{' '}
        {overallRate === undefined ? EMPTY_VALUE : formatThroughput(overallRate)}
      </div>
      {!isEmpty(vms) && (
        <div>
          <strong>{t('VMs succeeded')}:</strong>{' '}
          {t('{{succeeded}} of {{total}}', { succeeded, total: vms.length })}
        </div>
      )}
    </div>
  );
};

export default MigrationPerformanceDetails;
