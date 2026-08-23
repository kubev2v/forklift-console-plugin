import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StandardPageWithSelection } from '../StandardPageWithSelection';

import {
  ExpandedContent,
  fieldsMetadata,
  mockData,
  renderWithRouter,
  toId,
} from './standardPageWithSelection.fixtures';

describe('StandardPageWithSelection - expansion', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should render expansion toggle when expanded content is provided', () => {
    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        expanded={ExpandedContent}
        expandedIds={[]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onExpand={jest.fn()}
        onSelect={jest.fn()}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const expandButtons = screen.getAllByLabelText(/Details/i);
    expect(expandButtons.length).toBe(mockData.length);
  });

  it('should show expanded content when item is expanded', async () => {
    const user = userEvent.setup();
    const onExpand = jest.fn();

    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        expanded={ExpandedContent}
        expandedIds={[]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onExpand={onExpand}
        onSelect={jest.fn()}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const expandButtons = screen.getAllByLabelText(/Details/i);
    await user.click(expandButtons[0]);

    expect(onExpand).toHaveBeenCalledWith(['1']);
  });

  it('should show expanded content when expandedIds prop is provided', () => {
    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        expanded={ExpandedContent}
        expandedIds={['1']}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onExpand={jest.fn()}
        onSelect={jest.fn()}
        selectedIds={[]}
        toId={toId}
      />,
    );

    expect(screen.getByText('Expanded details')).toBeVisible();
  });

  it('should support both selection and expansion simultaneously', () => {
    renderWithRouter(
      <StandardPageWithSelection
        dataSource={[mockData, true, null]}
        expanded={ExpandedContent}
        expandedIds={[]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onExpand={jest.fn()}
        onSelect={jest.fn()}
        selectedIds={[]}
        toId={toId}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const expandButtons = screen.getAllByLabelText(/Details/i);

    expect(checkboxes.length).toBeGreaterThan(0);
    expect(expandButtons.length).toBe(mockData.length);
  });
});
