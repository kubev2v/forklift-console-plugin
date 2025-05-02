import { type FC, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import StatusIcon from 'src/components/status/StatusIcon';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Pod } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, Pagination, Split, SplitItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

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

type PodsTableProps = {
  pods: IoK8sApiCoreV1Pod[];
  showOwner?: boolean;
  limit?: number;
};

export const PodsTable: FC<PodsTableProps> = ({ limit, pods, showOwner }) => {
  const { t } = useForkliftTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Sort pods to prioritize the one starting with 'forklift-controller-'
  const sortedPods = pods.sort((a, b) => {
    const isForkliftControllerA = a?.metadata?.name?.startsWith('forklift-controller-') ? -1 : 0;
    const isForkliftControllerB = b?.metadata?.name?.startsWith('forklift-controller-') ? -1 : 0;
    return isForkliftControllerA - isForkliftControllerB;
  });

  const limitedPods = sortedPods?.slice(0, limit);

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedPods = limitedPods.slice(startIndex, endIndex);

  // Handlers for pagination
  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, page: number) => {
    setCurrentPage(page);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    selectedPerPage: number,
  ) => {
    setPerPage(selectedPerPage);
    setCurrentPage(1); // Reset to the first page
  };

  const getPodLogsLink = (pod: IoK8sApiCoreV1Pod) =>
    getResourceUrl({
      name: pod.metadata?.name,
      namespace: pod.metadata?.namespace,
      reference: 'pods',
    });

  if (!limitedPods || limitedPods.length === 0) {
    return (
      <HelperText>
        <HelperTextItem>{t('Pods not found')}</HelperTextItem>
      </HelperText>
    );
  }

  return (
    <>
      {limitedPods.length > 10 && (
        <Pagination
          itemCount={limitedPods.length} // Total number of pods
          perPage={perPage} // Items per page
          page={currentPage} // Current page
          onSetPage={onSetPage} // Handler for page change
          onPerPageSelect={onPerPageSelect} // Handler for items per page change
          variant="top" // Position of the pagination controls
        />
      )}
      <Table aria-label="Expandable table" variant="compact">
        <Thead>
          <Tr>
            <Th width={20}>{t('Pod')}</Th>
            {showOwner && <Th width={20}>{t('Owner')}</Th>}
            <Th width={10}>{t('Status')}</Th>
            <Th width={10}>{t('Logs')}</Th>
            <Th width={20}>{t('Created at')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedPods.map((pod) => (
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
              <Td>{pod?.status?.phase ? getStatusLabel(pod?.status?.phase) : ''}</Td>
              <Td>
                <Link to={`${getPodLogsLink(pod)}/logs`}>{t('Logs')}</Link>
              </Td>
              <Td>
                <ConsoleTimestamp timestamp={pod?.metadata?.creationTimestamp ?? ''} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {limitedPods.length > 10 && (
        <Pagination
          itemCount={limitedPods.length}
          perPage={perPage}
          page={currentPage}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
          variant="bottom" // Position of the pagination controls
        />
      )}
    </>
  );
};
