import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { Card, PageSection } from '@patternfly/react-core';
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
    <PageSection hasBodyWrapper={false}>
      <SectionHeading testId="plan-resources-heading" text={t('Utilization')} />

      <Card>
        <Table borders data-testid="plan-resources-table" variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Resource')}</Th>
              <Th>{t('Total virtual machines')}</Th>
              <Th>{t('Running virtual machines')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{t('Virtual machines')}</Td>
              <Td data-testid="resources-vms-total">
                <AlignedDecimal fractionalPrecision={0} value={planInventorySize} />
              </Td>
              <Td data-testid="resources-vms-running">
                <AlignedDecimal fractionalPrecision={0} value={planInventoryRunningSize} />
              </Td>
            </Tr>
            <Tr>
              <Td>{t('Total CPU count')}</Td>
              <Td data-testid="resources-cpu-total">
                <AlignedDecimal unit={t('Cores')} value={totalResources.cpuCount} />
              </Td>
              <Td data-testid="resources-cpu-running">
                <AlignedDecimal unit={t('Cores')} value={totalResourcesRunning.cpuCount} />
              </Td>
            </Tr>
            <Tr>
              <Td>{t('Total memory')}</Td>
              <Td data-testid="resources-memory-total">
                <AlignedDecimal unit={'MB'} value={totalResources.memoryMB} />
              </Td>
              <Td data-testid="resources-memory-running">
                <AlignedDecimal unit={'MB'} value={totalResourcesRunning.memoryMB} />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Card>
    </PageSection>
  );
};

export default PlanResourcesTable;
