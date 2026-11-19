import { type FC, Fragment } from 'react';
import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Divider, Flex, FlexItem } from '@patternfly/react-core';

import { MigrationVirtualMachineStatus, type PlanStatuses } from './utils/types';

type MigrationCounterTextProps = {
  phase?: PlanStatuses;
  planSpecVMsTotal: number;
  vms: V1beta1PlanStatusMigrationVms[];
};

const MigrationCounterText: FC<MigrationCounterTextProps> = ({ phase, planSpecVMsTotal, vms }) => {
  const { t } = useForkliftTranslation();

  const counter = getMigrationVMsStatusCounts(vms, planSpecVMsTotal, phase);

  const inProgressCount = counter[MigrationVirtualMachineStatus.InProgress].count;
  const succeededCount = counter[MigrationVirtualMachineStatus.Succeeded].count;
  const canceledCount = counter[MigrationVirtualMachineStatus.Canceled].count;
  const cannotStartCount = counter[MigrationVirtualMachineStatus.CantStart].count;
  const failedCount = counter[MigrationVirtualMachineStatus.Failed].count;
  const pausedCount = counter[MigrationVirtualMachineStatus.Paused].count;

  const segments = [
    t('{{count}} completed', { count: succeededCount }),
    t('{{count}} migrating', { count: inProgressCount }),
    failedCount > 0 && t('{{count}} failed', { count: failedCount }),
    cannotStartCount > 0 && t('{{count}} cannot start', { count: cannotStartCount }),
    canceledCount > 0 && t('{{count}} canceled', { count: canceledCount }),
    pausedCount > 0 && t('{{count}} paused', { count: pausedCount }),
  ].filter((segment): segment is string => Boolean(segment));

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
      {segments.map((segment, index) => (
        <Fragment key={segment}>
          {index > 0 && (
            <Divider component="div" orientation={{ default: 'vertical' }} role="presentation" />
          )}
          <FlexItem>{segment}</FlexItem>
        </Fragment>
      ))}
    </Flex>
  );
};

export default MigrationCounterText;
