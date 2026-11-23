import type { FC } from 'react';
import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { MigrationVirtualMachineStatus, type PlanStatuses } from './utils/types';

type MigrationProcessedTextProps = {
  phase?: PlanStatuses;
  planSpecVMsTotal: number;
  vms: V1beta1PlanStatusMigrationVms[];
};

const MigrationProcessedText: FC<MigrationProcessedTextProps> = ({
  phase,
  planSpecVMsTotal,
  vms,
}) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(vms)) {
    return <>{t('No vms present in the migration')}</>;
  }

  const totalVMs = vms.length;
  const counter = getMigrationVMsStatusCounts(vms, planSpecVMsTotal, phase);
  const succeededCount = counter[MigrationVirtualMachineStatus.Succeeded].count;
  const percentage = Math.trunc((succeededCount / totalVMs) * 100);

  return t('{{succeededCount}} of {{count}} VMs processed ({{percentage}}%)', {
    count: totalVMs,
    percentage,
    succeededCount,
  });
};

export default MigrationProcessedText;
