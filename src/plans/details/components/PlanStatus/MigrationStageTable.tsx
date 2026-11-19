import { type FC, useMemo } from 'react';
import { MigrationVirtualMachineStatus } from 'src/plans/details/components/PlanStatus/utils/types';

import type { V1beta1MigrationStatusVms } from '@forklift-ui/types';
import { Card, Icon } from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import { getMigrationVMStatus } from './utils/migrationVmStatus';
import { getPipelineStepCount } from './utils/pipelineStepCounter';

type MigrationStageTableProps = {
  vms: V1beta1MigrationStatusVms[] | undefined;
};

const MigrationStageTable: FC<MigrationStageTableProps> = ({ vms }) => {
  const { t } = useForkliftTranslation();

  const { activeVMs, completedCount } = useMemo(
    () =>
      (vms ?? []).reduce<{ activeVMs: V1beta1MigrationStatusVms[]; completedCount: number }>(
        (acc, vm) => {
          const status = getMigrationVMStatus(vm);

          if (
            status === MigrationVirtualMachineStatus.InProgress ||
            status === MigrationVirtualMachineStatus.Paused
          ) {
            acc.activeVMs.push(vm);
          } else if (status === MigrationVirtualMachineStatus.Succeeded) {
            acc.completedCount += 1;
          }

          return acc;
        },
        { activeVMs: [], completedCount: 0 },
      ),
    [vms],
  );

  if (!vms) return null;

  const stepsCounter = getPipelineStepCount(activeVMs);
  stepsCounter.set(t('Fully migrated'), completedCount);

  return (
    <Card>
      <Table
        aria-label={t('Migration progress stage table')}
        data-testid="migration progress stage table"
        variant={TableVariant.compact}
      >
        <Thead>
          <Tr>
            <Th key="Stage"> {t('Stage')}</Th>
            <Th key="VMs"> {t('VMs')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {[...stepsCounter].map(([step, runningVMs]) => (
            <Tr key={step}>
              <Td dataLabel={t('Stage')}>{step}</Td>
              <Td dataLabel={t('VMs')}>
                {Boolean(runningVMs) && step !== t('Fully migrated') && (
                  <>
                    <Icon className="pf-v6-u-mr-sm">
                      <InProgressIcon />
                    </Icon>{' '}
                  </>
                )}
                {runningVMs}{' '}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
};

export default MigrationStageTable;
