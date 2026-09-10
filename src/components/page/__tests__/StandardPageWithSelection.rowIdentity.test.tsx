import { type FC, useEffect } from 'react';

import type { RowProps } from '@components/common/TableView/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StandardPageWithSelection } from '../StandardPageWithSelection';

import {
  fieldsMetadata,
  mockData,
  renderWithRouter,
  toId,
} from './standardPageWithSelection.fixtures';

describe('StandardPageWithSelection - row identity', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('should not remount row cells when selection changes', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const mountCounts = new Map<string, number>();

    const TrackingCell: FC<RowProps<{ id: string; name: string }>> = ({ resourceData }) => {
      useEffect(() => {
        mountCounts.set(resourceData.id, (mountCounts.get(resourceData.id) ?? 0) + 1);
      }, [resourceData.id]);

      return <td>{resourceData.name}</td>;
    };

    renderWithRouter(
      <StandardPageWithSelection
        cell={TrackingCell}
        dataSource={[mockData, true, null]}
        fieldsMetadata={fieldsMetadata}
        namespace="test-ns"
        onSelect={onSelect}
        selectedIds={[]}
        toId={toId}
      />,
    );

    await waitFor(() => {
      expect(mountCounts.get('1')).toBe(1);
      expect(mountCounts.get('2')).toBe(1);
      expect(mountCounts.get('3')).toBe(1);
    });

    const initialMountCounts = new Map(mountCounts);
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    expect(mountCounts).toEqual(initialMountCounts);
    expect(checkboxes[1]).toBeChecked();
  });
});
