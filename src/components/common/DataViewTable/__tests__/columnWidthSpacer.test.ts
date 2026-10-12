import type { FC } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { renderHook } from '@testing-library/react';

import type { RowProps } from '../../TableView/types';
import { useForkliftDataViewColumns } from '../useForkliftDataViewColumns';
import { useForkliftDataViewRows } from '../useForkliftDataViewRows';

const nameField: ResourceField = { label: 'Name', resourceFieldId: 'name' };
const actionField: ResourceField = { isAction: true, label: '', resourceFieldId: 'actions' };
const RowComponent: FC<RowProps<unknown>> = jest.fn(() => null);

const spacerProps = {
  'aria-hidden': true,
  'data-column-width-spacer': true,
  role: 'presentation',
};

describe('column width spacer', () => {
  it.each([true, false])('aligns header and body spacer cells with actions: %s', (hasActions) => {
    const visibleColumns = hasActions ? [nameField, actionField] : [nameField];
    const { result } = renderHook(() => ({
      columns: useForkliftDataViewColumns({
        activeSort: { isAsc: true, label: 'Name', resourceFieldId: 'name' },
        leadingColumns: [{ cell: 'Select' }],
        setActiveSort: jest.fn(),
        visibleColumns,
      }),
      rows: useForkliftDataViewRows({
        entities: [{}],
        getLeadingCells: () => [{ cell: 'Select' }],
        namespace: 'default',
        RowComponent,
        visibleColumns,
      }),
    }));
    const spacerIndex = 2;

    expect(result.current.columns[spacerIndex]).toMatchObject({ props: spacerProps });
    expect(result.current.rows[0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ cell: null, props: spacerProps })]),
    );
    if (Array.isArray(result.current.rows[0])) {
      expect(result.current.rows[0][spacerIndex]).toMatchObject({ props: spacerProps });
    }
    expect(result.current.columns).toHaveLength(visibleColumns.length + 2);
  });
});
