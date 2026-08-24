import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StandardPageWithSelection } from '../StandardPageWithSelection';

import {
  fieldsMetadata,
  mockData,
  renderWithRouter,
  toId,
} from './standardPageWithSelection.fixtures';

describe('StandardPageWithSelection - selection', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should render checkboxes when selection is enabled', () => {
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should call onSelect when items are selected', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    expect(onSelect).toHaveBeenCalledWith(['1']);
  });

  it('should show items as selected when selectedIds prop is provided', () => {
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

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
    expect(checkboxes[3]).toBeChecked();
  });

  it('should allow selecting all items', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(onSelect).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should allow deselecting all items', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={['1', '2', '3']}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(onSelect).toHaveBeenCalledWith([]);
  });
});
