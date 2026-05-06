import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { getEc2Url } from 'src/providers/utils/helpers/getEc2Url';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';

import { ProviderFormFieldId } from '../fields/constants';
import type { Ec2FormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildEc2ProviderResources = (formData: Ec2FormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const ec2Region = formData[ProviderFormFieldId.Ec2Region] ?? '';
  const accessKeyId = formData[ProviderFormFieldId.Ec2AccessKeyId] ?? '';
  const secretAccessKey = formData[ProviderFormFieldId.Ec2SecretAccessKey] ?? '';
  const targetAz = formData[ProviderFormFieldId.Ec2TargetAz] ?? '';
  const targetRegion = formData[ProviderFormFieldId.Ec2TargetRegion] ?? '';
  const autoTargetCredentials = formData[ProviderFormFieldId.Ec2AutoTargetCredentials] ?? false;
  const useCrossAccount = formData[ProviderFormFieldId.Ec2UseCrossAccountCredentials] ?? false;
  const targetAccessKeyId = formData[ProviderFormFieldId.Ec2TargetAccessKeyId] ?? '';
  const targetSecretAccessKey = formData[ProviderFormFieldId.Ec2TargetSecretAccessKey] ?? '';

  const ec2Url = getEc2Url(ec2Region);

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.ec2,
    url: ec2Url,
  });

  if (provider.spec) {
    provider.spec.settings = {
      ec2Region: ec2Region.trim(),
      ...(autoTargetCredentials && { autoTargetCredentials: 'true' }),
      ...(!autoTargetCredentials && targetAz?.trim() && { 'target-az': targetAz.trim() }),
      ...(!autoTargetCredentials &&
        targetRegion?.trim() && { 'target-region': targetRegion.trim() }),
    };
  }

  const secretData: Record<string, string> = {
    accessKeyId: encode(accessKeyId.trim()),
    insecureSkipVerify: encode('false'),
    region: encode(ec2Region.trim()),
    secretAccessKey: encode(secretAccessKey.trim()),
    url: encode(ec2Url),
  };

  if (useCrossAccount) {
    if (targetAccessKeyId?.trim()) {
      secretData.targetAccessKeyId = encode(targetAccessKeyId.trim());
    }
    if (targetSecretAccessKey?.trim()) {
      secretData.targetSecretAccessKey = encode(targetSecretAccessKey.trim());
    }
  }

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};
