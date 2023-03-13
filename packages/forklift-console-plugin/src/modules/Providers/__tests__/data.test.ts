import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';

import { getFlatData, isManaged } from '../data';

import preCalculatedflatData from './data.test.getFlatData_mock_data.json';

const preCalculatedIsManagedMap = {
  'vcenter-1': false,
  'vcenter-2': false,
  'vcenter-3': false,
  'rhv-1': false,
  'rhv-2': false,
  'rhv-3': false,
  'openstack-insecure-1': false,
  'openstack-secure-2': false,
  'ocpv-1': false,
  'ocpv-2': false,
  'ocpv-3': false,
  host: true,
};

describe('getFlatData', () => {
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

  test('mock data', () => {
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

describe('isManaged', () => {
  test('undefined', () => {
    expect(isManaged(undefined)).toEqual(false);
  });

  const providersTuples = preCalculatedflatData.map((p) => [p.metadata.name, p]);

  test.each(providersTuples)('%s', (description, provider) => {
    expect(isManaged(provider as unknown as V1beta1Provider)).toEqual(
      preCalculatedIsManagedMap[description as string],
    );
  });
});
