import React from 'react';
import StatusIcon from 'src/components/status/StatusIcon';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  V1beta1Migration,
} from '@kubev2v/types';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  HelperText,
  HelperTextItem,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  ProgressVariant,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

export const MigrationsTable: React.FC<MigrationTableProps> = ({ migrations, showOwner }) => {
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
    <TableComposable aria-label="Expandable table" variant="compact">
      <Thead>
        <Tr>
          <Th width={20}>{t('Migration')}</Th>
          {showOwner && <Th width={20}>{t('Owner')}</Th>}
          <Th width={10}>{t('Status')}</Th>
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
              <StatusLabel migration={migration} />
            </Td>
            <Td>
              <VMsLabel migration={migration} />
            </Td>
            <Td>
              <Timestamp timestamp={migration?.status?.started} />
            </Td>
            <Td>
              <Timestamp timestamp={migration?.status?.completed} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

const getMigrationPhase = (migration) => {
  let phase = 'Unknown';

  const conditions = migration?.status?.conditions;

  if (!conditions || conditions.length < 1) {
    return phase;
  }

  const phases = ['Ready', 'Running', 'Succeeded', 'Failed'];

  // Look for a condition indicating a migration phase
  phases.forEach((p) => {
    const condition = conditions.find((c) => c.type === p && c.status === 'True');
    if (condition) {
      phase = p;
    }
  });

  return phase;
};

const getMigrationVmsCounts = (migration) => {
  const vms = migration?.status?.vms;

  if (!vms || vms.length < 1) {
    return {};
  }

  const vmsCanceled = vms.filter((vm) =>
    (vm?.conditions || []).find((c) => c.type === 'Canceled' && c.status === 'True'),
  );
  const vmsCompleted = vms.filter((vm) => vm?.completed);

  return {
    completed: vmsCompleted.length,
    total: vms.length,
    canceled: vmsCanceled.length,
  };
};

const StatusLabel: React.FC<{ migration: V1beta1Migration }> = ({ migration }) => {
  const phase = getMigrationPhase(migration);

  return (
    <Split>
      <SplitItem className="forklift-overview__controller-card__status-icon">
        <StatusIcon phase={phase} />
      </SplitItem>
      <SplitItem>{phase}</SplitItem>
    </Split>
  );
};

const VMsLabel: React.FC<{ migration: V1beta1Migration }> = ({ migration }) => {
  const { t } = useForkliftTranslation();

  const phase = getMigrationPhase(migration);
  let progressVariant;

  switch (phase) {
    case 'Failed':
      progressVariant = ProgressVariant.danger;
      break;
    case 'Succeeded':
      progressVariant = ProgressVariant.success;
      break;
  }

  const counters = getMigrationVmsCounts(migration);

  if (!counters?.total || counters.total === 0) {
    return <>-</>;
  }

  return (
    <Split>
      <SplitItem className="forklift-overview__controller-card__status-icon">
        <VirtualMachineIcon />
      </SplitItem>
      <SplitItem>
        {t('{{completed}} of {{total}} VMs migrated, {{canceled}} canceled', counters)}

        <Progress
          value={(100 * counters?.completed) / counters?.total}
          size={ProgressSize.sm}
          measureLocation={ProgressMeasureLocation.none}
          variant={progressVariant}
        />
      </SplitItem>
    </Split>
  );
};

const sortMigrationsByStartedAtDate = (migrations: V1beta1Migration[]) => {
  migrations.sort((a, b) => {
    const dateA = new Date(a?.status?.started);
    const dateB = new Date(b?.status?.started);
    return dateB.getTime() - dateA.getTime();
  });
};

export type MigrationTableProps = {
  migrations: V1beta1Migration[];
  showOwner?: boolean;
};
