import * as React from 'react';
import { MemoryRouter } from 'react-router';

import { withQueryClient } from '@kubev2v/common';
import { cleanup, render } from '@testing-library/react';

import { FlatStorageMapping } from '../dataForStorage';
import StorageMappingRow from '../StorageMappingRow';
import { fieldsMetadataFactory as storageFieldsFactory } from '../StorageMappingsPage';

import MERGED_STORAGE_DATA from './mergedStorageData.json';

// Mock translation function.
const t = (s) => s;
// Create a field metadata
const storageFields = storageFieldsFactory(t);

afterEach(cleanup);

describe('StorageMap rows', () => {
  const storageTuples = MERGED_STORAGE_DATA.map((storage) => [storage.name, storage]);
  test.each(storageTuples)('%s', (description, storage) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <StorageMappingRow
              resourceFields={storageFields.filter((f) => !f.isHidden)}
              namespace={undefined}
              resourceData={storage as FlatStorageMapping}
              resourceIndex={0}
            />
          </tbody>
        </table>
      </MemoryRouter>
    ));
    const { asFragment } = render(<Wrapped />);
    expect(asFragment()).toMatchSnapshot();
  });
});
