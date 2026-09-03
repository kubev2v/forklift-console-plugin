import {
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
} from 'src/plans/create/steps/migration-hooks/constants';

import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { hookTypes } from '../constants';
import {
  createHook,
  deleteHook,
  getAapHookTemplate,
  getLocalHookTemplate,
  updateHook,
} from '../hookOperations';
import { createUpdateOrDeleteHook } from '../utils';

jest.mock('../hookOperations', () => ({
  createHook: jest.fn(),
  deleteHook: jest.fn(),
  getAapConfig: jest.fn(),
  getAapHookTemplate: jest.fn(),
  getLocalHookTemplate: jest.fn(),
  updateHook: jest.fn(),
}));

const mockCreateHook = jest.mocked(createHook);
const mockDeleteHook = jest.mocked(deleteHook);
const mockGetAapHookTemplate = jest.mocked(getAapHookTemplate);
const mockGetLocalHookTemplate = jest.mocked(getLocalHookTemplate);
const mockUpdateHook = jest.mocked(updateHook);

const plan = { metadata: { name: 'plan-1', namespace: 'ns' } } as V1beta1Plan;
const existingHook = {
  metadata: { annotations: { keep: 'yes' }, name: 'hook-1' },
  spec: { image: 'old', playbook: 'old', serviceAccount: 'old' },
} as unknown as V1beta1Hook;

describe('createUpdateOrDeleteHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateHook.mockResolvedValue(plan);
    mockDeleteHook.mockResolvedValue(plan);
    mockUpdateHook.mockResolvedValue(undefined);
    mockGetAapHookTemplate.mockReturnValue({ metadata: { name: 'aap-hook' } } as V1beta1Hook);
    mockGetLocalHookTemplate.mockReturnValue({ metadata: { name: 'local-hook' } } as V1beta1Hook);
  });

  it('deletes when hookSet is false and a hook exists', async () => {
    await expect(
      createUpdateOrDeleteHook({
        hook: existingHook,
        hookSet: false,
        plan,
        step: hookTypes.PreHook,
      }),
    ).resolves.toBe(plan);
    expect(mockDeleteHook).toHaveBeenCalledWith(plan, existingHook, hookTypes.PreHook);
  });

  it('returns plan unchanged when hookSet is false and no hook', async () => {
    await expect(
      createUpdateOrDeleteHook({ hookSet: false, plan, step: hookTypes.PostHook }),
    ).resolves.toBe(plan);
    expect(mockDeleteHook).not.toHaveBeenCalled();
  });

  it('creates AAP hook when source is AAP and no existing hook', async () => {
    await createUpdateOrDeleteHook({
      aapJobTemplateId: 7,
      aapJobTemplateName: 'tmpl',
      hookSet: true,
      hookSource: HOOK_SOURCE_AAP,
      plan,
      step: hookTypes.PreHook,
    });
    expect(mockGetAapHookTemplate).toHaveBeenCalledWith({
      aapJobTemplateId: 7,
      aapJobTemplateName: 'tmpl',
      plan,
      step: hookTypes.PreHook,
    });
    expect(mockCreateHook).toHaveBeenCalled();
  });

  it('creates local hook with empty defaults when fields omitted', async () => {
    await createUpdateOrDeleteHook({
      hookSet: true,
      hookSource: HOOK_SOURCE_LOCAL,
      plan,
      step: hookTypes.PreHook,
    });
    expect(mockGetLocalHookTemplate).toHaveBeenCalledWith({
      image: '',
      plan,
      playbook: '',
      serviceAccount: '',
      step: hookTypes.PreHook,
    });
    expect(mockCreateHook).toHaveBeenCalled();
  });

  it('updates local hook, clears aap, and defaults source to none', async () => {
    await createUpdateOrDeleteHook({
      hook: { ...existingHook, spec: { ...existingHook.spec, aap: { jobTemplateId: 1 } } },
      hookImage: 'img',
      hookPlaybook: 'pb',
      hookServiceAccount: 'sa',
      hookSet: true,
      plan,
      step: hookTypes.PreHook,
    });
    expect(mockUpdateHook.mock.calls[0][0].spec).toEqual({
      image: 'img',
      playbook: 'pb',
      serviceAccount: 'sa',
    });
  });

  it('falls through to local path when AAP source lacks job template id', async () => {
    await createUpdateOrDeleteHook({
      hookSet: true,
      hookSource: HOOK_SOURCE_AAP,
      plan,
      step: hookTypes.PreHook,
    });
    expect(mockGetAapHookTemplate).not.toHaveBeenCalled();
    expect(mockGetLocalHookTemplate).toHaveBeenCalled();
  });
});
