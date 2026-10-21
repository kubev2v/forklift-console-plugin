import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';

const mockK8sCreate = jest.fn<Promise<V1beta1CopyApplianceTemplate>, [unknown]>();
const mockK8sGet = jest.fn<Promise<V1beta1CopyApplianceTemplate>, [unknown]>();
const mockK8sPatch = jest.fn<Promise<V1beta1Provider>, [unknown]>();

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sCreate: (options: unknown) => mockK8sCreate(options),
  k8sGet: (options: unknown) => mockK8sGet(options),
  k8sPatch: (options: unknown) => mockK8sPatch(options),
}));

import { CopyApplianceTemplateModel } from '@forklift-ui/types';

import { CopyApplianceTemplatePlacementMismatchError } from '../CopyApplianceTemplatePlacementMismatchError';
import onCreateCopyApplianceTemplate from '../onCreateCopyApplianceTemplate';

const placement = {
  datastore: 'datastore',
  folder: '/folder',
  network: 'network',
  resourcePool: '/pool',
};
const provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'source', namespace: 'ns', uid: 'provider-uid' },
  spec: {
    secret: { name: 'source-secret', namespace: 'ns' },
    settings: {
      copyApplianceDatastore: placement.datastore,
      copyApplianceFolder: placement.folder,
      copyApplianceNetwork: placement.network,
      copyApplianceResourcePool: placement.resourcePool,
    },
    type: 'vsphere',
  },
} as V1beta1Provider;
const template = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'CopyApplianceTemplate',
  metadata: {
    name: 'source-copy-appliance-template',
    namespace: 'ns',
    ownerReferences: [
      {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Provider',
        name: 'source',
        uid: 'provider-uid',
      },
    ],
  },
  spec: {
    baseDisk: {},
    datastore: placement.datastore,
    folder: placement.folder,
    network: placement.network,
    provider: { name: 'source', namespace: 'ns' },
    templateName: 'source-copy-appliance-template',
  },
} as V1beta1CopyApplianceTemplate;

describe('onCreateCopyApplianceTemplate', () => {
  beforeEach(() => {
    mockK8sCreate.mockReset();
    mockK8sGet.mockReset();
    mockK8sPatch.mockReset();
  });

  it('recovers the owned template when the create response is lost', async () => {
    mockK8sCreate.mockRejectedValueOnce(new Error('response lost'));
    mockK8sGet.mockResolvedValueOnce(template);

    await expect(onCreateCopyApplianceTemplate(provider, placement)).resolves.toBe(template);
    expect(mockK8sGet).toHaveBeenCalledWith({
      model: CopyApplianceTemplateModel,
      name: 'source-copy-appliance-template',
      ns: 'ns',
    });
  });

  it('accepts the owned template after a retry receives a conflict', async () => {
    mockK8sCreate.mockRejectedValueOnce(new Error('response lost'));
    mockK8sGet.mockRejectedValueOnce({ code: 404 });
    mockK8sCreate.mockRejectedValueOnce({ code: 409 });
    mockK8sGet.mockResolvedValueOnce(template);

    await expect(onCreateCopyApplianceTemplate(provider, placement)).rejects.toThrow(
      'response lost',
    );
    await expect(onCreateCopyApplianceTemplate(provider, placement)).resolves.toBe(template);
    expect(mockK8sCreate).toHaveBeenCalledTimes(2);
  });

  it('rejects an A to B retry when the persisted template still has placement A', async () => {
    mockK8sCreate.mockRejectedValueOnce(new Error('response lost'));
    mockK8sGet.mockRejectedValueOnce({ code: 404 });
    mockK8sCreate.mockRejectedValueOnce({ code: 409 });
    mockK8sGet.mockResolvedValueOnce(template);

    await expect(onCreateCopyApplianceTemplate(provider, placement)).rejects.toThrow(
      'response lost',
    );
    await expect(
      onCreateCopyApplianceTemplate(provider, { ...placement, datastore: 'datastore-B' }),
    ).rejects.toBeInstanceOf(CopyApplianceTemplatePlacementMismatchError);
    expect(mockK8sCreate).toHaveBeenCalledTimes(2);
  });

  it('preserves the create error when the named template belongs to another Provider', async () => {
    const conflict = { code: 409 };
    mockK8sCreate.mockRejectedValueOnce(conflict);
    mockK8sGet.mockResolvedValueOnce({
      ...template,
      metadata: {
        ...template.metadata,
        ownerReferences: [{ kind: 'Provider', name: 'source', uid: 'other-uid' }],
      },
    } as V1beta1CopyApplianceTemplate);

    await expect(onCreateCopyApplianceTemplate(provider, placement)).rejects.toBe(conflict);
  });
});
