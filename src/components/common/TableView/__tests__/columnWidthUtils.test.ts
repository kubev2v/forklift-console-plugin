import type { ResourceField } from '@components/common/utils/types';

import {
  getMinWidthForField,
  getTableColumnLayoutKey,
  isResizableField,
  isValidColumnWidth,
  sanitizeColumnWidths,
} from '../columnWidthUtils';

describe('columnWidthUtils', () => {
  it('sanitizes column width records', () => {
    expect(
      sanitizeColumnWidths({
        bad: 'x',
        infinite: Infinity,
        name: 624.125,
        negative: -1,
        notANumber: NaN,
        small: 79.125,
        zero: 0,
      }),
    ).toEqual({ name: 624.125, small: 79.125 });
  });

  it('uses the resize minimum for data fields', () => {
    const field: ResourceField = { label: 'Status', resourceFieldId: 'status' };
    expect(getMinWidthForField(field)).toBe(100);
  });

  it('uses an explicit compact gesture minimum without changing the legacy default', () => {
    expect(
      getMinWidthForField({
        defaultWidth: { minWidth: 50, weight: 1 },
        label: 'VMs',
        resourceFieldId: 'vms',
      }),
    ).toBe(50);
  });

  it.each([0, -1, NaN, Infinity])('ignores an invalid configured minimum: %s', (minWidth) => {
    expect(
      getMinWidthForField({
        defaultWidth: { minWidth, weight: 1 },
        label: 'VMs',
        resourceFieldId: 'vms',
      }),
    ).toBe(100);
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

  it.each([79.125, 100, 624.125, 1200])('accepts a finite positive %spx width', (width) => {
    expect(isValidColumnWidth(width)).toBe(true);
  });

  it.each([undefined, null, '180', {}, 0, -1, NaN, Infinity])(
    'rejects an invalid width: %s',
    (width) => {
      expect(isValidColumnWidth(width)).toBe(false);
    },
  );
});
