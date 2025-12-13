import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { encodeFormValue } from '@utils/helpers/encodeFormValue';

import { CertificateValidationMode, ProviderFormFieldId, VddkSetupMode } from '../fields/constants';
import type { VsphereFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildVsphereProviderResources = (formData: VsphereFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const vsphereUrl = formData[ProviderFormFieldId.VsphereUrl];
  const username = formData[ProviderFormFieldId.VsphereUsername];
  const password = formData[ProviderFormFieldId.VspherePassword];
  const certificateValidation = formData[ProviderFormFieldId.CertificateValidation];
  const caCertificate = formData[ProviderFormFieldId.CaCertificate] ?? '';
  const vddkSetupMode = formData[ProviderFormFieldId.VsphereVddkSetupMode];
  const vddkInitImage = formData[ProviderFormFieldId.VsphereVddkInitImage];

  const skipCertValidation = certificateValidation === CertificateValidationMode.Skip;
  const url = vsphereUrl?.trim() ?? '';

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.vsphere,
    url,
  });

  if (vddkSetupMode !== VddkSetupMode.Skip && vddkInitImage?.trim()) {
    if (provider.spec) {
      provider.spec.settings = {
        vddkInitImage: vddkInitImage.trim(),
      };
    }
  }

  const secretData: Record<string, string> = {
    insecureSkipVerify: encode(skipCertValidation ? 'true' : 'false'),
    url: encode(url),
    ...(username?.trim() && { user: encodeFormValue(username) }),
    ...(password?.trim() && { password: encodeFormValue(password) }),
  };

  if (!skipCertValidation && caCertificate?.trim()) {
    secretData.cacert = encode(caCertificate.trim());
  }

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};
