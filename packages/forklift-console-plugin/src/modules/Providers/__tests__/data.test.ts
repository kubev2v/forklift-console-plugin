import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';

import { getFlatData } from '../data';

import preCalculatedflatData from './data.test.getFlatData_mock_data.json';

describe('getFlatData empty', () => {
  test('empty input', () => {
    const flatData = getFlatData({
      providers: [],
      inventory: {
        vsphere: [],
        ovirt: [],
        openstack: [],
        openshift: [],
      },
    });

    expect(flatData).toHaveLength(0);
  });

  test('getFlatData mock data', () => {
    const flatData = getFlatData({
      providers: MOCK_CLUSTER_PROVIDERS as unknown as V1beta1Provider[],
      inventory: MOCK_INVENTORY_PROVIDERS,
    });

    /**
     * Write test data to file.
     * 
    import fs from 'fs';

    try {
      fs.writeFileSync(
        './data.test.getFlatData_mock_data.json',
        JSON.stringify(flatData, undefined, 2),
      );
    } catch (err) {
      console.error(err);
    }
    */

    expect(flatData).toEqual(preCalculatedflatData);
  });
});
