import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../buildProviderResources', () => ({ buildProviderResources: jest.fn() }));
jest.mock('../createProviderSecret', () => ({ createProviderSecret: jest.fn() }));
jest.mock('../createProvider', () => ({ createProvider: jest.fn() }));
jest.mock('../findCreatedProvider', () => ({ findCreatedProvider: jest.fn() }));
jest.mock('../patchProviderSecretOwner', () => ({ patchProviderSecretOwner: jest.fn() }));

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';

import { VddkSetupMode } from '../../../utils/constants';
import { ProviderFormFieldId } from '../../fields/constants';
import type { CreateProviderFormData } from '../../types';
import { buildProviderResources } from '../buildProviderResources';
import { createProvider } from '../createProvider';
import { createProviderOnce } from '../createProviderOnce';
import { createProviderSecret } from '../createProviderSecret';
import { findCreatedProvider } from '../findCreatedProvider';
import { patchProviderSecretOwner } from '../patchProviderSecretOwner';
import type { ProviderCreationProgress } from '../providerCreation.types';

const mockBuild = buildProviderResources as jest.MockedFunction<typeof buildProviderResources>;
const mockCreateSecret = createProviderSecret as jest.MockedFunction<typeof createProviderSecret>;
const mockCreateProvider = createProvider as jest.MockedFunction<typeof createProvider>;
const mockFindProvider = findCreatedProvider as jest.MockedFunction<typeof findCreatedProvider>;
const mockPatchOwner = patchProviderSecretOwner as jest.MockedFunction<
  typeof patchProviderSecretOwner
>;

const provider = { metadata: { name: 'source', namespace: 'ns', uid: 'uid' } } as V1beta1Provider;
const secret = { metadata: { name: 'secret', namespace: 'ns' } } as IoK8sApiCoreV1Secret;
const formData = {
  providerName: 'source',
  providerProject: 'ns',
  providerType: 'vsphere',
} as CreateProviderFormData;

describe('createProviderOnce', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBuild.mockReturnValue({ provider, secret });
    mockCreateSecret.mockResolvedValue(secret);
    mockCreateProvider.mockResolvedValue(provider);
    mockFindProvider.mockResolvedValue(undefined);
    mockPatchOwner.mockResolvedValue(undefined);
  });

  it('retries the owner patch without recreating Secret or Provider', async () => {
    const progress: ProviderCreationProgress = {};
    mockPatchOwner.mockRejectedValueOnce(new Error('Temporary patch failure'));

    await expect(createProviderOnce(formData, progress)).rejects.toThrow('Temporary patch failure');
    await expect(createProviderOnce(formData, progress)).resolves.toBe(provider);

    expect(mockBuild).toHaveBeenCalledTimes(2);
    expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    expect(mockCreateProvider).toHaveBeenCalledTimes(1);
    expect(mockPatchOwner).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent create requests', async () => {
    const progress: ProviderCreationProgress = {};

    await Promise.all([
      createProviderOnce(formData, progress),
      createProviderOnce(formData, progress),
    ]);

    expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    expect(mockCreateProvider).toHaveBeenCalledTimes(1);
  });

  it('uses a new disk method after Secret creation without recreating the Secret', async () => {
    const progress: ProviderCreationProgress = {};
    const copyApplianceData = {
      ...formData,
      [ProviderFormFieldId.VsphereVddkSetupMode]: VddkSetupMode.CopyAppliance,
    };
    const skipData = {
      ...formData,
      [ProviderFormFieldId.VsphereVddkSetupMode]: VddkSetupMode.Skip,
    };
    const annotatedProvider = {
      ...provider,
      metadata: { ...provider.metadata, annotations: { method: 'copy-appliance' } },
    } as V1beta1Provider;
    mockBuild.mockImplementation((values) => ({
      provider:
        values[ProviderFormFieldId.VsphereVddkSetupMode] === VddkSetupMode.CopyAppliance
          ? annotatedProvider
          : provider,
      secret,
    }));
    mockCreateProvider.mockRejectedValueOnce(new Error('Temporary Provider failure'));

    await expect(createProviderOnce(copyApplianceData, progress)).rejects.toThrow(
      'Temporary Provider failure',
    );
    await expect(createProviderOnce(skipData, progress)).resolves.toBe(provider);

    expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    expect(mockCreateProvider).toHaveBeenCalledTimes(2);
    expect(mockCreateProvider).toHaveBeenLastCalledWith(provider, secret);
  });

  it('does not use changed credentials after Secret creation', async () => {
    const progress: ProviderCreationProgress = {};
    const updatedData = { ...formData, vspherePassword: 'new-password' };
    mockBuild.mockImplementation((values) => ({
      provider,
      secret:
        values.vspherePassword === 'new-password'
          ? { ...secret, data: { password: 'changed' } }
          : secret,
    }));
    mockCreateProvider.mockRejectedValueOnce(new Error('Temporary Provider failure'));

    await expect(createProviderOnce(formData, progress)).rejects.toThrow(
      'Temporary Provider failure',
    );
    await expect(createProviderOnce(updatedData, progress)).rejects.toThrow(
      'Credentials and Provider identity cannot change',
    );
    expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    expect(mockCreateProvider).toHaveBeenCalledTimes(1);
  });

  it('rejects a URL change because the existing Secret contains the original URL', async () => {
    const progress: ProviderCreationProgress = {};
    const originalData = { ...formData, vsphereUrl: 'https://original.example.com' };
    const changedData = { ...formData, vsphereUrl: 'https://changed.example.com' };
    mockBuild.mockImplementation((values) => ({
      provider: {
        ...provider,
        spec: {
          secret: { name: undefined, namespace: 'ns' },
          type: 'vsphere',
          url: values.vsphereUrl,
        },
      },
      secret: { ...secret, data: { url: values.vsphereUrl ?? '' } },
    }));
    mockCreateProvider.mockRejectedValueOnce(new Error('Invalid Provider URL'));

    await expect(createProviderOnce(originalData, progress)).rejects.toThrow(
      'Invalid Provider URL',
    );
    await expect(createProviderOnce(changedData, progress)).rejects.toThrow(
      'Credentials and Provider identity cannot change',
    );
    expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    expect(mockCreateProvider).toHaveBeenCalledTimes(1);
  });

  it('reuses an owned Provider when its create response is lost', async () => {
    const progress: ProviderCreationProgress = {};
    mockCreateProvider.mockRejectedValueOnce(new Error('response lost'));
    mockFindProvider.mockResolvedValueOnce(provider);

    await expect(createProviderOnce(formData, progress)).resolves.toBe(provider);
    await expect(createProviderOnce(formData, progress)).resolves.toBe(provider);

    expect(mockCreateSecret).toHaveBeenCalledTimes(1);
    expect(mockCreateProvider).toHaveBeenCalledTimes(1);
    expect(mockFindProvider).toHaveBeenCalledWith(provider, secret);
    expect(mockPatchOwner).toHaveBeenCalledTimes(1);
  });
});
