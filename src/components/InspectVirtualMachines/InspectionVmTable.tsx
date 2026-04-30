import type { FC } from 'react';

import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import type { VmInspectionStatus } from '../../utils/hooks/useVmInspectionStatus';

import InspectionStatusLabel from './InspectionStatusLabel';

type VmRow = {
  id: string;
  isActive: boolean;
  name: string;
};

type InspectionVmTableProps = {
  getVmInspectionStatus: (vmId: string) => VmInspectionStatus | undefined;
  selectableCount: number;
  selectedCount: number;
  selectedVmIds: Set<string>;
  toggleSelectAll: () => void;
  toggleVmSelection: (vmId: string) => void;
  vmRows: VmRow[];
};

const InspectionVmTable: FC<InspectionVmTableProps> = ({
  getVmInspectionStatus,
  selectableCount,
  selectedCount,
  selectedVmIds,
  toggleSelectAll,
  toggleVmSelection,
  vmRows,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            {t('{{selected}} of {{total}} VMs selected', {
              selected: selectedCount,
              total: selectableCount,
            })}
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label={t('Virtual machines for inspection')} variant="compact">
        <Thead>
          <Tr>
            <Th
              select={{
                isSelected: selectedCount === selectableCount && selectedCount > 0,
                onSelect: toggleSelectAll,
              }}
            />
            <Th>{t('VM Name')}</Th>
            <Th>{t('VM ID')}</Th>
            <Th>{t('Inspection status')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vmRows.map((vm) => {
            const status = getVmInspectionStatus(vm.id);
            return (
              <Tr key={vm.id}>
                <Td
                  select={{
                    isDisabled: vm.isActive,
                    isSelected: selectedVmIds.has(vm.id),
                    onSelect: () => {
                      toggleVmSelection(vm.id);
                    },
                    rowIndex: 0,
                  }}
                />
                <Td dataLabel={t('VM Name')}>{vm.name}</Td>
                <Td dataLabel={t('VM ID')}>{vm.id}</Td>
                <Td dataLabel={t('Inspection status')}>
                  <InspectionStatusLabel phase={status?.phase} timestamp={status?.lastRun} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};

export default InspectionVmTable;
