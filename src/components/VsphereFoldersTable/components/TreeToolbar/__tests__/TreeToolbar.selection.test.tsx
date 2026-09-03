import type { ReactElement } from 'react';

import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';

import type { VmRow } from '../../../utils/types';
import type { AttributeFilters } from '../../AttributeFilter/hooks/useAttributeFilters';
import { type AttributeConfig, AttributeKind } from '../../AttributeFilter/utils/types';
import TreeToolbar from '../TreeToolbar';

jest.mock('@components/page/ManageColumnsToolbar', () => ({
  ManageColumnsToolbar: (): ReactElement => <div data-testid="manage-columns" />,
}));

const bulkSelectProps: { current: Record<string, unknown> | undefined } = { current: undefined };

jest.mock('@components/TableBulkSelect', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>): ReactElement => {
    bulkSelectProps.current = props;
    return <div data-testid="bulk-select" />;
  },
}));

jest.mock('@components/SelectedToggle/SelectedToggle', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>): ReactElement => (
    <div data-selected={String(props.selectedVmKeys)} data-testid="selected-toggle" />
  ),
}));

jest.mock('../../AttributeFilter/AttributeFilter', () => ({
  AttributeFiltersToolbar: (): ReactElement => <div data-testid="attribute-filters" />,
}));

const filters = {
  activeId: 'name',
  checks: {},
  chipsByAttr: {},
  clearAll: jest.fn(),
  clearChecks: jest.fn(),
  clearText: jest.fn(),
  deleteChip: jest.fn(),
  deleteChipGroup: jest.fn(),
  hasAttrFilters: false,
  predicate: (): boolean => true,
  setActiveId: jest.fn(),
  setTextValue: jest.fn(),
  text: {},
  toggleCheck: jest.fn(),
} satisfies AttributeFilters<VmRow>;

const attributes: AttributeConfig<VmRow>[] = [
  { getValue: () => '', id: 'name', kind: AttributeKind.Text, label: 'VM name' },
];

describe('TreeToolbar', () => {
  it('renders selection controls when canSelect is true', () => {
    const onSelect = jest.fn();
    render(
      <TreeToolbar
        attributes={attributes}
        canSelect
        columns={[]}
        dataIds={['vm-1', 'vm-2']}
        filters={filters}
        onSelect={onSelect}
        pageDataIds={['vm-1']}
        pagination={<div data-testid="pagination" />}
        selectedVmKeys={['vm-1']}
        setColumns={jest.fn()}
        setShowAll={jest.fn()}
        showAll
      />,
    );

    expect(screen.getByTestId('bulk-select')).toBeInTheDocument();
    expect(bulkSelectProps.current).toMatchObject({
      dataIds: ['vm-1', 'vm-2'],
      onSelect,
      pageDataIds: ['vm-1'],
      selectedIds: ['vm-1'],
    });
    expect(screen.getByTestId('selected-toggle')).toHaveAttribute('data-selected', 'vm-1');
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
    expect(screen.getByTestId('attribute-filters')).toBeInTheDocument();
    expect(screen.getByTestId('manage-columns')).toBeInTheDocument();
  });
});
