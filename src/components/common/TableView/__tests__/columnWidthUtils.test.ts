import type { ResourceField } from '@components/common/utils/types';

import {
  clampColumnWidth,
  getDefaultWidthForField,
  getMinWidthForField,
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

  it('derives default width from percentage', () => {
    const field: ResourceField = {
      label: 'Name',
      resourceFieldId: 'name',
      width: 25,
    };
    expect(getDefaultWidthForField(field, 4)).toBe(300);
  });

  it('uses an equal share when no percentage is set', () => {
    const field: ResourceField = { label: 'Status', resourceFieldId: 'status' };
    expect(getDefaultWidthForField(field, 4)).toBe(300);
  });

  it('marks action columns as non-resizable', () => {
    expect(isResizableField({ isAction: true, label: 'Actions', resourceFieldId: 'actions' })).toBe(
      false,
    );
  });

  it('uses a fixed width for action fields', () => {
    expect(
      getMinWidthForField({ isAction: true, label: 'Actions', resourceFieldId: 'actions' }),
    ).toBe(72);
    expect(
      getDefaultWidthForField({ isAction: true, label: 'Actions', resourceFieldId: 'actions' }, 4),
    ).toBe(72);
  });

  it('clamps widths to the min and max', () => {
    expect(clampColumnWidth(40, 100)).toBe(100);
    expect(clampColumnWidth(900, 100)).toBe(480);
    expect(clampColumnWidth(180, 100)).toBe(180);
  });
});
