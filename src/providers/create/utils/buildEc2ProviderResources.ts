import { encode } from 'js-base64';
import { getEc2Url } from 'src/providers/utils/helpers/getEc2Url';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from '../fields/constants';
import type { Ec2FormData, Ec2ResolvedTarget } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';
import { firstNonEmpty } from './firstNonEmpty';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

/**
 * Explicit form values win, then target settings resolved from the cluster, then the source
 * credentials (same-account default). The never-emitted `autoTargetCredentials` key is gone:
 * the target keys are mandatory for every EC2 provider, so they are always written.
 */
export const buildEc2ProviderResources = (
  formData: Ec2FormData,
  ec2Target?: Ec2ResolvedTarget,
): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const ec2Region = formData[ProviderFormFieldId.Ec2Region] ?? '';
  const accessKeyId = formData[ProviderFormFieldId.Ec2AccessKeyId] ?? '';
  const secretAccessKey = formData[ProviderFormFieldId.Ec2SecretAccessKey] ?? '';

  const targetAz = firstNonEmpty(formData[ProviderFormFieldId.Ec2TargetAz], ec2Target?.targetAz);
  const targetRegion = firstNonEmpty(
    formData[ProviderFormFieldId.Ec2TargetRegion],
    ec2Target?.targetRegion,
  );
  const targetAccessKeyId = firstNonEmpty(
    formData[ProviderFormFieldId.Ec2TargetAccessKeyId],
    ec2Target?.targetAccessKeyId,
    accessKeyId,
  );
  const targetSecretAccessKey = firstNonEmpty(
    formData[ProviderFormFieldId.Ec2TargetSecretAccessKey],
    ec2Target?.targetSecretAccessKey,
    secretAccessKey,
  );

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
      ...(targetAz && { 'target-az': targetAz }),
      ...(targetRegion && { 'target-region': targetRegion }),
    };
  }

  const secretData: Record<string, string> = {
    accessKeyId: encode(accessKeyId.trim()),
    insecureSkipVerify: encode('false'),
    region: encode(ec2Region.trim()),
    secretAccessKey: encode(secretAccessKey.trim()),
    ...(targetAccessKeyId && { targetAccessKeyId: encode(targetAccessKeyId) }),
    ...(targetSecretAccessKey && { targetSecretAccessKey: encode(targetSecretAccessKey) }),
    url: encode(ec2Url),
  };

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};
