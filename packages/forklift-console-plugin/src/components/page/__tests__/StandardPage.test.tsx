import * as React from 'react';

import { RowProps } from '@kubev2v/common';
import { NAME, NAMESPACE } from '@kubev2v/common';
import { Td, Tr } from '@patternfly/react-table';
import { cleanup, render } from '@testing-library/react';

import { StandardPage } from '../StandardPage';

afterEach(cleanup);

function SimpleRow<T>({ resourceFields, resourceData }: RowProps<T>) {
  return (
    <Tr ouiaId={undefined} ouiaSafe={undefined}>
      {resourceFields.map(({ resourceFieldId, label }) => (
        <Td key={resourceFieldId} dataLabel={label}>
          {String(resourceData[resourceFieldId] ?? '')}
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
          resourceFieldId: NAME,
          label: 'Name',
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
          resourceFieldId: NAME,
          label: 'Name',
          isIdentity: true,
          isVisible: true,
          filter: {
            primary: true,
            type: 'freetext',
            placeholderLabel: 'Filter by name',
          },
        },
        {
          resourceFieldId: NAMESPACE,
          label: 'Namespace',
          isIdentity: true,
          isVisible: true,
          filter: {
            type: 'freetext',
            placeholderLabel: 'Filter by namespace',
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
