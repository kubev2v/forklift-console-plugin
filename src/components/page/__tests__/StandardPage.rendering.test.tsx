import { beforeEach, describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react';

import StandardPage from '../StandardPage';

import { fieldsMetadata, mockData, renderWithRouter } from './standardPage.fixtures';

describe('StandardPage - rendering', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

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
    const addButton = <button type="button">Add New Item</button>;

    renderWithRouter(
      <StandardPage
        addButton={addButton}
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
      />,
    );

    expect(screen.getByText('Item 1')).toBeVisible();
    expect(screen.getByText('Item 2')).toBeVisible();
  });
});
