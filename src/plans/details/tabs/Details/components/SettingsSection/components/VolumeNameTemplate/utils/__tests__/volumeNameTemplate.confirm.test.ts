import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve({}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown =>
    (mockK8sPatch as (...a: unknown[]) => unknown)(...args),
}));

import { onConfirmVolumeNameTemplate } from '../utils';

describe('VolumeNameTemplate utils - confirm', () => {
  beforeEach(() => {
    mockK8sPatch.mockReset();
    mockK8sPatch.mockResolvedValue({});
  });

  it('patches volumeNameTemplate', async () => {
    await onConfirmVolumeNameTemplate({
      newValue: 'vol',
      resource: { metadata: { name: 'p' }, spec: { volumeNameTemplate: 'old' } } as never,
    });
    expect((mockK8sPatch.mock.calls[0] as unknown as [{ data: unknown[] }])[0].data[0]).toEqual(
      expect.objectContaining({ op: 'replace', path: '/spec/volumeNameTemplate', value: 'vol' }),
    );
  });
});
