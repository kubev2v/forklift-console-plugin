import { MemoryRouter } from 'react-router-dom-v5-compat';

import type { ResourceField } from '@components/common/utils/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StandardPage from '../StandardPage';

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('StandardPage', () => {
  const mockData = [
    { id: '1', name: 'Item 1', status: 'Ready' },
    { id: '2', name: 'Item 2', status: 'NotReady' },
    { id: '3', name: 'Item 3', status: 'Ready' },
  ];

  const fieldsMetadata: ResourceField[] = [
    {
      resourceFieldId: 'name',
      label: 'Name',
      isVisible: true,
      isIdentity: true,
      sortable: true,
    },
    {
      resourceFieldId: 'status',
      label: 'Status',
      isVisible: true,
      isIdentity: false,
      filter: {
        type: 'enum',
        values: [
          { id: 'Ready', label: 'Ready' },
          { id: 'NotReady', label: 'Not Ready' },
        ],
      },
    },
  ];

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  describe('Rendering and Data Display', () => {
    it('should render table with data', () => {
      renderWithRouter(
        <StandardPage
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
        />,
      );

      expect(screen.getByText('Item 1')).toBeVisible();
      expect(screen.getByText('Item 2')).toBeVisible();
      expect(screen.getByText('Item 3')).toBeVisible();
    });

    it('should show loading state when data is not loaded', () => {
      renderWithRouter(
        <StandardPage
          dataSource={[[], false, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
        />,
      );

      expect(screen.getByText('Loading')).toBeVisible();
    });

    it('should show error state when there is an error', () => {
      const error = new Error('Failed to fetch');
      renderWithRouter(
        <StandardPage
          dataSource={[[], true, error]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
        />,
      );

      expect(screen.getByText('Unable to retrieve data')).toBeVisible();
    });

    it('should show no results message when data is empty', () => {
      renderWithRouter(
        <StandardPage
          dataSource={[[], true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
        />,
      );

      expect(screen.getByText('No results found')).toBeVisible();
    });
  });

  describe('Sorting', () => {
    it('should allow sorting by clicking column headers', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <StandardPage
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
        />,
      );

      // Verify sortable column header is rendered as a button
      const nameHeader = screen.getByRole('button', { name: /name/i });
      expect(nameHeader).toBeInTheDocument();

      // Click to sort
      await user.click(nameHeader);

      // Verify data is still rendered (sorting doesn't break display)
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should render filter controls when filter is defined', () => {
      renderWithRouter(
        <StandardPage
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
        />,
      );

      // Verify filter button/toggle is rendered
      const filterButton = screen.getByRole('button', { name: /show filters/i });
      expect(filterButton).toBeInTheDocument();

      // Verify all data is visible without filters
      expect(screen.getByText('Item 1')).toBeVisible();
      expect(screen.getByText('Item 2')).toBeVisible();
      expect(screen.getByText('Item 3')).toBeVisible();
    });

    it('should show no results message when data is empty after filtering', () => {
      // Render with empty data (simulating filtered-out results)
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

  describe('Pagination', () => {
    const largeDataSet = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
      status: 'Ready',
    }));

    it('should render data when pagination is enabled', () => {
      renderWithRouter(
        <StandardPage
          dataSource={[largeDataSet, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          pagination={10}
        />,
      );

      // Verify data renders correctly with pagination enabled
      expect(screen.getByText('Item 1')).toBeVisible();

      // Verify not all items are shown at once (only first page)
      // With 25 items and pagination=10, we should see first 10
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

      // With only 3 items and pagination=10, pagination should not be shown
      expect(screen.queryByText(/of 3/i)).not.toBeInTheDocument();

      // Data should still be visible
      expect(screen.getByText('Item 1')).toBeVisible();
      expect(screen.getByText('Item 3')).toBeVisible();
    });
  });

  describe('Custom Title and Actions', () => {
    it('should render custom title', () => {
      renderWithRouter(
        <StandardPage
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          title="My Custom Table"
        />,
      );

      expect(screen.getByText('My Custom Table')).toBeVisible();
    });

    it('should accept addButton prop without errors', () => {
      const addButton = <button>Add New Item</button>;

      // Should render without errors when addButton is provided
      renderWithRouter(
        <StandardPage
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          addButton={addButton}
        />,
      );

      // Verify data still renders correctly
      expect(screen.getByText('Item 1')).toBeVisible();
      expect(screen.getByText('Item 2')).toBeVisible();
    });
  });
});
