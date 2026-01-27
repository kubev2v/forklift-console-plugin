import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import SectionHeading from '@components/headers/SectionHeading';
import type { IoK8sApiCoreV1PersistentVolumeClaim } from '@forklift-ui/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import { PersistentVolumeClaimModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationPVCsTableProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
};

const MigrationPVCsTable: FC<MigrationPVCsTableProps> = ({ pvcs }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(pvcs)) {
    return null;
  }
  return (
    <>
      <SectionHeading
        text={t('PersistentVolumeClaims')}
        headingLevel="h3"
        className="migration-status-expanded-page__resource-list-header"
      />
      <Table>
        <Thead>
          <Tr>
            <Th width={40}>{t('Name')}</Th>
            <Th width={20}>{t('Description')}</Th>
            <Th>{t('Created at')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(pvcs || []).map((pvc) => (
            <Tr key={getUID(pvc)}>
              <Td width={40}>
                <ResourceLink
                  groupVersionKind={PersistentVolumeClaimModelGroupVersionKind}
                  name={getName(pvc)}
                  namespace={getNamespace(pvc)}
                />
              </Td>
              <Td width={20}>{pvc?.status?.phase ?? EMPTY_MSG}</Td>
              <Td>
                <ConsoleTimestamp
                  timestamp={pvc?.metadata?.creationTimestamp}
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

export default MigrationPVCsTable;
