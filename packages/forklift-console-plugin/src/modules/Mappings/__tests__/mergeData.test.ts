import {
  MOCK_NETWORK_MAPPINGS,
  MOCK_STORAGE_MAPPINGS,
} from 'legacy/src/queries/mocks/mappings.mock';
import { NetworkMapResource, StorageMapResource } from 'src/utils/types';

import { MOCK_CLUSTER_PROVIDERS } from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';

import {
  groupByTarget as groupNetworkByTarget,
  mergeData as mergeNetworkData,
} from '../dataForNetwork';
import {
  groupByTarget as groupStorageByTarget,
  mergeData as mergeStoragekData,
} from '../dataForStorage';

import MERGED_NETWORK_DATA from './mergedNetworkData.json';
import MERGED_STORAGE_DATA from './mergedStorageData.json';

describe('merging network data', () => {
  test('empty input', () => {
    expect(mergeNetworkData([], [])).toHaveLength(0);
  });

  test('standard mock data', () => {
    const mappings = MOCK_NETWORK_MAPPINGS as NetworkMapResource[];
    const providers = MOCK_CLUSTER_PROVIDERS as V1beta1Provider[];
    const merged = mergeNetworkData(mappings, providers);
    // do a stringify-parse run to remove undefined properties which clutter the results(if mismatch happens)
    expect(JSON.parse(JSON.stringify(merged))).toEqual(MERGED_NETWORK_DATA);
  });
});

describe('merging storage data', () => {
  test('empty input', () => {
    expect(mergeStoragekData([], [])).toHaveLength(0);
  });

  test('standard mock data', () => {
    const mappings = MOCK_STORAGE_MAPPINGS as StorageMapResource[];
    const providers = MOCK_CLUSTER_PROVIDERS as V1beta1Provider[];
    const merged = mergeStoragekData(mappings, providers);
    // do a stringify-parse run to remove undefined properties which clutter the results(if mismatch happens)
    expect(JSON.parse(JSON.stringify(merged))).toEqual(MERGED_STORAGE_DATA);
  });
});

describe('grouping storage data', () => {
  test('empty input', () => {
    expect(groupStorageByTarget([])).toHaveLength(0);
  });
  test('group with one element', () => {
    expect(groupStorageByTarget([['large', { id: '123' }]])).toEqual([
      [{ name: 'large' }, [{ id: '123' }]],
    ]);
  });
  test('two elements sharing the same target storage class', () => {
    expect(
      groupStorageByTarget([
        ['large', { id: '123' }],
        ['large', { name: 'foo' }],
      ]),
    ).toEqual([[{ name: 'large' }, [{ id: '123' }, { name: 'foo' }]]]);
  });
  test('2 group with one element each', () => {
    expect(
      groupStorageByTarget([
        ['large', { id: '123' }],
        ['small', { name: 'foo' }],
      ]),
    ).toEqual([
      [{ name: 'large' }, [{ id: '123' }]],
      [{ name: 'small' }, [{ name: 'foo' }]],
    ]);
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
