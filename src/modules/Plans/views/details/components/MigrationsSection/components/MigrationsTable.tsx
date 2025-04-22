import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { getMigrationPhase } from 'src/modules/Plans/utils/helpers/getMigrationPhase';
import { getMigrationVmsCounts } from 'src/modules/Plans/utils/helpers/getMigrationVmsCounts';
import { getPlanProgressVariant } from 'src/modules/Plans/utils/helpers/getPlanProgressVariant';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Migration,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  HelperText,
  HelperTextItem,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

export const MigrationsTable: FC<MigrationTableProps> = ({ migrations, showOwner }) => {
  const { t } = useForkliftTranslation();

  if (!migrations || migrations.length < 1) {
    return (
      <HelperText>
        <HelperTextItem>{t('Migrations not found')}</HelperTextItem>
      </HelperText>
    );
  }

  sortMigrationsByStartedAtDate(migrations);

  return (
    <Table aria-label="Expandable table" variant="compact">
      <Thead>
        <Tr>
          <Th width={20}>{t('Migration')}</Th>
          {showOwner && <Th width={20}>{t('Owner')}</Th>}
          <Th width={15}>{t('VMs')}</Th>
          <Th width={10}>{t('Started at')}</Th>
          <Th width={10}>{t('Completed at')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {migrations.map((migration) => (
          <Tr key={migration?.metadata?.uid}>
            <Td>
              <ResourceLink
                groupVersionKind={MigrationModelGroupVersionKind}
                name={migration?.metadata?.name}
                namespace={migration?.metadata?.namespace}
              />
            </Td>
            {showOwner && (
              <Td>
                {migration?.metadata?.ownerReferences?.[0] ? (
                  <ResourceLink
                    groupVersionKind={PlanModelGroupVersionKind}
                    name={migration?.metadata?.ownerReferences?.[0]?.name}
                    namespace={migration?.metadata?.namespace}
                  />
                ) : (
                  ''
                )}
              </Td>
            )}
            <Td>
              <VMsLabel migration={migration} />
            </Td>
            <Td>
              <ConsoleTimestamp timestamp={migration?.status?.started} />
            </Td>
            <Td>
              <ConsoleTimestamp timestamp={migration?.status?.completed} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const VMsLabel: FC<{ migration: V1beta1Migration }> = ({ migration }) => {
  const { t } = useForkliftTranslation();

  const phase = getMigrationPhase(migration);
  const phaseLabel = PlanPhase[phase] ? t(PlanPhase[phase]) : PlanPhase.Unknown;

  const progressVariant = getPlanProgressVariant(PlanPhase[phase]);
  const counters = getMigrationVmsCounts(migration?.status?.vms);

  if (!counters?.total || counters.total === 0) {
    return <>-</>;
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

const sortMigrationsByStartedAtDate = (migrations: V1beta1Migration[]) => {
  migrations.sort((a, b) => {
    const dateA = new Date(a?.status?.started);
    const dateB = new Date(b?.status?.started);
    return dateB.getTime() - dateA.getTime();
  });
};

type MigrationTableProps = {
  migrations: V1beta1Migration[];
  showOwner?: boolean;
};
