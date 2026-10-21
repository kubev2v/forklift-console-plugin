import { VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';

const provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: {
    annotations: { 'forklift.konveyor.io/ui-disk-transfer-method': 'copy-appliance' },
    name: 'source',
    namespace: 'ns',
    uid: 'uid',
  },
  spec: {
    settings: {
      copyApplianceDatastore: 'old-datastore',
      copyApplianceFolder: '/old-folder',
      copyApplianceNetwork: 'old-network',
      copyApplianceResourcePool: '/old-pool',
      sdkEndpoint: 'esxi',
    },
  },
} as unknown as V1beta1Provider;
const template = {
  metadata: { name: 'source-copy-appliance-template', namespace: 'ns' },
} as V1beta1CopyApplianceTemplate;
const mockK8sPatch = jest.fn((..._args: unknown[]) => Promise.resolve(provider));
const mockK8sDelete = jest.fn((..._args: unknown[]) => Promise.resolve({}));
const mockCreateTemplate = jest.fn((..._args: unknown[]) => Promise.resolve(template));

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sDelete: (...args: unknown[]) => mockK8sDelete(...args),
  k8sPatch: (...args: unknown[]) => mockK8sPatch(...args),
}));
jest.mock('../../DetailsSection/onCreateCopyApplianceTemplate', (): unknown => ({
  __esModule: true,
  default: (...args: unknown[]) => mockCreateTemplate(...args),
}));

import { CopyApplianceTemplatePlacementMismatchError } from '../../DetailsSection/CopyApplianceTemplatePlacementMismatchError';
import { DiskTransferSaveError, saveDiskTransferSettings } from '../saveDiskTransferSettings';
import type { DiskTransferValues } from '../types';

const values: DiskTransferValues = {
  aioEnabled: false,
  method: VddkSetupMode.CopyAppliance,
  placement: {
    datastore: 'new-datastore',
    folder: '/new-folder',
    network: 'new-network',
    resourcePool: '/new-pool',
  },
  vddkImage: '',
};

describe('saveDiskTransferSettings', () => {
  beforeEach(() => {
    mockK8sDelete.mockClear();
    mockK8sPatch.mockClear();
    mockCreateTemplate.mockClear();
  });

  it('updates placement on Provider only when the template already exists', async () => {
    await saveDiskTransferSettings(provider, template, values);

    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          {
            op: 'replace',
            path: '/spec/settings/copyApplianceResourcePool',
            value: '/new-pool',
          },
        ]),
      }),
    );
    expect(mockK8sDelete).not.toHaveBeenCalled();
    expect(mockCreateTemplate).not.toHaveBeenCalled();
  });

  it('deletes the template before clearing placement on skip', async () => {
    await saveDiskTransferSettings(provider, template, { ...values, method: VddkSetupMode.Skip });

    expect(mockK8sDelete).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    expect(mockK8sDelete.mock.invocationCallOrder[0]).toBeLessThan(
      mockK8sPatch.mock.invocationCallOrder[0],
    );
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          { op: 'remove', path: '/spec/settings/copyApplianceDatastore' },
          {
            op: 'remove',
            path: '/metadata/annotations/forklift.konveyor.io~1ui-disk-transfer-method',
          },
        ]),
      }),
    );
  });

  it('reports a recoverable partial failure after deletion and permits a retry', async () => {
    mockK8sPatch.mockRejectedValueOnce(new Error('conflict'));

    await expect(
      saveDiskTransferSettings(provider, template, { ...values, method: VddkSetupMode.Skip }),
    ).rejects.toMatchObject({ templateDeleted: true });
    await saveDiskTransferSettings(provider, undefined, { ...values, method: VddkSetupMode.Skip });

    expect(mockK8sDelete).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledTimes(2);
  });

  it('continues when the template was already deleted elsewhere', async () => {
    mockK8sDelete.mockRejectedValueOnce({ code: 404 });

    await saveDiskTransferSettings(provider, template, { ...values, method: VddkSetupMode.Skip });

    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
  });

  it('marks the provider pending before creating a new template and reports creation failure', async () => {
    mockCreateTemplate.mockRejectedValueOnce(new Error('quota exceeded'));

    await expect(saveDiskTransferSettings(provider, undefined, values)).rejects.toBeInstanceOf(
      DiskTransferSaveError,
    );
    expect(mockK8sPatch.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreateTemplate.mock.invocationCallOrder[0],
    );
    expect(mockK8sDelete).not.toHaveBeenCalled();
  });

  it('shows how to edit an existing template after a placement conflict', async () => {
    mockCreateTemplate.mockRejectedValueOnce(new CopyApplianceTemplatePlacementMismatchError());

    await expect(saveDiskTransferSettings(provider, undefined, values)).rejects.toThrow(
      'Close this form and edit disk transfer from the provider Details tab.',
    );
  });
});
