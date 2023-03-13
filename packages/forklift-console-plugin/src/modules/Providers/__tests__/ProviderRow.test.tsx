import * as React from 'react';
import { MemoryRouter } from 'react-router';

import { cleanup, render } from '@testing-library/react';

import { MergedProvider } from '../data';
import ProviderRow from '../ProviderRow';
import { fieldsMetadataFactory } from '../ProvidersPage';

import flatData from './data.test.getFlatData_mock_data.json';

// Mock translation function.
const t = (s) => s;
// Create a field metadata
const fieldsMetadata = fieldsMetadataFactory(t);

afterEach(cleanup);

describe('Provider rows', () => {
  const providersTuples = flatData.map((p) => [p.metadata.name, p]);

  test.each(providersTuples)('%s', (description, provider) => {
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
