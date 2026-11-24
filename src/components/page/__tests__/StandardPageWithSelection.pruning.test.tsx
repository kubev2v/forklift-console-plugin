import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StandardPageWithSelection } from '../StandardPageWithSelection';

import {
  fieldsMetadata,
  mockData,
  renderWithRouter,
  SelectedIdsProbe,
  toId,
} from './standardPageWithSelection.fixtures';

const hideItemTwo = (data: typeof mockData): typeof mockData =>
  data.filter((item) => item.id !== '2');

const keepFirstTwo = (data: typeof mockData): typeof mockData =>
  data.filter((item) => item.id !== '3');

const expectNoSelectionCount = (): void => {
  expect(screen.queryByText(/^\d+ selected$/u)).toBeNull();
};

describe('StandardPageWithSelection - derived selection pruning', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('does not count a selected plan hidden by post-filtering', () => {
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        postFilterData={hideItemTwo}
        selectedIds={['2']}
        toId={toId}
      />,
    );

    expectNoSelectionCount();
    expect(screen.queryByText('Item 2')).toBeNull();
  });

  it('counts selected plans that are still visible', () => {
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={['1', '3']}
        toId={toId}
      />,
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('passes only visible ids to toolbar actions', () => {
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        GlobalActionToolbarItems={[SelectedIdsProbe]}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={['2', 'ghost']}
        toId={toId}
      />,
    );

    expect(screen.getByTestId('selected-ids-probe')).toHaveTextContent('2');
  });

  it('cannot re-add hidden ids through "Select page"', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        postFilterData={keepFirstTwo}
        selectedIds={['3']}
        toId={toId}
      />,
    );

    await user.click(within(screen.getByTestId('table-bulk-select')).getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: 'Select page (2)' }));

    expect(onSelect).toHaveBeenCalledWith(['1', '2']);
  });

  it('clears kept-but-hidden ids through "Select none"', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        postFilterData={keepFirstTwo}
        selectedIds={['3']}
        toId={toId}
      />,
    );

    await user.click(within(screen.getByTestId('table-bulk-select')).getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name: 'Select none (0)' }));

    expect(onSelect).toHaveBeenCalledWith([]);
  });
});
