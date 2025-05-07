import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import type { IoK8sApiBatchV1Job } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { JobModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getJobPhase } from '../../utils/utils';

type MigrationJobsTableProps = {
  jobs: IoK8sApiBatchV1Job[];
};

const MigrationJobsTable: FC<MigrationJobsTableProps> = ({ jobs }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(jobs)) {
    return null;
  }
  return (
    <>
      <SectionHeading
        className="migration-status-expanded-page__resource-list-header"
        textComponent="h3"
        text={t('Jobs')}
      />
      <Table>
        <Thead>
          <Tr>
            <Th width={40}>{t('Name')}</Th>
            <Th>{t('Status')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {jobs.map((job) => (
            <Tr key={getUID(job)}>
              <Td width={40}>
                <ResourceLink
                  groupVersionKind={JobModelGroupVersionKind}
                  name={getName(job)}
                  namespace={getNamespace(job)}
                />
              </Td>
              <Td>
                <Status status={getJobPhase(job)}></Status>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default MigrationJobsTable;
