import { type FC, type KeyboardEvent, type MouseEvent, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import StatusIcon from 'src/components/status/StatusIcon';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Pod } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, Pagination, Tooltip } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { getKind, getName, getNamespace, getOwnerReference } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

type PodsTableProps = {
  pods: IoK8sApiCoreV1Pod[];
  showOwner?: boolean;
  limit?: number;
};

const PAGINATION_THRESHOLD = 10;

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

  const onSetPage = (_event: MouseEvent | KeyboardEvent | globalThis.MouseEvent, page: number) => {
    setCurrentPage(page);
  };

  const onPerPageSelect = (
    _event: MouseEvent | KeyboardEvent | globalThis.MouseEvent,
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

  if (!limitedPods || isEmpty(limitedPods)) {
    return (
      <HelperText>
        <HelperTextItem>{t('Pods not found')}</HelperTextItem>
      </HelperText>
    );
  }

  return (
    <>
      {limitedPods.length > PAGINATION_THRESHOLD && (
        <Pagination
          itemCount={limitedPods.length}
          perPage={perPage}
          page={currentPage}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
          variant="top"
        />
      )}
      <Table aria-label="Expandable table" variant="compact">
        <Thead>
          <Tr>
            <Th modifier="fitContent">{t('Pod')}</Th>
            {showOwner && <Th modifier="fitContent">{t('Owner')}</Th>}
            <Th modifier="fitContent">{t('Status')}</Th>
            <Th modifier="fitContent">{t('Logs')}</Th>
            <Th modifier="fitContent">{t('Created at')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedPods.map((pod) => (
            <Tr key={pod?.metadata?.uid}>
              <Td modifier="fitContent">
                <ResourceLink
                  kind={getKind(pod)}
                  name={getName(pod)}
                  namespace={getNamespace(pod)}
                />
              </Td>
              {showOwner && (
                <Td modifier="fitContent">
                  {getOwnerReference(pod) ? (
                    <ResourceLink
                      kind={getOwnerReference(pod)?.kind}
                      name={getOwnerReference(pod)?.name}
                      namespace={getNamespace(pod)}
                    />
                  ) : (
                    ''
                  )}
                </Td>
              )}
              <Td modifier="fitContent">
                {pod?.status?.phase ? (
                  <Tooltip content={pod.status.phase}>
                    <StatusIcon phase={pod.status.phase} />
                  </Tooltip>
                ) : (
                  ''
                )}
              </Td>
              <Td modifier="fitContent">
                <Link to={`${getPodLogsLink(pod)}/logs`}>{t('Logs')}</Link>
              </Td>
              <Td modifier="fitContent">
                <ConsoleTimestamp timestamp={pod?.metadata?.creationTimestamp ?? ''} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {limitedPods.length > PAGINATION_THRESHOLD && (
        <Pagination
          itemCount={limitedPods.length}
          perPage={perPage}
          page={currentPage}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
          variant="bottom"
        />
      )}
    </>
  );
};
