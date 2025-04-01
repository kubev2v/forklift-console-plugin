import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { OpenshiftVM, V1VirtualMachine } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AlignedDecimal } from './AlignedDecimal';

export const OpenshiftPlanResources: React.FC<{ planInventory: OpenshiftVM[] }> = ({
  planInventory,
}) => {
  const { t } = useForkliftTranslation();

  const planInventoryRunning = planInventory?.filter((vm) => vm?.object?.spec?.running);

  const totalResources = planInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + k8sCpuToCores(getK8sCPU(currentVM.object)),
        memoryMB:
          accumulator.memoryMB + k8sMemoryToBytes(getK8sVMMemory(currentVM.object)) / 2 ** 20,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + k8sCpuToCores(getK8sCPU(currentVM.object)),
        memoryMB:
          accumulator.memoryMB + k8sMemoryToBytes(getK8sVMMemory(currentVM.object)) / 2 ** 20,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const missingCPUInfo = planInventory.find(({ object }) => getK8sCPU(object) === '0');
  const missingMemoryInfo = planInventory.find(({ object }) => getK8sVMMemory(object) === '0Mi');

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
              {missingCPUInfo ? (
                <div className="forklift-page-plan-resources-td-integer">-</div>
              ) : (
                <AlignedDecimal value={totalResources.cpuCount} unit={'Cores'} />
              )}
            </Td>
            <Td width={10}>
              {missingCPUInfo ? (
                <div className="forklift-page-plan-resources-td-integer">-</div>
              ) : (
                <AlignedDecimal value={totalResourcesRunning.cpuCount} unit={'Cores'} />
              )}
            </Td>
          </Tr>
          <Tr>
            <Th width={10}>
              <strong>{t('Total memory:')}</strong>
            </Th>
            <Td width={10}>
              {missingMemoryInfo ? (
                <div className="forklift-page-plan-resources-td-integer">-</div>
              ) : (
                <AlignedDecimal value={totalResources.memoryMB} unit={'MB'} />
              )}
            </Td>
            <Td width={10}>
              {missingMemoryInfo ? (
                <div className="forklift-page-plan-resources-td-integer">-</div>
              ) : (
                <AlignedDecimal value={totalResourcesRunning.memoryMB} unit={'MB'} />
              )}
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </PageSection>
  );
};

const getK8sCPU = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.domain?.cpu?.cores || '0';
const getK8sVMMemory = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.resources.requests?.memory || '0Mi';

function k8sMemoryToBytes(memoryString) {
  const units = {
    E: 10 ** 18,
    EI: 2 ** 60,
    G: 10 ** 9,
    GI: 2 ** 30,
    // Decimal SI units (powers of 10)
    K: 10 ** 3,
    // Binary SI units (powers of 2)
    KI: 2 ** 10,
    M: 10 ** 6,
    MI: 2 ** 20,
    P: 10 ** 15,
    PI: 2 ** 50,
    T: 10 ** 12,
    TI: 2 ** 40,
  };

  // Enhance the regex to include both binary and decimal SI units
  const regex = /^(\d+)(Ki|Mi|Gi|Ti|Pi|Ei|K|M|G|T|P|E)?$/i;
  const match = memoryString.match(regex);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit) {
      // Normalize unit to handle case-insensitivity
      const normalizedUnit = unit.toUpperCase();
      return value * (units[normalizedUnit] || 1);
    }
    // Assuming plain bytes if no unit is specified
    return value;
  }
  throw new Error('Invalid memory string format');
}

function k8sCpuToCores(cpuString) {
  if (cpuString === undefined) {
    return undefined;
  }

  if (typeof cpuString === 'number') {
    return cpuString;
  }

  if (cpuString.endsWith('m')) {
    // Remove the "m" and convert to millicores, then to cores.
    const millicores = parseInt(cpuString.slice(0, -1), 10);
    return millicores / 1000.0; // Convert millicores to cores
  }
  // Directly parse the string as a float representing cores.
  return parseFloat(cpuString);
}
