import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import SectionHeading from '@components/headers/SectionHeading';
import type { IoK8sApiCoreV1Pod } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Stack } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { PodModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationPodsTableProps = {
  pods: IoK8sApiCoreV1Pod[];
};

const getPodLogsLink = (pod: IoK8sApiCoreV1Pod) =>
  getResourceUrl({
    name: getName(pod),
    namespace: getNamespace(pod),
    reference: 'pods',
  });

const MigrationPodsTable: FC<MigrationPodsTableProps> = ({ pods }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(pods)) {
    return null;
  }

  return (
    <>
      <SectionHeading
        text={t('Pods')}
        textComponent="h3"
        className="migration-status-expanded-page__resource-list-header"
      />
      <Table>
        <Thead>
          <Tr>
            <Th width={40}>{t('Name')}</Th>
            <Th width={20}>{t('Description')}</Th>
            <Th>{t('Completed at')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pods.map((pod) => (
            <Tr key={getUID(pod)}>
              <Td width={40}>
                <ResourceLink
                  groupVersionKind={PodModelGroupVersionKind}
                  name={getName(pod)}
                  namespace={getNamespace(pod)}
                />
              </Td>
              <Td width={20}>
                <Stack>
                  <>{pod?.status?.phase}</>
                  <Link to={`${getPodLogsLink(pod)}/logs`}>{t('View logs')}</Link>
                </Stack>
              </Td>
              <Td>
                <ConsoleTimestamp
                  timestamp={pod?.metadata?.creationTimestamp}
                  showGlobalIcon={false}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default MigrationPodsTable;
