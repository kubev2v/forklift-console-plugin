import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import type { CreateProviderFormData } from '../types';

import { buildProviderResources } from './buildProviderResources';
import { createProvider } from './createProvider';
import { createProviderSecret } from './createProviderSecret';
import { findCreatedProvider } from './findCreatedProvider';
import { patchProviderSecretOwner } from './patchProviderSecretOwner';
import type { ProviderCreationProgress } from './providerCreation.types';
import { providerCredentialsChanged, validateProviderRetry } from './validateProviderRetry';

const createOrRecoverProvider = async (
  requested: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): Promise<V1beta1Provider | undefined> => {
  try {
    return await createProvider(requested, secret);
  } catch (error) {
    const provider = await findCreatedProvider(requested, secret);
    if (!provider) {
      throw error;
    }
    return provider;
  }
};

const createProviderResources = async (
  formData: CreateProviderFormData,
  progress: ProviderCreationProgress,
): Promise<V1beta1Provider> => {
  const resources = buildProviderResources(formData);
  const previousResources = progress.resources;
  validateProviderRetry(resources, progress);
  progress.resources = resources;

  if (
    progress.secret &&
    !progress.provider &&
    previousResources &&
    providerCredentialsChanged(resources, previousResources)
  ) {
    await k8sDelete({ model: SecretModel, resource: progress.secret }).catch(() => undefined);
    // eslint-disable-next-line require-atomic-updates -- Replacing the Secret of this attempt.
    progress.secret = undefined;
    // eslint-disable-next-line require-atomic-updates -- Replacing the Secret of this attempt.
    progress.ownerPatched = false;
  }

  const secret =
    progress.secret ?? (await createProviderSecret(resources.provider, resources.secret));
  if (!secret) {
    throw new Error(t('Unable to create provider Secret'));
  }
  // eslint-disable-next-line require-atomic-updates -- Calls share progress.inFlight until this operation completes.
  progress.secret = secret;

  const provider = progress.provider ?? (await createOrRecoverProvider(resources.provider, secret));
  if (!provider) {
    throw new Error(t('Unable to create Provider'));
  }
  // eslint-disable-next-line require-atomic-updates -- Calls share progress.inFlight until this operation completes.
  progress.provider = provider;

  if (!progress.ownerPatched) {
    await patchProviderSecretOwner(provider, secret);
    // eslint-disable-next-line require-atomic-updates -- Calls share progress.inFlight until this operation completes.
    progress.ownerPatched = true;
  }
  return provider;
};

export const createProviderOnce = async (
  formData: CreateProviderFormData,
  progress: ProviderCreationProgress,
): Promise<V1beta1Provider> => {
  if (progress.inFlight) {
    return progress.inFlight;
  }

  try {
    progress.inFlight = createProviderResources(formData, progress);
    return await progress.inFlight;
  } finally {
    // eslint-disable-next-line require-atomic-updates -- Calls share progress.inFlight until this operation completes.
    progress.inFlight = undefined;
  }
};
