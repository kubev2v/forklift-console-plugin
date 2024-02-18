import React from 'react';
import StatusIcon from 'src/components/status/StatusIcon';
import { useForkliftTranslation } from 'src/utils/i18n';

import { IoK8sApiCoreV1Pod } from '@kubev2v/types';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

export const PodsTable: React.FC<PodsTableProps> = ({ pods, showOwner }) => {
  const { t } = useForkliftTranslation();

  if (!pods) {
    return <></>;
  }

  const getStatusLabel = (phase: string) => {
    return (
      <Split>
        <SplitItem className="forklift-overview__controller-card__status-icon">
          <StatusIcon phase={phase} />
        </SplitItem>
        <SplitItem>{phase}</SplitItem>
      </Split>
    );
  };

  return (
    <TableComposable aria-label="Expandable table" variant="compact">
      <Thead>
        <Tr>
          <Th width={20}>{t('Pod')}</Th>
          {showOwner && <Th width={20}>{t('Owner')}</Th>}
          <Th width={10}>{t('Status')}</Th>
          <Th width={10}>{t('Created at')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {pods.map((pod) => (
          <Tr key={pod?.metadata?.uid}>
            <Td>
              <ResourceLink
                kind={pod?.kind}
                name={pod?.metadata?.name}
                namespace={pod?.metadata?.namespace}
              />
            </Td>
            {showOwner && (
              <Td>
                {pod?.metadata?.ownerReferences?.[0] ? (
                  <ResourceLink
                    kind={pod?.metadata?.ownerReferences?.[0]?.kind}
                    name={pod?.metadata?.ownerReferences?.[0]?.name}
                    namespace={pod?.metadata?.namespace}
                  />
                ) : (
                  ''
                )}
              </Td>
            )}
            <Td>{getStatusLabel(pod?.status?.phase)}</Td>
            <Td>
              <Timestamp timestamp={pod?.metadata?.creationTimestamp} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export type PodsTableProps = {
  pods: IoK8sApiCoreV1Pod[];
  showOwner?: boolean;
};
