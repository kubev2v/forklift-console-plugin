import { StorageMapResource } from 'src/utils/types';

import { MOCK_STORAGE_MAPPINGS } from '@kubev2v/legacy/queries/mocks/mappings.mock';
import { MOCK_CLUSTER_PROVIDERS } from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';

import {
  groupByTarget as groupStorageByTarget,
  mergeData as mergeStorageData,
} from '../dataForStorage';

import MERGED_STORAGE_DATA from './mergedStorageData.json';

describe('merging storage data', () => {
  test('empty input', () => {
    expect(mergeStorageData([], [])).toHaveLength(0);
  });

  test('standard mock data', () => {
    const mappings = MOCK_STORAGE_MAPPINGS as StorageMapResource[];
    const providers = MOCK_CLUSTER_PROVIDERS as V1beta1Provider[];
    const merged = mergeStorageData(mappings, providers);
    // do a stringify-parse run to remove undefined properties which clutter the results(if mismatch happens)

    /**
     * Write test data to file.
     *
     *
    import fs from 'fs';

    try {
      fs.writeFileSync('./mergedStorageData.json', JSON.stringify(merged, undefined, 4));
    } catch (err) {
      console.error(err);
    }
    */

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
