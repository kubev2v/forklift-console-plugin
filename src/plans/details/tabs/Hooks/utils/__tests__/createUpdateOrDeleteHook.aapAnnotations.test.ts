import { HOOK_SOURCE_AAP } from 'src/plans/create/steps/migration-hooks/constants';

import type { V1beta1Hook, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ANNOTATION_AAP_JOB_TEMPLATE_NAME } from '@utils/types/aap';

import { hookTypes } from '../constants';
import { createHook, deleteHook, getAapHookTemplate, updateHook } from '../hookOperations';
import { createUpdateOrDeleteHook } from '../utils';

jest.mock('../hookOperations', () => ({
  createHook: jest.fn(),
  deleteHook: jest.fn(),
  getAapConfig: jest.fn(),
  getAapHookTemplate: jest.fn(),
  getLocalHookTemplate: jest.fn(),
  updateHook: jest.fn(),
}));

const mockUpdateHook = jest.mocked(updateHook);
const mockGetAapHookTemplate = jest.mocked(getAapHookTemplate);

const plan = { metadata: { name: 'plan-1', namespace: 'ns' } } as V1beta1Plan;
const existingHook = {
  metadata: { annotations: { keep: 'yes' }, name: 'hook-1' },
  spec: { image: 'old', playbook: 'old', serviceAccount: 'old' },
} as unknown as V1beta1Hook;

describe('createUpdateOrDeleteHook - AAP annotations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateHook.mockResolvedValue(undefined);
    mockGetAapHookTemplate.mockReturnValue({ metadata: { name: 'aap-hook' } } as V1beta1Hook);
    jest.mocked(createHook).mockResolvedValue(plan);
    jest.mocked(deleteHook).mockResolvedValue(plan);
  });

  it('clears template-name annotation when omitted on update', async () => {
    const hookWithTemplateName = {
      ...existingHook,
      metadata: {
        ...existingHook.metadata,
        annotations: {
          keep: 'yes',
          [ANNOTATION_AAP_JOB_TEMPLATE_NAME]: 'old-tmpl',
        },
      },
    } as unknown as V1beta1Hook;

    await createUpdateOrDeleteHook({
      aapJobTemplateId: 9,
      hook: hookWithTemplateName,
      hookSet: true,
      hookSource: HOOK_SOURCE_AAP,
      plan,
      step: hookTypes.PostHook,
    });

    expect(mockUpdateHook.mock.calls[0][0].metadata?.annotations).toEqual({ keep: 'yes' });
    expect(mockUpdateHook.mock.calls[0][0].metadata?.annotations).not.toHaveProperty(
      ANNOTATION_AAP_JOB_TEMPLATE_NAME,
    );
  });

  it('sets template-name annotation when provided on update', async () => {
    await createUpdateOrDeleteHook({
      aapJobTemplateId: 9,
      aapJobTemplateName: 'new-tmpl',
      hook: existingHook,
      hookSet: true,
      hookSource: HOOK_SOURCE_AAP,
      plan,
      step: hookTypes.PostHook,
    });

    expect(mockUpdateHook).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          annotations: {
            keep: 'yes',
            [ANNOTATION_AAP_JOB_TEMPLATE_NAME]: 'new-tmpl',
          },
        }),
        spec: { aap: { jobTemplateId: 9 } },
      }),
    );
  });
});
