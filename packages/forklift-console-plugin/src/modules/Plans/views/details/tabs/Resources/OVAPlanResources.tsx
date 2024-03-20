import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@kubev2v/common';
import { OvaVM } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';

export const OVAPlanResources: React.FC<{ planInventory: OvaVM[] }> = ({ planInventory }) => {
  const { t } = useForkliftTranslation();

  const planInventoryRunning = planInventory?.filter((vm) => vm['powerState'] === 'poweredOn');

  const totalResources = planInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM['cpuCount'],
        memoryMB: accumulator.memoryMB + currentVM['memoryMB'],
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM['cpuCount'],
        memoryMB: accumulator.memoryMB + currentVM['memoryMB'],
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  return (
    <PageSection variant="light">
      <SectionHeading text={t('Calculated resources')} />
      <TableComposable variant="compact">
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
            <Td width={10}>{planInventory?.length}</Td>
            <Td width={10}>{planInventoryRunning?.length}</Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total CPU count:')}</strong>
            </Th>
            <Td width={10}>{totalResources.cpuCount} Cores</Td>
            <Td width={10}>{totalResourcesRunning.cpuCount} Cores</Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total memory:')}</strong>
            </Th>
            <Td width={10}>{totalResources.memoryMB} MB</Td>
            <Td width={10}>{totalResourcesRunning.memoryMB} MB</Td>
          </Tr>
        </Tbody>
      </TableComposable>
    </PageSection>
  );
};
