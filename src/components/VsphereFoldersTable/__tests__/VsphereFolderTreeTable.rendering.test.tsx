import type { ReactElement } from 'react';

import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

const mockTableState = {
  attributes: [],
  canInspect: false,
  canSelect: true,
  columns: [{ isVisible: true, label: 'Name', resourceFieldId: 'name' }],
  conversions: [],
  disabledReason: undefined,
  filteredGroupVMCountByFolder: new Map(),
  filters: {
    activeId: 'name',
    checks: {},
    chipsByAttr: {},
    clearAll: jest.fn(),
    clearText: jest.fn(),
    deleteChip: jest.fn(),
    deleteChipGroup: jest.fn(),
    setActiveId: jest.fn(),
    setTextValue: jest.fn(),
    text: {},
    toggleCheck: jest.fn(),
  },
  groupVMCountByFolder: new Map(),
  handleOnSort: jest.fn(),
  inspectionExpandedRows: new Set(),
  itemCount: 3,
  onPerPageSelect: jest.fn(),
  onSetPage: jest.fn(),
  page: 1,
  pagedRows: [],
  perPage: 10,
  provider: { metadata: { name: 'vsphere', namespace: 'ns' } },
  rows: [],
  selectedVmKeys: [],
  setColumns: jest.fn(),
  setInspectionExpandedRows: jest.fn(),
  setSelectedVmKeys: jest.fn(),
  setShowAll: jest.fn(),
  showAll: true,
  sortBy: { column: 'name', direction: 'asc' },
  visibleCols: [{ isVisible: true, label: 'Name', resourceFieldId: 'name' }],
};

jest.mock('../hooks/useVsphereFolderTreeTable', () => ({
  useVsphereFolderTreeTable: (): typeof mockTableState => mockTableState,
}));

jest.mock('../components/TreeToolbar/TreeToolbar', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="tree-toolbar" />,
}));

jest.mock('../components/TreeTableBody/TreeTableBody', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="tree-table-body" />,
}));

jest.mock('../components/VsphereFolderTreeTableHead', () => ({
  __esModule: true,
  default: (): ReactElement => <thead data-testid="tree-table-head" />,
}));

jest.mock('@components/InspectVirtualMachines/InspectVirtualMachinesButton', () => ({
  __esModule: true,
  default: (): ReactElement => <button data-testid="inspect-vms" type="button" />,
}));

import { render, screen } from '@testing-library/react';

import VsphereFolderTreeTable from '../VsphereFolderTreeTable';

const defaultProps = {
  foldersDict: {},
  hostsDict: {},
  initialSelectedIds: [] as string[],
  onSelect: jest.fn(),
  vmData: [],
};

describe('VsphereFolderTreeTable - rendering', () => {
  beforeEach(() => {
    mockTableState.canSelect = true;
  });

  it('renders mocked children and bottom pagination from hook state', () => {
    render(<VsphereFolderTreeTable {...defaultProps} />);

    expect(screen.getByTestId('tree-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('tree-table-head')).toBeInTheDocument();
    expect(screen.getByTestId('tree-table-body')).toBeInTheDocument();
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
  });

  it('shows section heading when selection is disabled', () => {
    mockTableState.canSelect = false;
    render(
      <VsphereFolderTreeTable {...defaultProps} provider={mockTableState.provider as never} />,
    );

    expect(screen.getByText('Virtual machines')).toBeInTheDocument();
  });
});
