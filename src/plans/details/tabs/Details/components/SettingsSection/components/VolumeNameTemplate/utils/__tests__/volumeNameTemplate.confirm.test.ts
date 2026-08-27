import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockK8sPatch = jest.fn() as jest.Mock;

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
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
    expect(mockK8sPatch.mock.calls[0][0].data[0]).toEqual(
      expect.objectContaining({ op: 'replace', path: '/spec/volumeNameTemplate', value: 'vol' }),
    );
  });
});
