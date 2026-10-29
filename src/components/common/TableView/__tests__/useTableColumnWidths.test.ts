import type { ResourceField } from '@components/common/utils/types';
import { renderHook } from '@testing-library/react';

import { useTableColumnWidths } from '../useTableColumnWidths';

const nameField: ResourceField = {
  isVisible: true,
  label: 'Name',
  resourceFieldId: 'name',
};
const compactField: ResourceField = {
  defaultWidth: { minWidth: 50, weight: 1 },
  isVisible: true,
  label: 'VMs',
  resourceFieldId: 'vms',
};
const actionField: ResourceField = {
  isAction: true,
  isVisible: true,
  label: 'Actions',
  resourceFieldId: 'actions',
};
const fields = [nameField, compactField, actionField];

describe('useTableColumnWidths', () => {
  it('returns readable resize configuration without saving initial preferences', () => {
    const { result } = renderHook(() => useTableColumnWidths({ enabled: true, fields }));

    expect(result.current.getResizeConfig(nameField, 'Name')).toEqual({
      id: 'name',
      label: 'Name',
      minWidth: 100,
    });
    expect(result.current.getResizeConfig(compactField, 'VMs')).toEqual({
      id: 'vms',
      label: 'VMs',
      minWidth: 96,
    });
    expect(result.current.hasCustomColumnWidths).toBe(false);
    expect(result.current.hasKnownColumnWidths).toBe(false);
  });

  it('returns saved widths exactly and identifies visible known overrides', () => {
    const { result } = renderHook(() =>
      useTableColumnWidths({
        columnWidthsSettings: {
          clear: jest.fn(),
          data: { name: 79.125, stale: 250 },
          save: jest.fn(),
        },
        enabled: true,
        fields,
      }),
    );

    expect(result.current.getResizeConfig(nameField, 'Name')).toMatchObject({
      minWidth: 100,
      savedWidth: 79.125,
    });
    expect(result.current.hasCustomColumnWidths).toBe(true);
    expect(result.current.hasKnownColumnWidths).toBe(true);
  });

  it('does not configure actions or disabled tables', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useTableColumnWidths({ enabled, fields }),
      { initialProps: { enabled: false } },
    );
    expect(result.current.getResizeConfig(nameField, 'Name')).toBeUndefined();
    rerender({ enabled: true });
    expect(result.current.getResizeConfig(actionField, 'Actions')).toBeUndefined();
  });

  it('loads persisted settings delivered after initial mount', () => {
    const settings = { clear: jest.fn(), data: { name: 180 }, save: jest.fn() };
    const { result, rerender } = renderHook(
      ({ loaded }) =>
        useTableColumnWidths({
          columnWidthsSettings: loaded ? settings : undefined,
          enabled: true,
          fields,
        }),
      { initialProps: { loaded: false } },
    );

    expect(result.current.getResizeConfig(nameField, 'Name')).not.toHaveProperty('savedWidth');
    rerender({ loaded: true });
    expect(result.current.getResizeConfig(nameField, 'Name')).toHaveProperty('savedWidth', 180);
  });
});
