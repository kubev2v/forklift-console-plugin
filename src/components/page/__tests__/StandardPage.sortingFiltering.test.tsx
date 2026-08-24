import { beforeEach, describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StandardPage from '../StandardPage';

import { fieldsMetadata, mockData, renderWithRouter } from './standardPage.fixtures';

describe('StandardPage - sorting and filtering', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should allow sorting by clicking column headers', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <StandardPage
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
      />,
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader).toBeInTheDocument();

    await user.click(nameHeader);

    const items = screen.getAllByText(/Item \d/);
    expect(items[0]).toHaveTextContent('Item 3');
    expect(items[1]).toHaveTextContent('Item 2');
    expect(items[2]).toHaveTextContent('Item 1');
  });

  it('should render filter controls when filter is defined', () => {
    renderWithRouter(
      <StandardPage
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
      />,
    );

    const filterButton = screen.getByRole('button', { name: /show filters/i });
    expect(filterButton).toBeInTheDocument();

    expect(screen.getByText('Item 1')).toBeVisible();
    expect(screen.getByText('Item 2')).toBeVisible();
    expect(screen.getByText('Item 3')).toBeVisible();
  });

  it('should show no results message when data is empty after filtering', () => {
    renderWithRouter(
      <StandardPage
        dataSource={[[], true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
      />,
    );

    expect(screen.getByText(/no results found/i)).toBeVisible();
  });
});

describe('StandardPage - pagination', () => {
  const largeDataSet = Array.from({ length: 25 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Item ${i + 1}`,
    status: 'Ready',
  }));

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should render data when pagination is enabled', () => {
    renderWithRouter(
      <StandardPage
        dataSource={[largeDataSet, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        pagination={10}
      />,
    );

    expect(screen.getByText('Item 1')).toBeVisible();
    expect(screen.getByText('Item 10')).toBeInTheDocument();
  });

  it('should not render pagination when data fits on one page', () => {
    renderWithRouter(
      <StandardPage
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        pagination={10}
      />,
    );

    expect(screen.queryByText(/of 3/i)).not.toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeVisible();
    expect(screen.getByText('Item 3')).toBeVisible();
  });
});
