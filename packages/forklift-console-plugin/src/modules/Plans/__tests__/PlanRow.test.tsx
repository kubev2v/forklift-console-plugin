import * as React from 'react';
import { MemoryRouter } from 'react-router';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { IMustGatherContext, MustGatherContext } from '@kubev2v/legacy/common/context';
import { cleanup, render } from '@testing-library/react';

import { FlatPlan } from '../data';
import PlanRow from '../PlanRow';
import { fieldsMetadata } from '../PlansPage';

import MERGED_MOCK_DATA from './mergedMockData.json';

afterEach(cleanup);

describe('Plan rows', () => {
  const planTuples = MERGED_MOCK_DATA.map((plan) => [plan.name, plan]);
  test.each(planTuples)('%s', (description, plan) => {
    const Wrapped = withQueryClient(() => (
      <MemoryRouter>
        <MustGatherContext.Provider
          value={
            {
              withNs: jest.fn(),
              latestAssociatedMustGather: jest.fn(),
            } as unknown as IMustGatherContext
          }
        >
          <table>
            <tbody>
              <PlanRow
                columns={fieldsMetadata}
                currentNamespace={undefined}
                entity={plan as FlatPlan}
              />
            </tbody>
          </table>
        </MustGatherContext.Provider>
      </MemoryRouter>
    ));
    const { asFragment } = render(<Wrapped />);
    expect(asFragment()).toMatchSnapshot();
  });
});
