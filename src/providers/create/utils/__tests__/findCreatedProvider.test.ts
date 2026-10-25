import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({ k8sGet: jest.fn() }));

import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import { type IoK8sApiCoreV1Secret, ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { findCreatedProvider } from '../findCreatedProvider';

const mockGet = k8sGet as jest.MockedFunction<typeof k8sGet>;
const requested = {
  metadata: {
    annotations: { [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance },
    name: 'source',
    namespace: 'ns',
  },
  spec: { settings: { sdkEndpoint: 'vcenter' }, type: 'vsphere', url: 'https://vc' },
} as unknown as V1beta1Provider;
const secret = { metadata: { name: 'source-secret', namespace: 'ns' } } as IoK8sApiCoreV1Secret;
const existing = {
  ...requested,
  spec: { ...requested.spec, secret: { name: 'source-secret', namespace: 'ns' } },
} as V1beta1Provider;

describe('findCreatedProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reconciles a Provider created for this Secret after a lost response', async () => {
    mockGet.mockResolvedValue(existing);

    await expect(findCreatedProvider(requested, secret)).resolves.toBe(existing);
    expect(mockGet).toHaveBeenCalledWith({ model: ProviderModel, name: 'source', ns: 'ns' });
  });

  it('does not accept a different Secret or disk transfer method', async () => {
    mockGet.mockResolvedValueOnce({
      ...existing,
      spec: { ...existing.spec, secret: { name: 'other-secret', namespace: 'ns' } },
    } as V1beta1Provider);
    await expect(findCreatedProvider(requested, secret)).resolves.toBeUndefined();

    mockGet.mockResolvedValueOnce({
      ...existing,
      metadata: { ...existing.metadata, annotations: {} },
    });
    await expect(findCreatedProvider(requested, secret)).resolves.toBeUndefined();
  });

  it('does not accept the old image after the create response is lost and the image changes', async () => {
    const requestedImage = {
      ...requested,
      metadata: { ...requested.metadata, annotations: {} },
      spec: {
        ...requested.spec,
        settings: { sdkEndpoint: 'vcenter', vddkInitImage: 'quay.io/vddk:new' },
      },
    } as V1beta1Provider;
    mockGet.mockResolvedValueOnce({
      ...requestedImage,
      spec: {
        ...requestedImage.spec,
        secret: { name: 'source-secret', namespace: 'ns' },
        settings: { sdkEndpoint: 'vcenter', vddkInitImage: 'quay.io/vddk:old' },
      },
    } as V1beta1Provider);

    await expect(findCreatedProvider(requestedImage, secret)).resolves.toBeUndefined();
  });
});
