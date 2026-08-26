import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';

import type { AttributeFilters } from '../../AttributeFilter/hooks/useAttributeFilters';
import {
  AttributeKind,
  type AttributeConfig,
} from '../../AttributeFilter/utils/types';
import type { VmRow } from '../../../utils/types';
import TreeToolbar from '../TreeToolbar';

jest.mock('@components/page/ManageColumnsToolbar', () => ({
  ManageColumnsToolbar: () => <div data-testid="manage-columns" />,
}));

jest.mock('@components/TableBulkSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="bulk-select" />,
}));

jest.mock('@components/SelectedToggle/SelectedToggle', () => ({
  __esModule: true,
  default: () => <div data-testid="selected-toggle" />,
}));

jest.mock('../../AttributeFilter/AttributeFilter', () => ({
  AttributeFiltersToolbar: () => <div data-testid="attribute-filters" />,
}));

const filters = {
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
} as unknown as AttributeFilters<VmRow>;

const attributes: AttributeConfig<VmRow>[] = [
  { getValue: () => '', id: 'name', kind: AttributeKind.Text, label: 'VM name' },
];

describe('TreeToolbar', () => {
  it('renders selection controls when canSelect is true', () => {
    render(
      <TreeToolbar
        attributes={attributes}
        canSelect
        columns={[]}
        dataIds={['vm-1']}
        filters={filters}
        onSelect={jest.fn()}
        pageDataIds={['vm-1']}
        pagination={<div data-testid="pagination" />}
        selectedVmKeys={['vm-1']}
        setColumns={jest.fn()}
        setShowAll={jest.fn()}
        showAll
      />,
    );

    expect(screen.getByTestId('bulk-select')).toBeInTheDocument();
    expect(screen.getByTestId('selected-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('attribute-filters')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('hides selection controls when canSelect is false', () => {
    render(
      <TreeToolbar
        attributes={attributes}
        canSelect={false}
        columns={[]}
        dataIds={[]}
        filters={filters}
        onSelect={jest.fn()}
        pageDataIds={[]}
        pagination={null}
        selectedVmKeys={[]}
        setColumns={jest.fn()}
        setShowAll={jest.fn()}
        showAll
      />,
    );

    expect(screen.queryByTestId('bulk-select')).not.toBeInTheDocument();
    expect(screen.queryByTestId('selected-toggle')).not.toBeInTheDocument();
  });
});
