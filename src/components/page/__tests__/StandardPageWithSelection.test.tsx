import { MemoryRouter } from 'react-router-dom-v5-compat';

import type { ResourceField } from '@components/common/utils/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StandardPageWithSelection } from '../StandardPageWithSelection';

const renderWithRouter = (component: React.ReactElement) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('StandardPageWithSelection', () => {
  const mockData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  const fieldsMetadata: ResourceField[] = [
    {
      resourceFieldId: 'name',
      label: 'Name',
      isVisible: true,
      isIdentity: true,
    },
    {
      resourceFieldId: 'id',
      label: 'ID',
      isVisible: true,
      isIdentity: false,
      filter: {
        type: 'freetext',
      },
    },
  ];

  const toId = (item: { id: string }) => item.id;

  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  describe('Selection', () => {
    it('should render checkboxes when selection is enabled', () => {
      const onSelect = jest.fn();

      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={onSelect}
          selectedIds={[]}
        />,
      );

      // Should have checkboxes for each row
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
          toId={toId}
          onSelect={onSelect}
          selectedIds={[]}
        />,
      );

      // Click first checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Skip header checkbox

      expect(onSelect).toHaveBeenCalledWith(['1']);
    });

    it('should show items as selected when selectedIds prop is provided', () => {
      const onSelect = jest.fn();

      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={onSelect}
          selectedIds={['1', '3']}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Header checkbox should be in mixed state, items 1 and 3 should be checked
      expect(checkboxes[1]).toBeChecked(); // First item
      expect(checkboxes[2]).not.toBeChecked(); // Second item
      expect(checkboxes[3]).toBeChecked(); // Third item
    });

    it('should allow selecting all items', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();

      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={onSelect}
          selectedIds={[]}
        />,
      );

      // Click header checkbox to select all
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Header checkbox

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
          toId={toId}
          onSelect={onSelect}
          selectedIds={['1', '2', '3']}
        />,
      );

      // Click header checkbox to deselect all
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Header checkbox

      expect(onSelect).toHaveBeenCalledWith([]);
    });
  });

  describe('Expansion', () => {
    const ExpandedContent = () => <div>Expanded details</div>;

    it('should render expansion toggle when expanded content is provided', () => {
      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={jest.fn()}
          selectedIds={[]}
          onExpand={jest.fn()}
          expandedIds={[]}
          expanded={ExpandedContent}
        />,
      );

      // Should have expansion toggles (PatternFly renders these with aria-label="Details")
      const expandButtons = screen.getAllByLabelText(/Details/i);
      expect(expandButtons.length).toBe(mockData.length);
    });

    it('should show expanded content when item is expanded', async () => {
      const user = userEvent.setup();
      const onExpand = jest.fn();

      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={jest.fn()}
          selectedIds={[]}
          onExpand={onExpand}
          expandedIds={[]}
          expanded={ExpandedContent}
        />,
      );

      // Click expand button
      const expandButtons = screen.getAllByLabelText(/Details/i);
      await user.click(expandButtons[0]);

      expect(onExpand).toHaveBeenCalledWith(['1']);
    });

    it('should show expanded content when expandedIds prop is provided', () => {
      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={jest.fn()}
          selectedIds={[]}
          onExpand={jest.fn()}
          expandedIds={['1']}
          expanded={ExpandedContent}
        />,
      );

      expect(screen.getByText('Expanded details')).toBeVisible();
    });
  });

  describe('Combined Selection and Expansion', () => {
    const ExpandedContent = () => <div>Expanded details</div>;

    it('should support both selection and expansion simultaneously', () => {
      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={jest.fn()}
          selectedIds={[]}
          onExpand={jest.fn()}
          expandedIds={[]}
          expanded={ExpandedContent}
        />,
      );

      // Should have both checkboxes and expand buttons
      const checkboxes = screen.getAllByRole('checkbox');
      const expandButtons = screen.getAllByLabelText(/Details/i);

      // Verify both selection and expansion UI elements are present
      expect(checkboxes.length).toBeGreaterThan(0);
      expect(expandButtons.length).toBe(mockData.length);
    });
  });

  describe('Conditional Selection with canSelect', () => {
    it('should disable selection for items that fail canSelect', () => {
      const onSelect = jest.fn();
      const canSelect = (item: { id: string }) => item.id !== '2';

      renderWithRouter(
        <StandardPageWithSelection
          dataSource={[mockData, true, null]}
          fieldsMetadata={fieldsMetadata}
          namespace="test-ns"
          toId={toId}
          onSelect={onSelect}
          selectedIds={[]}
          canSelect={canSelect}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).not.toBeDisabled(); // Item 1
      expect(checkboxes[2]).toBeDisabled(); // Item 2 - should be disabled
      expect(checkboxes[3]).not.toBeDisabled(); // Item 3
    });
  });
});
