import type { ResourceField } from '@components/common/utils/types';
import { act, renderHook } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = { isVisible: true, label: 'Name', resourceFieldId: 'name' };
const statusField: ResourceField = { isVisible: false, label: 'Status', resourceFieldId: 'status' };
const projectField: ResourceField = {
  isVisible: true,
  label: 'Project',
  resourceFieldId: 'namespace',
};

describe('column visibility and width overrides', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('preserves saved widths by ID across hiding, showing, and reordering', () => {
    const save = jest.fn();
    const settings = {
      clear: jest.fn(),
      data: { name: 624.125, status: 79.125 },
      save,
    };
    const { result, rerender } = renderHook(
      ({ fields }: { fields: ResourceField[] }) =>
        useTableColumnWidths({ columnWidthsSettings: settings, enabled: true, fields }),
      { initialProps: { fields: [nameField, statusField, projectField] } },
    );
    expect(result.current.hasCustomColumnWidths).toBe(true);
    expect(result.current.hasKnownColumnWidths).toBe(true);
    expect(result.current.getResizeConfig(projectField, 'Project')).not.toHaveProperty(
      'savedWidth',
    );

    rerender({
      fields: [{ ...nameField, isVisible: false }, statusField, projectField],
    });
    expect(result.current.hasCustomColumnWidths).toBe(false);
    expect(result.current.hasKnownColumnWidths).toBe(true);

    rerender({
      fields: [{ ...statusField, isVisible: true }, projectField, nameField],
    });
    expect(result.current.getResizeConfig(statusField, 'Status')).toHaveProperty(
      'savedWidth',
      79.125,
    );
    expect(result.current.getResizeConfig(nameField, 'Name')).toHaveProperty('savedWidth', 624.125);
    expect(save).not.toHaveBeenCalled();
  });

  it('merges a newly resized visible column with hidden saved widths', () => {
    const save = jest.fn();
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: {
          clear: jest.fn(),
          data: { name: 624.125, status: 79.125 },
          save,
        },
        enabled: true,
        fields: [nameField, statusField, projectField],
      }),
    );
    act(() => {
      result.current.commitColumnWidths({ name: 624.125, namespace: 160 });
      result.current.flushPendingColumnWidths();
    });
    expect(save).toHaveBeenCalledWith({
      name: 624.125,
      namespace: 160,
      status: 79.125,
    });
  });
});
