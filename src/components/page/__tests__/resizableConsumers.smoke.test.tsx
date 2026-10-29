import { MemoryRouter } from 'react-router';
import { ProviderVirtualMachinesList } from 'src/providers/details/tabs/VirtualMachines/components/ProviderVirtualMachinesList';
import type { VmData } from 'src/providers/details/tabs/VirtualMachines/components/VMCellProps';
import { HypervVirtualMachinesCells } from 'src/providers/details/tabs/VirtualMachines/HypervVirtualMachinesRow';
import { OvaVirtualMachinesCells } from 'src/providers/details/tabs/VirtualMachines/OvaVirtualMachinesRow';
import { OVirtVirtualMachinesCells } from 'src/providers/details/tabs/VirtualMachines/OVirtVirtualMachinesRow';

import type { ResourceField } from '@components/common/utils/types';
import InspectionVmTable from '@components/InspectVirtualMachines/InspectionVmTable';
import type { InspectionVmRowData } from '@components/InspectVirtualMachines/utils/types';
import { describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EMPTY_MSG } from '@utils/constants';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { StandardPageWithSelection } from '../StandardPageWithSelection';

import { renderWithRouter } from './standardPageWithSelection.fixtures';

const inspectionRows: InspectionVmRowData[] = [
  {
    id: 'vm-1',
    inspectionStatus: INSPECTION_STATUS.NOT_INSPECTED,
    isActive: false,
    name: 'VM one',
  },
  { id: 'vm-2', inspectionStatus: INSPECTION_STATUS.RUNNING, isActive: true, name: 'VM two' },
];

const vmFields: ResourceField[] = [
  { isIdentity: true, isVisible: true, label: 'Name', resourceFieldId: 'name' },
  { isVisible: true, label: 'Guest OS', resourceFieldId: 'guestOS' },
  { isVisible: true, label: 'Concerns', resourceFieldId: 'concerns' },
];

const assertAlignedRow = (table: HTMLElement, name: string): HTMLElement => {
  const row = within(table)
    .getAllByRole('row')
    .find((candidate) => within(candidate).queryByText(name));
  expect(row).toBeDefined();
  const headers = within(table)
    .getAllByRole('columnheader')
    .map((header) => header.getAttribute('data-column-id'));
  const cells = within(row as HTMLElement)
    .getAllByRole('cell')
    .map((cell) => cell.getAttribute('data-column-id'));
  expect(cells).toEqual(headers);
  return row as HTMLElement;
};

const getCellByColumnId = (row: HTMLElement, id: string): HTMLElement => {
  const cell = within(row)
    .getAllByRole('cell')
    .find((candidate) => candidate.getAttribute('data-column-id') === id);
  expect(cell).toBeDefined();
  return cell as HTMLElement;
};

describe('real resizable table rows', () => {
  it('aligns inspection rows and disables selection for an active VM without an expand column', () => {
    renderWithRouter(
      <InspectionVmTable onSelect={jest.fn()} selectedIds={[]} vmRows={inspectionRows} />,
    );

    const table = screen.getByRole('grid');
    assertAlignedRow(table, 'VM one');
    const activeRow = assertAlignedRow(table, 'VM two');
    expect(within(activeRow).getByRole('checkbox')).toBeDisabled();
    expect(within(table).queryByRole('button', { name: /Details/u })).not.toBeInTheDocument();
  });

  it('aligns expanded inspection content with selection and data columns', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <InspectionVmTable
        isProviderFlow
        onSelect={jest.fn()}
        onVmOverrideChange={jest.fn()}
        selectedIds={[]}
        vmRows={inspectionRows}
      />,
    );

    const table = screen.getByRole('grid');
    assertAlignedRow(table, 'VM one');
    expect(within(table).getAllByRole('button', { name: /Details/u })).toHaveLength(2);
    await user.click(within(table).getAllByRole('button', { name: /Details/u })[0]);

    const expandedCell = within(table)
      .getAllByRole('cell')
      .find((cell) => within(cell).queryByText('Disk decryption passphrases'));
    expect(expandedCell).toHaveAttribute(
      'colspan',
      String(within(table).getAllByRole('columnheader').length - 1),
    );
    assertAlignedRow(table, 'VM one');
  });

  it.each([
    ['Hyper-V', PROVIDER_TYPES.hyperv, HypervVirtualMachinesCells],
    ['oVirt', PROVIDER_TYPES.ovirt, OVirtVirtualMachinesCells],
    ['OVA', PROVIDER_TYPES.ova, OvaVirtualMachinesCells],
  ])('keeps %s empty guest and concern cells inside their own columns', (_label, type, Cells) => {
    const vmData: VmData = {
      name: 'VM without metadata',
      namespace: 'test',
      vm: { concerns: [], providerType: type } as unknown as VmData['vm'],
    };
    renderWithRouter(
      <StandardPageWithSelection<VmData>
        cell={Cells}
        dataSource={[[vmData], true, null]}
        fieldsMetadata={vmFields}
        onSelect={jest.fn()}
        resizableColumns
        selectedIds={[]}
        toId={(vm): string => vm.name}
      />,
    );

    const table = screen.getByRole('grid');
    const row = assertAlignedRow(table, vmData.name);
    expect(getCellByColumnId(row, 'guestOS')).toHaveTextContent(EMPTY_MSG);
    expect(getCellByColumnId(row, 'concerns')).toHaveTextContent(EMPTY_MSG);
  });

  it('keeps a provider VM expanded after a refreshed watch payload', async () => {
    const user = userEvent.setup();
    const vmData: VmData = {
      name: 'Provider VM',
      namespace: 'test',
      vm: {
        concerns: [],
        id: 'provider-vm-1',
        providerType: PROVIDER_TYPES.hyperv,
      } as unknown as VmData['vm'],
    };
    const props = {
      cellMapper: HypervVirtualMachinesCells,
      fieldsMetadata: vmFields,
      pageId: 'provider-vm-resizable-smoke',
      showActions: false,
    };
    const { rerender } = renderWithRouter(
      <ProviderVirtualMachinesList {...props} obj={{ vmData: [vmData] }} />,
    );

    await user.click(screen.getByRole('button', { name: /Details/u }));
    expect(screen.getByText('No concerns found for this virtual machine.')).toBeVisible();

    rerender(
      <MemoryRouter>
        <ProviderVirtualMachinesList
          {...props}
          obj={{ vmData: [{ ...vmData, name: 'Refreshed provider VM' }] }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Refreshed provider VM')).toBeVisible();
    expect(screen.getByText('No concerns found for this virtual machine.')).toBeVisible();
  });
});
