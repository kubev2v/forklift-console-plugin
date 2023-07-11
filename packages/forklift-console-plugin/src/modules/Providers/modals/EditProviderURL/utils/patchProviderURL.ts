import { Base64 } from 'js-base64';

import { SecretModel, V1beta1Provider, V1Secret } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { OnConfirmHookType } from '../../EditModal';

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
export const patchProviderURL: OnConfirmHookType = async ({ resource, model, newValue: value }) => {
  const provider: V1beta1Provider = resource as V1beta1Provider;
  const providerOp = provider?.spec?.url ? 'replace' : 'add';

  // Get providers secret stub
  const secret: V1Secret = {
    kind: 'Secret',
    apiVersion: 'v1',
    metadata: {
      name: provider?.spec?.secret?.name,
      namespace: provider?.spec?.secret?.namespace,
    },
  };

  // Patch provider secret
  await k8sPatch({
    model: SecretModel,
    resource: secret,
    data: [
      {
        op: providerOp, // assume secret and provider has the same url
        path: '/data/url',
        value: Base64.encode(value.toString().trim()),
      },
    ],
  });

  // Patch provider URL
  const obj = await k8sPatch({
    model: model,
    resource: provider,
    data: [
      {
        op: providerOp,
        path: '/spec/url',
        value: value.toString().trim(),
      },
    ],
  });

  return obj;
};
