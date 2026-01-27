import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import SectionHeading from '@components/headers/SectionHeading';
import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { VirtualMachineModelGroupVersionKind } from '@utils/crds/common/models';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationVirtualMachineTableProps = {
  vmCreated: boolean;
  statusVM: V1beta1PlanStatusMigrationVms | undefined;
  targetNamespace: string;
};

const MigrationVirtualMachineTable: FC<MigrationVirtualMachineTableProps> = ({
  statusVM,
  targetNamespace,
  vmCreated,
}) => {
  const { t } = useForkliftTranslation();
  if (!vmCreated) {
    return null;
  }

  return (
    <>
      <SectionHeading
        text={t('Virtual machine')}
        headingLevel="h3"
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
          <Tr key="vm">
            <Td width={40}>
              <ResourceLink
                groupVersionKind={VirtualMachineModelGroupVersionKind}
                name={statusVM?.newName ?? statusVM?.name}
                namespace={targetNamespace}
              />
            </Td>
            <Td width={20}>{vmCreated ? t('Migrated') : t('Not yet migrated')}</Td>
            <Td>
              <ConsoleTimestamp showGlobalIcon={false} timestamp={statusVM?.completed} />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  );
};

export default MigrationVirtualMachineTable;
