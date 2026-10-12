import type { ResourceField } from '@components/common/utils/types';

import {
  clampColumnWidth,
  getMinWidthForField,
  getTableColumnLayoutKey,
  isResizableField,
  sanitizeColumnWidths,
} from '../columnWidthUtils';

describe('columnWidthUtils', () => {
  it('sanitizes column width records', () => {
    expect(sanitizeColumnWidths({ bad: 'x', count: 3, name: 120 })).toEqual({
      count: 3,
      name: 120,
    });
  });

  it('uses the resize minimum for data fields', () => {
    const field: ResourceField = { label: 'Status', resourceFieldId: 'status' };
    expect(getMinWidthForField(field)).toBe(100);
  });

  it('marks action columns as non-resizable', () => {
    expect(isResizableField({ isAction: true, label: 'Actions', resourceFieldId: 'actions' })).toBe(
      false,
    );
  });

  it('lets action controls determine their width without a fixed minimum', () => {
    expect(
      getMinWidthForField({ isAction: true, label: 'Actions', resourceFieldId: 'actions' }),
    ).toBe(0);
  });

  it('changes the layout key for resets, visibility changes and reordering, not new field objects', () => {
    const name: ResourceField = { label: 'Name', resourceFieldId: 'name' };
    const status: ResourceField = { label: 'Status', resourceFieldId: 'status' };
    const key = getTableColumnLayoutKey(0, [name, status]);

    expect(getTableColumnLayoutKey(0, [{ ...name }, { ...status }])).toBe(key);
    expect(getTableColumnLayoutKey(1, [name, status])).not.toBe(key);
    expect(getTableColumnLayoutKey(0, [name])).not.toBe(key);
    expect(getTableColumnLayoutKey(0, [status, name])).not.toBe(key);
  });

  it('clamps widths to the min and max', () => {
    expect(clampColumnWidth(40, 100)).toBe(100);
    expect(clampColumnWidth(900, 100)).toBe(480);
    expect(clampColumnWidth(180, 100)).toBe(180);
  });
});
