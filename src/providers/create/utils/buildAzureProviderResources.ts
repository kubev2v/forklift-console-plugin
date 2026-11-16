import { encode } from 'js-base64';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from '../fields/constants';
import type { AzureFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

const getTrimmedValue = (value: string | undefined): string => value?.trim() ?? '';

const buildAzureSettings = (formData: AzureFormData): Record<string, string> | undefined => {
  const settings: Record<string, string> = {};
  const snapshotResourceGroup = getTrimmedValue(
    formData[ProviderFormFieldId.AzureSnapshotResourceGroup],
  );
  const snapshotSku = getTrimmedValue(formData[ProviderFormFieldId.AzureSnapshotSku]);
  const targetRegion = getTrimmedValue(formData[ProviderFormFieldId.AzureTargetRegion]);
  const volumeSnapshotClassName = getTrimmedValue(
    formData[ProviderFormFieldId.AzureVolumeSnapshotClassName],
  );

  if (snapshotResourceGroup) {
    settings.snapshotResourceGroup = snapshotResourceGroup;
  }
  if (snapshotSku) {
    settings.snapshotSku = snapshotSku;
  }
  if (targetRegion) {
    settings.targetRegion = targetRegion;
  }
  if (volumeSnapshotClassName) {
    settings.volumeSnapshotClassName = volumeSnapshotClassName;
  }

  return isEmpty(settings) ? undefined : settings;
};

const buildAzureSecretData = (formData: AzureFormData): Record<string, string> => {
  const secretData: Record<string, string> = {
    clientId: encode(getTrimmedValue(formData[ProviderFormFieldId.AzureClientId])),
    clientSecret: encode(getTrimmedValue(formData[ProviderFormFieldId.AzureClientSecret])),
    subscriptionId: encode(getTrimmedValue(formData[ProviderFormFieldId.AzureSubscriptionId])),
    tenantId: encode(getTrimmedValue(formData[ProviderFormFieldId.AzureTenantId])),
  };

  const resourceGroup = getTrimmedValue(formData[ProviderFormFieldId.AzureResourceGroup]);

  if (resourceGroup) {
    secretData.resourceGroup = encode(resourceGroup);
  }

  return secretData;
};

export const buildAzureProviderResources = (formData: AzureFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];

  const provider = buildProviderObject({
    name: formData[ProviderFormFieldId.ProviderName],
    namespace,
    settings: buildAzureSettings(formData),
    type: PROVIDER_TYPES.azure,
  });

  const secret = buildSecretObject({
    data: buildAzureSecretData(formData),
    namespace,
  });

  return { provider, secret };
};
