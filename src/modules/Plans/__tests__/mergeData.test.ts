import { MigrationResource, PlanResource, ProviderResource } from '_/utils/types';

import { MOCK_MIGRATIONS } from '@app/queries/mocks/migrations.mock';
import { MOCK_PLANS } from '@app/queries/mocks/plans.mock';
import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';

import { findObjectRef, mergeData } from '../data';

import MERGED_MOCK_DATA from './mergedMockData.json';

describe('finding object ref', () => {
  test('fallback to default ref if no matching provider', () => {
    expect(findObjectRef({ name: 'Foo', namespace: 'Bar' }, [])).toEqual({
      name: 'Foo',
      gvk: {
        group: 'forklift.konveyor.io',
        version: 'v1beta1',
        kind: 'Provider',
      },
      ready: false,
    });
  });
  test('finding matching provider', () => {
    expect(
      findObjectRef({ name: 'test', namespace: 'openshift-migration' }, [
        {
          apiVersion: 'foo.io/v2',
          kind: 'Provider',
          metadata: {
            name: 'test',
            namespace: 'openshift-migration',
          },
          status: {
            conditions: [
              {
                category: 'Required',
                lastTransitionTime: '2021-03-23T16:58:23Z',
                message: 'The provider is ready.',
                status: 'True',
                type: 'Ready',
              },
            ],
          },
        },
      ]),
    ).toEqual({
      name: 'test',
      gvk: {
        group: 'foo.io',
        version: 'v2',
        kind: 'Provider',
      },
      ready: true,
    });
  });
});

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
