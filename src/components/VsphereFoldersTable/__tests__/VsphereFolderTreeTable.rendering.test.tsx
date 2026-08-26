import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

jest.mock('../hooks/useVsphereFolderTreeTable', () => ({
  useVsphereFolderTreeTable: () => ({
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
    itemCount: 0,
    onPerPageSelect: jest.fn(),
    onSetPage: jest.fn(),
    page: 1,
    pagedRows: [],
    perPage: 10,
    provider: undefined,
    rows: [],
    selectedVmKeys: [],
    setColumns: jest.fn(),
    setInspectionExpandedRows: jest.fn(),
    setSelectedVmKeys: jest.fn(),
    setShowAll: jest.fn(),
    showAll: true,
    sortBy: { column: 'name', direction: 'asc' },
    visibleCols: [{ isVisible: true, label: 'Name', resourceFieldId: 'name' }],
  }),
}));

jest.mock('../components/TreeToolbar/TreeToolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="tree-toolbar" />,
}));

jest.mock('../components/TreeTableBody/TreeTableBody', () => ({
  __esModule: true,
  default: () => <div data-testid="tree-table-body" />,
}));

jest.mock('../components/VsphereFolderTreeTableHead', () => ({
  __esModule: true,
  default: () => <thead data-testid="tree-table-head" />,
}));

import { render, screen } from '@testing-library/react';

import VsphereFolderTreeTable from '../VsphereFolderTreeTable';

describe('VsphereFolderTreeTable - rendering', () => {
  it('renders toolbar, head, and body from hook state', () => {
    render(
      <VsphereFolderTreeTable
        foldersDict={{}}
        hostsDict={{}}
        initialSelectedIds={[]}
        onSelect={jest.fn()}
        vmData={[]}
      />,
    );

    expect(screen.getByTestId('tree-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('tree-table-head')).toBeInTheDocument();
    expect(screen.getByTestId('tree-table-body')).toBeInTheDocument();
  });
});
