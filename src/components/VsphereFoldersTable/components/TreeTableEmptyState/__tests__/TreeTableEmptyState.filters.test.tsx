import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { Table, Tbody } from '@patternfly/react-table';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TreeTableEmptyState from '../TreeTableEmptyState';

describe('TreeTableEmptyState - filters', () => {
  it('shows clear-filters CTA when filters are applied', async () => {
    const user = userEvent.setup();
    const clearAllFilters = jest.fn();

    render(
      <Table>
        <Tbody>
          <TreeTableEmptyState clearAllFilters={clearAllFilters} colSpan={3} hasFiltersApplied />
        </Tbody>
      </Table>,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText('No results match the filter criteria. Clear all filters and try again.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(clearAllFilters).toHaveBeenCalledTimes(1);
  });
});
