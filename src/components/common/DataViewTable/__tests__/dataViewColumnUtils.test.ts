import type { ResourceField } from '@components/common/utils/types';

import type { SortType } from '../../TableView/types';
import {
  getActionCellProps,
  getRenderedColumnCount,
  toDataViewColumn,
} from '../dataViewColumnUtils';
import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from '../forkliftDataViewTableClass';

const activeSort: SortType = { isAsc: true, label: 'Name', resourceFieldId: 'name' };

const nameField: ResourceField = {
  label: 'Name',
  resourceFieldId: 'name',
  sortable: true,
};

const actionField: ResourceField = {
  isAction: true,
  label: 'Actions',
  resourceFieldId: 'actions',
};

describe('dataViewColumnUtils', () => {
  it('excludes the hidden spacer from default loading and expanded row spans', () => {
    expect(getRenderedColumnCount(8, false)).toBe(7);
    expect(getRenderedColumnCount(8, true)).toBe(8);
    expect(getRenderedColumnCount(1, false)).toBe(1);
  });

  it('marks saved data headers and keeps the saved minimum without a competing width', () => {
    const column = toDataViewColumn({
      actionScreenReaderText: 'Actions',
      activeSort,
      columnIndex: 0,
      field: nameField,
      resizeConfig: {
        id: 'name',
        label: 'Name',
        minWidth: 100,
        savedWidth: 240,
      },
      setActiveSort: () => undefined,
      visibleColumns: [nameField],
    });

    expect(column).toEqual(
      expect.objectContaining({
        cell: 'Name',
        props: expect.objectContaining({
          'data-column-width-fixed': true,
          'data-resizable-column': true,
          id: 'name',
          style: { minWidth: '240px' },
        }),
        resizableProps: expect.objectContaining({ isResizable: true, width: 240 }),
      }),
    );
    if (typeof column === 'object' && column && 'props' in column) {
      expect(column.props).not.toHaveProperty('width');
      expect(column.props).not.toHaveProperty('modifier');
    }
  });

  it('leaves unsaved headers flexible until a resize starts', () => {
    const column = toDataViewColumn({
      actionScreenReaderText: 'Actions',
      activeSort,
      columnIndex: 0,
      field: nameField,
      resizeConfig: { id: 'name', label: 'Name', minWidth: 100 },
      setActiveSort: () => undefined,
      visibleColumns: [nameField],
    });

    expect(column).toMatchObject({ props: { 'data-column-width-fixed': false } });
    if (typeof column === 'object' && column && 'props' in column) {
      expect(column.props).not.toHaveProperty('style');
    }
  });

  it('keeps action columns sticky and not resizable', () => {
    const column = toDataViewColumn({
      actionScreenReaderText: 'Actions',
      activeSort,
      columnIndex: 1,
      field: actionField,
      setActiveSort: () => undefined,
      visibleColumns: [nameField, actionField],
    });

    expect(column).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          className: FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS,
          hasLeftBorder: true,
          isStickyColumn: true,
          stickyMinWidth: '0',
        }),
        resizableProps: undefined,
      }),
    );
    if (typeof column === 'object' && column && 'props' in column) {
      expect(column.props).not.toHaveProperty('style');
      expect(column.props).not.toHaveProperty('data-resizable-column');
    }
    expect(getActionCellProps()).toEqual(
      expect.objectContaining({
        className: FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS,
        isActionCell: true,
        isStickyColumn: true,
        stickyMinWidth: '0',
      }),
    );
  });

  it('uses translated screen reader text for unlabeled action headers', () => {
    const column = toDataViewColumn({
      actionScreenReaderText: 'Translated actions',
      activeSort,
      columnIndex: 1,
      field: { isAction: true, label: '', resourceFieldId: 'actions' },
      setActiveSort: () => undefined,
      visibleColumns: [nameField, { isAction: true, label: '', resourceFieldId: 'actions' }],
    });

    expect(column).toMatchObject({
      props: expect.objectContaining({ screenReaderText: 'Translated actions' }),
    });
  });
});
