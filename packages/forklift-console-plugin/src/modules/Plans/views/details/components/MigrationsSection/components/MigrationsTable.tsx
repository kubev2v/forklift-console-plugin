import React from 'react';
import StatusIcon from 'src/components/status/StatusIcon';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  V1beta1Migration,
  V1beta1MigrationStatusConditions,
} from '@kubev2v/types';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, Split, SplitItem } from '@patternfly/react-core';
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

  return (
    <TableComposable aria-label="Expandable table" variant="compact">
      <Thead>
        <Tr>
          <Th width={20}>{t('Migration')}</Th>
          {showOwner && <Th width={20}>{t('Owner')}</Th>}
          <Th width={10}>{t('Status')}</Th>
          <Th width={10}>{t('VMs')}</Th>
          <Th width={15}>{t('Started at')}</Th>
          <Th width={15}>{t('Completed at')}</Th>
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
            <Td>{getStatusLabel(migration?.status?.conditions)}</Td>
            <Td>{migration?.status?.vms?.length || '-'}</Td>
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

const getStatusLabel = (conditions: V1beta1MigrationStatusConditions[]) => {
  let phase: string;

  const phases = ['Ready', 'Running', 'Succeeded', 'Failed'];

  // Look for a condition indicating a migration phase
  phases.forEach((p) => {
    const condition = conditions.find((c) => c.type === p && c.status === 'True');
    if (condition) {
      phase = p;
    }
  });

  return (
    <Split>
      <SplitItem className="forklift-overview__controller-card__status-icon">
        <StatusIcon phase={phase} />
      </SplitItem>
      <SplitItem>{phase}</SplitItem>
    </Split>
  );
};

export type MigrationTableProps = {
  migrations: V1beta1Migration[];
  showOwner?: boolean;
};
