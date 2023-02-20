import * as React from 'react';
import { MemoryRouter } from 'react-router';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { cleanup, render } from '@testing-library/react';

import { FlatNetworkMapping } from '../dataForNetwork';
import { FlatStorageMapping } from '../dataForStorage';
import NetworkMappingRow from '../NetworkMappingRow';
import { fieldsMetadata as networkFields } from '../NetworkMappingsPage';
import StorageMappingRow from '../StorageMappingRow';

import MERGED_NETWORK_DATA from './mergedNetworkData.json';
import MERGED_STORAGE_DATA from './mergedStorageData.json';

afterEach(cleanup);

describe('NetworkMap rows', () => {
  const netTuples = MERGED_NETWORK_DATA.map((net) => [net.name, net]);
  test.each(netTuples)('%s', (description, net) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <NetworkMappingRow
              columns={networkFields}
              currentNamespace={undefined}
              entity={net as FlatNetworkMapping}
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

describe('StorageMap rows', () => {
  const storageTuples = MERGED_STORAGE_DATA.map((storage) => [storage.name, storage]);
  test.each(storageTuples)('%s', (description, storage) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <StorageMappingRow
              columns={networkFields}
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
