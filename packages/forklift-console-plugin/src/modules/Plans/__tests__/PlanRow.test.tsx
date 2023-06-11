import * as React from 'react';
import { MemoryRouter } from 'react-router';

import { withQueryClient } from '@kubev2v/common';
import { IMustGatherContext, MustGatherContext } from '@kubev2v/legacy/common/context';
import { cleanup, render } from '@testing-library/react';

import { FlatPlan } from '../data';
import PlanRow from '../PlanRow';
import { fieldsMetadataFactory } from '../PlansPage';

import MERGED_MOCK_DATA from './mergedMockData.json';

// Mock translation function.
const t = (s) => s;
// Create a field metadata
const fieldsMetadata = fieldsMetadataFactory(t);

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
                resourceFields={fieldsMetadata.filter((f) => !f.isHidden)}
                namespace={undefined}
                resourceData={plan as FlatPlan}
                resourceIndex={0}
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
