import type { ResourceField } from '@components/common/utils/types';
import { renderHook } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = {
  label: 'Name',
  resourceFieldId: 'name',
  sortable: true,
};

describe('useTableColumnWidths', () => {
  it('omits initial width so DataViewTh measures the rendered column', () => {
    const { result } = renderHook(() =>
      useTableColumnWidths({
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getResizableProps(nameField, 'Name')).toEqual(
      expect.objectContaining({
        isResizable: true,
        minWidth: 100,
      }),
    );
    expect(result.current.getResizableProps(nameField, 'Name')).not.toHaveProperty('width');
  });

  it('passes saved width to DataViewTh', () => {
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: { data: { name: 240 } },
        enabled: true,
        visibleColumns: [nameField],
      }),
    );

    expect(result.current.getResizableProps(nameField, 'Name')).toMatchObject({ width: 240 });
  });
});
