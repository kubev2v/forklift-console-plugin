import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from '@kubev2v/legacy/queries/mocks/providers.mock';
import { V1beta1Provider } from '@kubev2v/types';
import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

import { groupPairs, mergeData } from '../data';

import MERGED_MOCK_DATA from './mergedMockData.json';

describe('grouping pairs', () => {
  test('empty input', () => {
    expect(groupPairs([], { openshift: [], ovirt: [], openstack: [], vsphere: [] })).toHaveLength(
      0,
    );
  });
  it('skipps inventory without resource', () => {
    const result = groupPairs([MOCK_INVENTORY_PROVIDERS.openshift[0].object as V1beta1Provider], {
      openshift: [MOCK_INVENTORY_PROVIDERS.openshift[1]],
      ovirt: [],
      openstack: [],
      vsphere: [],
    });
    expect(result).toHaveLength(1);
    const [[provider, inventory]] = result;
    expect(inventory).toStrictEqual({});
    expect(provider).toEqual(MOCK_INVENTORY_PROVIDERS.openshift[0].object);
  });
  it('skipps items without UID', () => {
    const provider = MOCK_INVENTORY_PROVIDERS.openshift[0];
    const k8sNoUid: V1beta1Provider = {
      ...provider.object,
      metadata: { ...(provider.object.metadata as ObjectMetadata), uid: undefined },
    };
    expect(
      groupPairs([k8sNoUid], {
        openshift: [{ ...provider, uid: undefined }],
        ovirt: [],
        openstack: [],
        vsphere: [],
      }),
    ).toHaveLength(0);
  });
  it('groups into pairs', () => {
    const provider = MOCK_INVENTORY_PROVIDERS.openshift[0];
    expect(
      groupPairs([provider.object as V1beta1Provider], {
        openshift: [provider],
        ovirt: [],
        openstack: [],
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
      groupPairs(MOCK_CLUSTER_PROVIDERS as V1beta1Provider[], MOCK_INVENTORY_PROVIDERS),
    );
    expect(JSON.parse(JSON.stringify(merged))).toEqual(MERGED_MOCK_DATA);
  });
});
