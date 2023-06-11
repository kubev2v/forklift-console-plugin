import * as React from 'react';
import { MemoryRouter } from 'react-router';

import { withQueryClient } from '@kubev2v/common';
import { cleanup, render } from '@testing-library/react';

import { FlatNetworkMapping } from '../dataForNetwork';
import NetworkMappingRow from '../NetworkMappingRow';
import { fieldsMetadataFactory as networkFieldsFactory } from '../NetworkMappingsPage';

import MERGED_NETWORK_DATA from './mergedNetworkData.json';

// Mock translation function.
const t = (s) => s;
// Create a field metadata
const networkFields = networkFieldsFactory(t);

afterEach(cleanup);

describe('NetworkMap rows', () => {
  const netTuples = MERGED_NETWORK_DATA.map((net) => [net.name, net]);
  test.each(netTuples)('%s', (description, net) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <NetworkMappingRow
              resourceFields={networkFields.filter((f) => !f.isHidden)}
              namespace={undefined}
              resourceData={net as FlatNetworkMapping}
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
