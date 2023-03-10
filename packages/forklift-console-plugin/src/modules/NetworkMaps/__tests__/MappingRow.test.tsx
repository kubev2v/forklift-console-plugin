import * as React from 'react';
import { MemoryRouter } from 'react-router';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { cleanup, render } from '@testing-library/react';

import { FlatNetworkMapping } from '../dataForNetwork';
import NetworkMappingRow from '../NetworkMappingRow';
import { fieldsMetadata as networkFields } from '../NetworkMappingsPage';

import MERGED_NETWORK_DATA from './mergedNetworkData.json';

afterEach(cleanup);

describe('NetworkMap rows', () => {
  const netTuples = MERGED_NETWORK_DATA.map((net) => [net.name, net]);
  test.each(netTuples)('%s', (description, net) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <NetworkMappingRow
              resourceFields={networkFields}
              currentNamespace={undefined}
              resourceData={net as FlatNetworkMapping}
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
