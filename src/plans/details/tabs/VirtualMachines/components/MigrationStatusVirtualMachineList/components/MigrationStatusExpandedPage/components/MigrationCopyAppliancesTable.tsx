import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import SectionHeading from '@components/headers/SectionHeading';
import { ResourceLink, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CopyApplianceModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationCopyAppliancesTableProps = {
  copyAppliances: (K8sResourceCommon & { status?: { phase?: string } })[];
};

const MigrationCopyAppliancesTable: FC<MigrationCopyAppliancesTableProps> = ({
  copyAppliances,
}) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(copyAppliances)) {
    return null;
  }

  return (
    <>
      <SectionHeading
        className="migration-status-expanded-page__resource-list-header"
        headingLevel="h3"
        text={t('Copy appliances')}
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
          {copyAppliances.map((copyAppliance) => (
            <Tr key={getUID(copyAppliance)}>
              <Td width={40}>
                <ResourceLink
                  groupVersionKind={CopyApplianceModelGroupVersionKind}
                  name={getName(copyAppliance)}
                  namespace={getNamespace(copyAppliance)}
                />
              </Td>
              <Td width={20}>{copyAppliance.status?.phase}</Td>
              <Td>
                <ConsoleTimestamp
                  showGlobalIcon={false}
                  timestamp={copyAppliance.metadata?.creationTimestamp ?? null}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default MigrationCopyAppliancesTable;
