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

describe('StandardPageWithSelection - canSelect', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should disable selection for items that fail canSelect', () => {
    const onSelect = jest.fn();
    const canSelect = (item: { id: string }): boolean => item.id !== '2';

    renderWithRouter(
      <StandardPageWithSelection
        canSelect={canSelect}
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).not.toBeDisabled();
    expect(checkboxes[2]).toBeDisabled();
    expect(checkboxes[3]).not.toBeDisabled();
  });

  it('keeps nonselectable rows disabled in a resizable table', () => {
    renderWithRouter(
      <StandardPageWithSelection
        canSelect={(item): boolean => item.id !== '2'}
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={jest.fn()}
        resizableColumns
        selectedIds={[]}
        toId={toId}
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeDisabled();
    expect(screen.getAllByRole('checkbox')).toHaveLength(mockData.length + 1);
  });

  it('should only select eligible items when Select All is used', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const canSelect = (item: { id: string }): boolean => item.id !== '2';

    renderWithRouter(
      <StandardPageWithSelection
        canSelect={canSelect}
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

    expect(onSelect).toHaveBeenCalledWith(['1', '3']);
  });

  it('should not include non-selectable items when deselecting all', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const canSelect = (item: { id: string }): boolean => item.id !== '2';

    renderWithRouter(
      <StandardPageWithSelection
        canSelect={canSelect}
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={['1', '3']}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(onSelect).toHaveBeenCalledWith([]);
  });
});
