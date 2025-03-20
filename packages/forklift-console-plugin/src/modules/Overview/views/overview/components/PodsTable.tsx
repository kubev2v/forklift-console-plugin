import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp';
import StatusIcon from 'src/components/status/StatusIcon';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { IoK8sApiCoreV1Pod } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, Split, SplitItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

export const PodsTable: React.FC<PodsTableProps> = ({ pods, showOwner }) => {
  const { t } = useForkliftTranslation();

  const getPodLogsLink = (pod: IoK8sApiCoreV1Pod) =>
    getResourceUrl({
      reference: 'pods',
      namespace: pod.metadata.namespace,
      name: pod.metadata.name,
    });

  if (!pods) {
    return (
      <HelperText>
        <HelperTextItem>{t('Pods not found')}</HelperTextItem>
      </HelperText>
    );
  }

  return (
    <Table aria-label="Expandable table" variant="compact">
      <Thead>
        <Tr>
          <Th width={20}>{t('Pod')}</Th>
          {showOwner && <Th width={20}>{t('Owner')}</Th>}
          <Th width={10}>{t('Status')}</Th>
          <Th width={10}>{t('Pod logs')}</Th>
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
              <Link to={`${getPodLogsLink(pod)}/logs`}>{t('Logs')}</Link>
            </Td>
            <Td>
              <ConsoleTimestamp timestamp={pod?.metadata?.creationTimestamp} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
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
