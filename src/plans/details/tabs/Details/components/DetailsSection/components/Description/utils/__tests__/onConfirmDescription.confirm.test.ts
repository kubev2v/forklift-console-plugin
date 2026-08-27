import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));

import { onConfirmDescription } from '../utils';

describe('Description utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches plan description', async () => {
    const resource = { metadata: { name: 'p' }, spec: { description: 'old' } } as never;
    await onConfirmDescription({ newValue: 'new', resource });
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ path: '/spec/description', value: 'new' }),
        ]),
        resource,
      }),
    );
  });
});
