import * as React from 'react';
import { MemoryRouter } from 'react-router';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { cleanup, render } from '@testing-library/react';

import { MergedProvider } from '../data';
import ProviderRow from '../ProviderRow';
import { fieldsMetadataFactory } from '../ProvidersPage';

import MERGED_MOCK_DATA from './mergedMockData.json';

// Mock translation function.
const t = (s) => s;
// Create a field metadata
const fieldsMetadata = fieldsMetadataFactory(t);

afterEach(cleanup);

describe('Provider rows', () => {
  const providerTuples = MERGED_MOCK_DATA.map((p) => [p.name, p]);
  test.each(providerTuples)('%s', (description, provider) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <ProviderRow
              resourceFields={fieldsMetadata}
              currentNamespace={undefined}
              resourceData={provider as MergedProvider}
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
