import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OpenstackVM } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AlignedDecimal } from './AlignedDecimal';

export const OpenstackPlanResources: React.FC<{ planInventory: OpenstackVM[] }> = ({
  planInventory,
}) => {
  const { t } = useForkliftTranslation();

  const planInventoryRunning = planInventory?.filter((vm) => vm?.status === 'ACTIVE');

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
              <AlignedDecimal value={planInventory?.length} />
            </Td>
            <Td width={10}>
              <AlignedDecimal value={planInventoryRunning?.length} />
            </Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total CPU count:')}</strong>
            </Th>
            <Td width={10}>
              <div className="forklift-page-plan-resources-td-integer">-</div>
            </Td>
            <Td width={10}>
              <div className="forklift-page-plan-resources-td-integer">-</div>
            </Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total memory:')}</strong>
            </Th>
            <Td width={10}>
              <div className="forklift-page-plan-resources-td-integer">-</div>
            </Td>
            <Td width={10}>
              <div className="forklift-page-plan-resources-td-integer">-</div>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </PageSection>
  );
};
