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
      <SectionHeading text={t('Resources')} />

      <Card>
        <Table variant="compact" borders>
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
              <Td>
                <AlignedDecimal value={planInventorySize} fractionalPrecision={0} />
              </Td>
              <Td>
                <AlignedDecimal value={planInventoryRunningSize} fractionalPrecision={0} />
              </Td>
            </Tr>
            <Tr>
              <Td>{t('Total CPU count')}</Td>
              <Td>
                <AlignedDecimal value={totalResources.cpuCount} unit={t('Cores')} />
              </Td>
              <Td>
                <AlignedDecimal value={totalResourcesRunning.cpuCount} unit={t('Cores')} />
              </Td>
            </Tr>
            <Tr>
              <Td>{t('Total memory')}</Td>
              <Td>
                <AlignedDecimal value={totalResources.memoryMB} unit={'MB'} />
              </Td>
              <Td>
                <AlignedDecimal value={totalResourcesRunning.memoryMB} unit={'MB'} />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Card>
    </PageSection>
  );
};

export default PlanResourcesTable;
