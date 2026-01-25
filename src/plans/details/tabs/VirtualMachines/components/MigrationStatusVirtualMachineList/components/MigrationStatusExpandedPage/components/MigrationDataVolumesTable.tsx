import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import type { V1beta1DataVolume } from '@forklift-ui/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DataVolumeModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationDataVolumesTableProps = {
  dvs: V1beta1DataVolume[];
};

const MigrationDataVolumesTable: FC<MigrationDataVolumesTableProps> = ({ dvs }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(dvs)) {
    return null;
  }

  return (
    <>
      <SectionHeading
        className="migration-status-expanded-page__resource-list-header"
        headingLevel="h3"
        text={t('DataVolumes')}
      />
      <Table>
        <Thead>
          <Tr>
            <Th width={40}>{t('Name')}</Th>
            <Th>{t('Description')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dvs.map((dv) => (
            <Tr key={getUID(dv)}>
              <Td width={40}>
                <ResourceLink
                  groupVersionKind={DataVolumeModelGroupVersionKind}
                  name={getName(dv)}
                  namespace={getNamespace(dv)}
                />
              </Td>
              <Td>
                <Status status={dv?.status?.phase ?? ''} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default MigrationDataVolumesTable;
