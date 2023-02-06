import { MigrationResource, PlanResource, ProviderResource } from 'src/utils/types';

import { MOCK_MIGRATIONS } from '@kubev2v/legacy/queries/mocks/migrations.mock';
import { MOCK_PLANS } from '@kubev2v/legacy/queries/mocks/plans.mock';
import { MOCK_CLUSTER_PROVIDERS } from '@kubev2v/legacy/queries/mocks/providers.mock';

import { mergeData } from '../data';

import MERGED_MOCK_DATA from './mergedMockData.json';

describe('merging k8s resources:Plans, Migrations, Providers', () => {
  test('empty input', () => {
    expect(mergeData([], [], [])).toHaveLength(0);
  });

  test('standard mock data', () => {
    const plans = MOCK_PLANS as PlanResource[];
    // set dynamically generated prop to static value (matching stored json)
    const NOW = '2023-01-18T05:27:28.820Z';
    MOCK_MIGRATIONS[5].spec.cutover = NOW;
    // plan state calculations compare against new Date().getTime()
    jest.useFakeTimers().setSystemTime(new Date(NOW));

    const migrations = MOCK_MIGRATIONS as MigrationResource[];
    const providers = MOCK_CLUSTER_PROVIDERS as ProviderResource[];
    const merged = mergeData(plans, migrations, providers);
    // do a stringify-parse run to remove undefined properties which clutter the results(if mismatch happens)
    expect(JSON.parse(JSON.stringify(merged))).toEqual(MERGED_MOCK_DATA);
  });
});
