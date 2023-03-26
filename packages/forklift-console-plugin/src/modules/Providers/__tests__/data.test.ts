import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';

import { getFlatData, isManaged } from '../data';

describe('getFlatData()', () => {
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

  test('applied to mock data is snapshot stable', () => {
    const mockFlatData = getFlatData({
      providers: MOCK_CLUSTER_PROVIDERS as unknown as V1beta1Provider[],
      inventory: MOCK_INVENTORY_PROVIDERS,
    });

    expect(mockFlatData).toMatchSnapshot();
  });
});

describe('isManaged()', () => {
  test('undefined', () => {
    expect(isManaged(undefined)).toEqual(false);
  });

  test('applied to mock data is snapshot stable', () => {
    const mockFlatData = getFlatData({
      providers: MOCK_CLUSTER_PROVIDERS as unknown as V1beta1Provider[],
      inventory: MOCK_INVENTORY_PROVIDERS,
    });

    const mockIsManaged = mockFlatData.reduce((results, provider) => {
      results[provider.metadata.name] = isManaged(provider as unknown as V1beta1Provider);
      return results;
    }, {});

    expect(mockIsManaged).toMatchSnapshot();
  });
});
