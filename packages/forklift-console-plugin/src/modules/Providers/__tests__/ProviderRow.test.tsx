import * as React from 'react';
import { MemoryRouter } from 'react-router';
import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from 'legacy/src/queries/mocks/providers.mock';

import { V1beta1Provider } from '@kubev2v/types';
import { cleanup, render } from '@testing-library/react';

import { getFlatData, MergedProvider } from '../data';
import ProviderRow from '../ProviderRow';
import { fieldsMetadataFactory } from '../ProvidersPage';

// Mock translation function.
const t = (s) => s;

// Create a field metadata
const fieldsMetadata = fieldsMetadataFactory(t);

afterEach(cleanup);

describe('Provider rows', () => {
  const mockFlatData = getFlatData({
    providers: MOCK_CLUSTER_PROVIDERS as unknown as V1beta1Provider[],
    inventory: MOCK_INVENTORY_PROVIDERS,
  });
  const mockProvidersTuples = mockFlatData.map((p) => [p.metadata.name, p]);

  test.each(mockProvidersTuples)('%s', (description, provider) => {
    const Wrapped = () => (
      <MemoryRouter>
        <table>
          <tbody>
            <ProviderRow
              resourceFields={fieldsMetadata}
              namespace={'mtv-namespace'}
              resourceData={provider as MergedProvider}
              resourceIndex={0}
            />
          </tbody>
        </table>
      </MemoryRouter>
    );
    const { asFragment } = render(<Wrapped />);
    expect(asFragment()).toMatchSnapshot();
  });
});
