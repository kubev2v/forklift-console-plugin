import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { Table, Tbody } from '@patternfly/react-table';
import { render, screen } from '@testing-library/react';

import TreeTableEmptyState from '../TreeTableEmptyState';

describe('TreeTableEmptyState - empty', () => {
  it('shows plain empty state when no filters are applied', () => {
    render(
      <Table>
        <Tbody>
          <TreeTableEmptyState clearAllFilters={jest.fn()} colSpan={4} hasFiltersApplied={false} />
        </Tbody>
      </Table>,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear all filters' })).not.toBeInTheDocument();
    expect(
      screen.queryByText('No results match the filter criteria. Clear all filters and try again.'),
    ).not.toBeInTheDocument();
  });
});
