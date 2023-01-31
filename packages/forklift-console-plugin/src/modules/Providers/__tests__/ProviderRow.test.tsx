import * as React from 'react';
import { MemoryRouter } from 'react-router';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { cleanup, render } from '@testing-library/react';

import { MergedProvider } from '../data';
import ProviderRow from '../ProviderRow';
import { fieldsMetadata } from '../ProvidersPage';

import MERGED_MOCK_DATA from './mergedMockData.json';

afterEach(cleanup);

describe('Provider rows', () => {
  const providerTuples = MERGED_MOCK_DATA.map((p) => [p.name, p]);
  test.each(providerTuples)('%s', (description, provider) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <table>
          <tbody>
            <ProviderRow
              columns={fieldsMetadata}
              currentNamespace={undefined}
              entity={provider as MergedProvider}
            />
          </tbody>
        </table>
      </MemoryRouter>
    ));
    const { asFragment } = render(<Wrapped />);
    expect(asFragment()).toMatchSnapshot();
  });
});
