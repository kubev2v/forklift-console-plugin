import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { cancelValidation, rerunValidation } from '../patchValidation';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: jest.fn(),
}));

const mockK8sPatch = jest.mocked(k8sPatch);

describe('validation lifecycle patches', () => {
  const validation = {
    apiVersion: 'validation.kubevirt.io/v1alpha1',
    kind: 'VirtualizationValidation',
    metadata: { name: 'vv-provider', namespace: 'openshift-mtv' },
  };

  beforeEach(() => {
    mockK8sPatch.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets run.cancel to abort an active validation', async () => {
    await cancelValidation(validation);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'replace', path: '/spec/run/cancel', value: true }],
      }),
    );
  });

  it('changes run.id and clears cancellation for a rerun', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(42);

    await rerunValidation(validation);

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          { op: 'replace', path: '/spec/run/cancel', value: false },
          { op: 'replace', path: '/spec/run/id', value: 'rerun-16' },
        ],
      }),
    );
  });
});
