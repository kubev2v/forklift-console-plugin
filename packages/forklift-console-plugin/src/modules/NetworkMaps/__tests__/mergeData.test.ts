import { NetworkMapResource } from 'src/utils/types';

import { MOCK_NETWORK_MAPPINGS } from '@kubev2v/legacy/queries/mocks/mappings.mock';
import { MOCK_CLUSTER_PROVIDERS } from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';

import {
  groupByTarget as groupNetworkByTarget,
  mergeData as mergeNetworkData,
} from '../dataForNetwork';

import MERGED_NETWORK_DATA from './mergedNetworkData.json';

describe('merging network data', () => {
  test('empty input', () => {
    expect(mergeNetworkData([], [])).toHaveLength(0);
  });

  test('standard mock data', () => {
    const mappings = MOCK_NETWORK_MAPPINGS as NetworkMapResource[];
    const providers = MOCK_CLUSTER_PROVIDERS as V1beta1Provider[];
    const merged = mergeNetworkData(mappings, providers);
    // do a stringify-parse run to remove undefined properties which clutter the results(if mismatch happens)

    /**
     * Write test data to file.
     *
     *
    import fs from 'fs';

    try {
      fs.writeFileSync('./mergedNetworkData.json', JSON.stringify(merged, undefined, 4));
    } catch (err) {
      console.error(err);
    }
    */

    expect(JSON.parse(JSON.stringify(merged))).toEqual(MERGED_NETWORK_DATA);
  });
});

describe('grouping network data', () => {
  test('empty input', () => {
    expect(groupNetworkByTarget([])).toHaveLength(0);
  });
  test('one multus target, one source', () => {
    expect(
      groupNetworkByTarget([
        {
          destination: {
            name: 'foo',
            namespace: 'bar',
            type: 'multus',
          },
          source: {
            name: 'external',
          },
        },
      ]),
    ).toEqual([
      [
        {
          name: 'foo',
          namespace: 'bar',
          type: 'multus',
        },
        [
          {
            name: 'external',
          },
        ],
      ],
    ]);
  });
  test('one pod network target, one source', () => {
    expect(
      groupNetworkByTarget([
        {
          destination: {
            type: 'pod',
          },
          source: {
            name: 'external',
          },
        },
      ]),
    ).toEqual([
      [
        {
          name: '',
          type: 'pod',
        },
        [
          {
            name: 'external',
          },
        ],
      ],
    ]);
  });
  test('one multus target, 2 sources', () => {
    expect(
      groupNetworkByTarget([
        {
          destination: {
            name: 'foo',
            namespace: 'bar',
            type: 'multus',
          },
          source: {
            name: 'external',
          },
        },
        {
          destination: {
            name: 'foo',
            namespace: 'bar',
            type: 'multus',
          },
          source: {
            name: 'another_external',
          },
        },
      ]),
    ).toEqual([
      [
        {
          name: 'foo',
          namespace: 'bar',
          type: 'multus',
        },
        [
          {
            name: 'external',
          },
          {
            name: 'another_external',
          },
        ],
      ],
    ]);
  });
  test('one pod network target, 2 sources', () => {
    expect(
      groupNetworkByTarget([
        {
          destination: {
            type: 'pod',
          },
          source: {
            name: 'external',
          },
        },
        {
          destination: {
            type: 'pod',
          },
          source: {
            name: 'another_external',
          },
        },
      ]),
    ).toEqual([
      [
        {
          name: '',
          type: 'pod',
        },
        [
          {
            name: 'external',
          },
          {
            name: 'another_external',
          },
        ],
      ],
    ]);
  });
});
