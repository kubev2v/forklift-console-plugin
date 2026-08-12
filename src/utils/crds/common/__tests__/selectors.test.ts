import type { OwnerReference } from '@openshift-console/dynamic-plugin-sdk';

import { getGroupVersionKindFromOwnerReference } from '../selectors';

describe('getGroupVersionKindFromOwnerReference', () => {
  it('parses grouped apiVersion', () => {
    const ownerReference = {
      apiVersion: 'apps/v1',
      kind: 'ReplicaSet',
      name: 'example',
      uid: '1',
    } as OwnerReference;

    expect(getGroupVersionKindFromOwnerReference(ownerReference)).toEqual({
      group: 'apps',
      kind: 'ReplicaSet',
      version: 'v1',
    });
  });

  it('parses core apiVersion without a group', () => {
    const ownerReference = {
      apiVersion: 'v1',
      kind: 'Secret',
      name: 'example',
      uid: '2',
    } as OwnerReference;

    expect(getGroupVersionKindFromOwnerReference(ownerReference)).toEqual({
      group: undefined,
      kind: 'Secret',
      version: 'v1',
    });
  });
});
