import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';

import type { CreateProviderFormData } from '../types';

import { buildProviderResources } from './buildProviderResources';
import { createProvider } from './createProvider';
import { createProviderSecret } from './createProviderSecret';
import { findCreatedProvider } from './findCreatedProvider';
import { patchProviderSecretOwner } from './patchProviderSecretOwner';

export type ProviderCreationProgress = {
  inFlight?: Promise<V1beta1Provider>;
  ownerPatched?: boolean;
  provider?: V1beta1Provider;
  resources?: ReturnType<typeof buildProviderResources>;
  secret?: IoK8sApiCoreV1Secret;
};

const setCreatedSecret = (
  progress: ProviderCreationProgress,
  secret: IoK8sApiCoreV1Secret,
): void => {
  progress.secret = secret;
};

const setCreatedProvider = (
  progress: ProviderCreationProgress,
  provider: V1beta1Provider | undefined,
): void => {
  progress.provider = provider;
};

const markOwnerPatched = (progress: ProviderCreationProgress): void => {
  progress.ownerPatched = true;
};

const createWithProgress = async (
  formData: CreateProviderFormData,
  progress: ProviderCreationProgress,
): Promise<V1beta1Provider> => {
  const requestedResources = buildProviderResources(formData);
  const previousResources = progress.resources;
  if (progress.provider) {
    if (JSON.stringify(requestedResources) !== JSON.stringify(previousResources)) {
      throw new Error('Provider already exists. Retry with the original settings.');
    }
  } else if (progress.secret) {
    const previousProvider = previousResources?.provider;
    const requestedProvider = requestedResources.provider;
    if (
      JSON.stringify(requestedResources.secret) !== JSON.stringify(previousResources?.secret) ||
      requestedProvider.metadata?.name !== previousProvider?.metadata?.name ||
      requestedProvider.metadata?.namespace !== previousProvider?.metadata?.namespace ||
      requestedProvider.spec?.type !== previousProvider?.spec?.type ||
      requestedProvider.spec?.url !== previousProvider?.spec?.url
    ) {
      throw new Error('Credentials and Provider identity cannot change after Secret creation.');
    }
    progress.resources = requestedResources;
  } else {
    progress.resources = requestedResources;
  }

  if (!progress.resources) {
    throw new Error('Unable to build Provider resources');
  }
  if (!progress.secret) {
    const secret = await createProviderSecret(
      progress.resources.provider,
      progress.resources.secret,
    );
    if (!secret) {
      throw new Error('Unable to create provider Secret');
    }
    setCreatedSecret(progress, secret);
  }

  if (!progress.secret) {
    throw new Error('Unable to create provider Secret');
  }

  if (!progress.provider) {
    try {
      const provider = await createProvider(progress.resources.provider, progress.secret);
      setCreatedProvider(progress, provider);
    } catch (error) {
      const provider = await findCreatedProvider(progress.resources.provider, progress.secret);
      setCreatedProvider(progress, provider);
      if (!progress.provider) {
        throw error;
      }
    }
  }
  if (!progress.provider) {
    throw new Error('Unable to create Provider');
  }

  if (!progress.ownerPatched) {
    await patchProviderSecretOwner(progress.provider, progress.secret);
    markOwnerPatched(progress);
  }

  return progress.provider;
};

export const createProviderOnce = async (
  formData: CreateProviderFormData,
  progress: ProviderCreationProgress,
): Promise<V1beta1Provider> => {
  if (progress.inFlight) {
    return progress.inFlight;
  }

  const operation = createWithProgress(formData, progress).finally(() => {
    progress.inFlight = undefined;
  });
  progress.inFlight = operation;
  return operation;
};
