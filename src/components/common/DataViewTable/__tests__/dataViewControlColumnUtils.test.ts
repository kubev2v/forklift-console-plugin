import {
  getExpandCellProps,
  getExpandHeaderProps,
  getSelectionCellProps,
  getSelectionHeaderProps,
} from '../dataViewControlColumnUtils';
import { EXPANSION_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH } from '../dataViewTableConstants';
import { FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS } from '../forkliftDataViewTableClass';

const stickyProps = {
  className: FORKLIFT_DATA_VIEW_TABLE_STICKY_CELL_CLASS,
  isStickyColumn: true,
};

describe('dataViewControlColumnUtils', () => {
  it('marks compact expansion headers and body cells with aligned sticky positioning', () => {
    const expected = {
      ...stickyProps,
      'data-table-control-column': 'expand',
      stickyLeftOffset: '0',
      stickyMinWidth: EXPANSION_COLUMN_WIDTH,
    };
    expect(getExpandHeaderProps('Details')).toEqual({ ...expected, screenReaderText: 'Details' });
    expect(getExpandCellProps()).toEqual(expected);
  });

  it.each([false, true])(
    'aligns selection header and body when expansion is %s',
    (hasExpansion) => {
      const expected = {
        ...stickyProps,
        'data-table-control-column': 'select',
        stickyLeftOffset: hasExpansion ? EXPANSION_COLUMN_WIDTH : '0',
        stickyMinWidth: SELECTION_COLUMN_WIDTH,
      };
      expect(getSelectionHeaderProps('Row select', hasExpansion)).toEqual({
        ...expected,
        screenReaderText: 'Row select',
      });
      expect(getSelectionCellProps(hasExpansion)).toEqual(expected);
    },
  );
});
