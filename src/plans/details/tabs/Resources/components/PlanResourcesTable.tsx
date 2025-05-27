import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanResourcesTableProps } from '../utils/types';

import AlignedDecimal from './AlignedDecimal';

const PlanResourcesTable: FC<PlanResourcesTableProps> = ({
  planInventoryRunningSize,
  planInventorySize,
  totalResources,
  totalResourcesRunning,
}) => {
  const { t } = useForkliftTranslation();
  return (
    <PageSection variant="light">
      <SectionHeading text={t('Calculated resources')} />
      <Table variant="compact">
        <Thead>
          <Th></Th>
          <Th>{t('Total virtual machines')}</Th>
          <Th>{t('Running virtual machines')}</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td width={10}>
              <strong>{t('Virtual machines:')}</strong>
            </Td>
            <Td width={10}>
              <AlignedDecimal value={planInventorySize} fractionalPrecision={0} />
            </Td>
            <Td width={10}>
              <AlignedDecimal value={planInventoryRunningSize} fractionalPrecision={0} />
            </Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total CPU count:')}</strong>
            </Th>
            <Td width={10}>
              <AlignedDecimal value={totalResources.cpuCount} unit={t('Cores')} />
            </Td>
            <Td width={10}>
              <AlignedDecimal value={totalResourcesRunning.cpuCount} unit={t('Cores')} />
            </Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total memory:')}</strong>
            </Th>
            <Td width={10}>
              <AlignedDecimal value={totalResources.memoryMB} unit={'MB'} />
            </Td>
            <Td width={10}>
              <AlignedDecimal value={totalResourcesRunning.memoryMB} unit={'MB'} />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </PageSection>
  );
};

export default PlanResourcesTable;
