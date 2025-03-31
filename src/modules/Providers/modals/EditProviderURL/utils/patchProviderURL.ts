import { Base64 } from 'js-base64';

import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Provider } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import type { OnConfirmHookType } from '../../EditModal';

/**
 * Handles the confirmation action for editing a resource annotations.
 * Adds or updates the 'forklift.konveyor.io/defaultTransferNetwork' annotation in the resource's metadata.
 *
 * @param {Object} options - Options for the confirmation action.
 * @param {Object} options.resource - The resource to be modified.
 * @param {Object} options.model - The model associated with the resource.
 * @param {any} options.newValue - The new value for the 'forklift.konveyor.io/defaultTransferNetwork' annotation.
 * @returns {Promise<Object>} - The modified resource.
 */
export const patchProviderURL: OnConfirmHookType = async ({ model, newValue: value, resource }) => {
  const provider: V1beta1Provider = resource as V1beta1Provider;
  const providerOp = provider?.spec?.url ? 'replace' : 'add';

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
        value: Base64.encode(value.toString().trim()),
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
        value: value.toString().trim(),
      },
    ],
    model,
    resource: provider,
  });

  return obj;
};
