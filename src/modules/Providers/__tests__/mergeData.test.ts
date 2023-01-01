import { ProviderResource } from '_/utils/types';

import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from '@app/queries/mocks/providers.mock';
import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

import { groupPairs, mergeData, toSupportedConditions } from '../data';

import MERGED_MOCK_DATA from './mergedMockData.json';

describe('extracting conditions', () => {
  test('empty input', () => {
    expect(toSupportedConditions([])).toEqual({});
  });
  it('extracts supported condition', () => {
    expect(
      toSupportedConditions([
        {
          type: 'URLNotValid',
          status: 'True',
          category: 'Critical',
          message: 'Not responding',
          lastTransitionTime: '2020-08-21T18:36:41.468Z',
          reason: '',
        },
      ]),
    ).toEqual({ URLNotValid: { status: 'True', message: 'Not responding' } });
  });
  it('maps unknown status to Unknown', () => {
    expect(
      toSupportedConditions([
        {
          type: 'URLNotValid',
          status: undefined,
          message: 'Not responding',
        },
      ]),
    ).toEqual({ URLNotValid: { status: 'Unknown', message: 'Not responding' } });
  });
  it('extracts also unsupported conditions (typing is used to cherry-pick the supported via desctructuring', () => {
    expect(
      toSupportedConditions([
        {
          type: 'FooBar',
          status: 'False',
          message: 'BarFoo',
        },
      ]),
    ).toEqual({ FooBar: { status: 'False', message: 'BarFoo' } });
  });
});

describe('grouping pairs', () => {
  test('empty input', () => {
    expect(groupPairs([], { openshift: [], ovirt: [], vsphere: [] })).toHaveLength(0);
  });
  it('skipps inventory without resource', () => {
    const result = groupPairs([MOCK_INVENTORY_PROVIDERS.openshift[0].object as ProviderResource], {
      openshift: [MOCK_INVENTORY_PROVIDERS.openshift[1]],
      ovirt: [],
      vsphere: [],
    });
    expect(result).toHaveLength(1);
    const [[provider, inventory]] = result;
    expect(inventory).toStrictEqual({});
    expect(provider).toEqual(MOCK_INVENTORY_PROVIDERS.openshift[0].object);
  });
  it('skipps items without UID', () => {
    const provider = MOCK_INVENTORY_PROVIDERS.openshift[0];
    const k8sNoUid: ProviderResource = {
      ...provider.object,
      metadata: { ...(provider.object.metadata as ObjectMetadata), uid: undefined },
    };
    expect(
      groupPairs([k8sNoUid], {
        openshift: [{ ...provider, uid: undefined }],
        ovirt: [],
        vsphere: [],
      }),
    ).toHaveLength(0);
  });
  it('groups into pairs', () => {
    const provider = MOCK_INVENTORY_PROVIDERS.openshift[0];
    expect(
      groupPairs([provider.object as ProviderResource], {
        openshift: [provider],
        ovirt: [],
        vsphere: [],
      }),
    ).toEqual([[provider.object, provider]]);
  });
});

describe('merging k8s Provider with inventory Provider', () => {
  test('empty input', () => {
    expect(mergeData([])).toHaveLength(0);
  });

  test('standard mock data', () => {
    const merged = mergeData(
      groupPairs(MOCK_CLUSTER_PROVIDERS as ProviderResource[], MOCK_INVENTORY_PROVIDERS),
    );
    expect(merged).toEqual(MERGED_MOCK_DATA);
  });
});
