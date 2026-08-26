import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockAddOwnerRefs = jest.fn();

jest.mock('../addOwnerRefs', () => ({
  addOwnerRefs: (...args: unknown[]) => mockAddOwnerRefs(...args),
}));

import { HookModel, NetworkMapModel, SecretModel, StorageMapModel } from '@forklift-ui/types';
import { ConfigMapModel } from '@utils/constants';

import { addPlanResourceOwnerRefs } from '../addPlanResourceOwnerRefs';

const planRef = { apiVersion: 'v1', kind: 'Plan', name: 'plan', uid: 'u1' };

describe('addPlanResourceOwnerRefs - ownerRefs', () => {
  beforeEach(() => {
    mockAddOwnerRefs.mockReset();
    mockAddOwnerRefs.mockResolvedValue({});
  });

  it('always owns storage and network maps', async () => {
    const networkMap = { metadata: { name: 'nm' } } as never;
    const storageMap = { metadata: { name: 'sm' } } as never;

    await addPlanResourceOwnerRefs({ hooks: {}, networkMap, storageMap }, planRef);

    expect(mockAddOwnerRefs).toHaveBeenCalledTimes(2);
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(StorageMapModel, storageMap, [planRef]);
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(NetworkMapModel, networkMap, [planRef]);
  });

  it('owns optional secret, hooks, and scripts config map when present', async () => {
    const resources = {
      hooks: {
        postHook: { metadata: { name: 'post' } } as never,
        preHook: { metadata: { name: 'pre' } } as never,
      },
      networkMap: { metadata: { name: 'nm' } } as never,
      scriptsConfigMap: { metadata: { name: 'cm' } } as never,
      secret: { metadata: { name: 'sec' } } as never,
      storageMap: { metadata: { name: 'sm' } } as never,
    };

    await addPlanResourceOwnerRefs(resources, planRef);

    expect(mockAddOwnerRefs).toHaveBeenCalledTimes(6);
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(SecretModel, resources.secret, [planRef]);
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(HookModel, resources.hooks.preHook, [planRef]);
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(HookModel, resources.hooks.postHook, [planRef]);
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(
      ConfigMapModel,
      resources.scriptsConfigMap,
      [planRef],
    );
  });
});
