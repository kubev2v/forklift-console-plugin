import React from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp';
import StatusIcon from 'src/components/status/StatusIcon';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@kubev2v/common';
import { IoK8sApiCoreV1Pod } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, Split, SplitItem } from '@patternfly/react-core';

export const PodsTable: React.FC<PodsTableProps> = ({ pods, showOwner }) => {
  const { t } = useForkliftTranslation();

  if (!pods) {
    return (
      <HelperText>
        <HelperTextItem>{t('Pods not found')}</HelperTextItem>
      </HelperText>
    );
  }

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
              <ConsoleTimestamp timestamp={pod?.metadata?.creationTimestamp} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

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

export type PodsTableProps = {
  pods: IoK8sApiCoreV1Pod[];
  showOwner?: boolean;
};
