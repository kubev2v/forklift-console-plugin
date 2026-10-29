import { type FC, type ReactElement, useState } from 'react';
import { MemoryRouter } from 'react-router';

import TableRow from '@components/common/DataViewTable/TableRow';
import ResizableTd from '@components/common/TableView/ResizableTd';
import type { RowProps } from '@components/common/TableView/types';
import type { ResourceField } from '@components/common/utils/types';
import { render, screen } from '@testing-library/react';

import StandardPage from '../StandardPage';

type Item = { id: string; name: string };

const FIELDS: ResourceField[] = [
  { isIdentity: true, isVisible: true, label: 'Name', resourceFieldId: 'name' },
];

const StatefulRow: FC<RowProps<Item>> = ({ resourceData, resourceFields }) => {
  const [mountedId] = useState(resourceData.id);
  return (
    <TableRow>
      <ResizableTd columnId="name" resourceFields={resourceFields}>
        {resourceData.name}: mounted {mountedId}
      </ResizableTd>
    </TableRow>
  );
};

describe('resizable row identity', () => {
  it('keeps row state with its item when the list reorders without a uid field', () => {
    const first = { id: 'first', name: 'VM A' };
    const second = { id: 'second', name: 'VM B' };
    const page = (items: Item[]): ReactElement => (
      <MemoryRouter>
        <StandardPage
          dataSource={[items, true, null]}
          fieldsMetadata={FIELDS}
          resizableColumns
          row={StatefulRow}
          toId={(item): string => item.id}
        />
      </MemoryRouter>
    );

    const view = render(page([first, second]));
    expect(screen.getByText('VM A: mounted first')).toBeInTheDocument();
    view.rerender(page([second, first]));

    expect(screen.getByText('VM B: mounted second')).toBeInTheDocument();
    expect(screen.getByText('VM A: mounted first')).toBeInTheDocument();
  });
});
