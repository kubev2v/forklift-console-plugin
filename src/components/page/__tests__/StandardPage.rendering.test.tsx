import type { ReactElement } from 'react';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';

import { DefaultRow } from '../../common/TableView/DefaultRow';
import type { RowProps } from '../../common/TableView/types';
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

  it('renders a resizable row once with all visible fields', () => {
    const Row = jest.fn((props: RowProps<(typeof mockData)[number]>): ReactElement => (
      <DefaultRow {...props} />
    ));

    renderWithRouter(
      <StandardPage
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        resizableColumns
        row={Row}
      />,
    );

    expect(Row).toHaveBeenCalledTimes(mockData.length);
    expect(
      Row.mock.calls.every(([props]) => props.resourceFields.length === fieldsMetadata.length),
    ).toBe(true);
    expect(screen.getByRole('grid')).not.toHaveClass('pf-m-grid-md');
  });

  it('keeps a resizable loading placeholder aligned without a phantom spacer column', () => {
    renderWithRouter(
      <StandardPage
        dataSource={[[], false, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        resizableColumns
      />,
    );

    const table = screen.getByRole('grid');
    const visibleHeaderCount = within(table).getAllByRole('columnheader').length;
    expect(within(table).getByRole('cell', { name: /Loading/u })).toHaveAttribute(
      'colspan',
      String(visibleHeaderCount),
    );
  });

  it.each([false, true])(
    'aligns resizable data cells with headers when actions exist: %s',
    (hasActions) => {
      const fields = hasActions
        ? [
            ...fieldsMetadata,
            { isAction: true, isVisible: true, label: '', resourceFieldId: 'actions' },
          ]
        : fieldsMetadata;

      renderWithRouter(
        <StandardPage
          dataSource={[mockData, true, null]}
          fieldsMetadata={fields}
          namespace="test-ns"
          resizableColumns
        />,
      );

      const table = screen.getByRole('grid');
      const headerIds = within(table)
        .getAllByRole('columnheader')
        .map((header) => header.getAttribute('data-column-id'));
      const bodyRows = within(table).getAllByRole('row').slice(1);

      expect(headerIds).toEqual(fields.map((field) => field.resourceFieldId));
      for (const row of bodyRows) {
        expect(
          within(row)
            .getAllByRole('cell')
            .map((cell) => cell.getAttribute('data-column-id')),
        ).toEqual(headerIds);
      }
    },
  );
});
