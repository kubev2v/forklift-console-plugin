import * as React from 'react';
import { MemoryRouter } from 'react-router';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { cleanup, render } from '@testing-library/react';

import { FlatStorageMapping } from '../dataForStorage';
import StorageMappingRow from '../StorageMappingRow';
import { fieldsMetadata as storageFields } from '../StorageMappingsPage';

import MERGED_STORAGE_DATA from './mergedStorageData.json';

afterEach(cleanup);

describe('StorageMap rows', () => {
  const storageTuples = MERGED_STORAGE_DATA.map((storage) => [storage.name, storage]);
  test.each(storageTuples)('%s', (description, storage) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <StorageMappingRow
              columns={storageFields}
              currentNamespace={undefined}
              entity={storage as FlatStorageMapping}
              rowIndex={0}
            />
          </tbody>
        </table>
      </MemoryRouter>
    ));
    const { asFragment } = render(<Wrapped />);
    expect(asFragment()).toMatchSnapshot();
  });
});
