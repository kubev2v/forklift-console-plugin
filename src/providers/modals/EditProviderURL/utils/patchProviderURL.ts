import { Base64 } from 'js-base64';

import {
  type IoK8sApiCoreV1Secret,
  ProviderModel,
  SecretModel,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type PatchProviderURLParams = {
  newValue: string;
  resource: V1beta1Provider;
};

/**
 * Patches the provider URL in the resource's spec.
 */
export const patchProviderURL = async ({
  newValue: value,
  resource,
}: PatchProviderURLParams): Promise<V1beta1Provider> => {
  const provider: V1beta1Provider = resource;
  const providerOp = provider?.spec?.url ? 'replace' : 'add';
  const urlValue = value?.trim();

  // Get providers secret stub
  const secret: IoK8sApiCoreV1Secret = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: provider?.spec?.secret?.name,
      namespace: provider?.spec?.secret?.namespace,
    },
  };

  // Patch provider secret
  await k8sPatch({
    data: [
      {
        op: providerOp, // assume secret and provider has the same url
        path: '/data/url',
        value: Base64.encode(urlValue),
      },
    ],
    model: SecretModel,
    resource: secret,
  });

  // Patch provider URL
  const obj = await k8sPatch({
    data: [
      {
        op: providerOp,
        path: '/spec/url',
        value: urlValue,
      },
    ],
    model: ProviderModel,
    resource: provider,
  });

  return obj;
};
