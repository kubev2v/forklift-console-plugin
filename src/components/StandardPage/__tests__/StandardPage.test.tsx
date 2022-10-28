import * as React from 'react';
import { RowProps } from 'src/components/TableView';
import { NAME, NAMESPACE } from 'src/utils/constants';

import { Td, Tr } from '@patternfly/react-table';
import { cleanup, render } from '@testing-library/react';

import { StandardPage } from '..';

afterEach(cleanup);

function SimpleRow<T>({ columns, entity }: RowProps<T>) {
  return (
    <Tr>
      {columns.map(({ id, toLabel }) => (
        <Td key={id} dataLabel={toLabel((s) => s)}>
          {String(entity[id] ?? '')}
        </Td>
      ))}
    </Tr>
  );
}

test('empty result set returned, no filters ', async () => {
  interface Named {
    name: string;
  }
  const dataSource: [Named[], boolean, boolean] = [[], true, false];
  const { asFragment } = render(
    <StandardPage<Named>
      RowMapper={SimpleRow}
      dataSource={dataSource}
      fieldsMetadata={[
        {
          id: NAME,
          toLabel: (t) => t('Name'),
        },
      ]}
      namespace={undefined}
      title="Simple"
    ></StandardPage>,
  );
  expect(asFragment()).toMatchSnapshot();
});

test('single entry returned, both filters ', async () => {
  interface Simple {
    name: string;
    namespace: string;
  }
  const dataSource: [Simple[], boolean, boolean] = [
    [{ name: 'foo_name', namespace: 'bar_namespace' }],
    true,
    false,
  ];
  const { asFragment, queryByText } = render(
    <StandardPage<Simple>
      RowMapper={SimpleRow}
      dataSource={dataSource}
      fieldsMetadata={[
        {
          id: NAME,
          toLabel: (t) => t('Name'),
          isIdentity: true,
          isVisible: true,
          filter: {
            primary: true,
            type: 'freetext',
            toPlaceholderLabel: (t) => t('Filter by name'),
          },
        },
        {
          id: NAMESPACE,
          toLabel: (t) => t('Namespace'),
          isIdentity: true,
          isVisible: true,
          filter: {
            type: 'freetext',
            toPlaceholderLabel: (t) => t('Filter by namespace'),
          },
        },
      ]}
      namespace={'some_namespace'}
      title="Simple"
    ></StandardPage>,
  );
  expect(queryByText('foo_name')).toBeTruthy();
  // namespace column should be hidden
  expect(queryByText('bar_namespace')).toBeFalsy();
  expect(asFragment()).toMatchSnapshot();
});
