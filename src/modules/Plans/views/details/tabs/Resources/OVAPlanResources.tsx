import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OvaVM } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AlignedDecimal } from './AlignedDecimal';

export const OVAPlanResources: React.FC<{ planInventory: OvaVM[] }> = ({ planInventory }) => {
  const { t } = useForkliftTranslation();

  const planInventoryRunning = planInventory?.filter((vm) => vm.powerState === 'poweredOn');

  const totalResources = planInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCount,
        memoryMB: accumulator.memoryMB + currentVM.memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCount,
        memoryMB: accumulator.memoryMB + currentVM.memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

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
              <AlignedDecimal value={totalResources.cpuCount} unit={'Cores'} />
            </Td>
            <Td width={10}>
              <AlignedDecimal value={totalResourcesRunning.cpuCount} unit={'Cores'} />
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
