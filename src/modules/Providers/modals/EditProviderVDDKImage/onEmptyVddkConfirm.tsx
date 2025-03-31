import type { V1beta1Provider } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import type { OnConfirmHookType } from '../EditModal';

/**
 * Handles the confirmation action for editing a resource annotations.
 * Delete the vddkInitImage settings in the resource's spec.
 *
 * @param {Object} options - Options for the confirmation action.
 * @param {Object} options.resource - The resource to be modified.
 * @param {Object} options.model - The model associated with the resource.
 * @returns {Promise<Object>} - The modified resource.
 */
export const onEmptyVddkConfirm: OnConfirmHookType = async ({ model, resource }) => {
  const provider = resource as V1beta1Provider;
  let op: string;

  // Patch settings
  const currentSettings = (provider?.spec?.settings || {}) as object;
  const settings = {
    ...currentSettings,
    vddkInitImage: undefined,
  };

  op = Object.keys(currentSettings).length ? 'replace' : 'add';

  await k8sPatch({
    data: [
      {
        op,
        path: '/spec/settings',
        value: settings,
      },
    ],
    model,
    resource,
  });

  // Patch annotations
  const currentAnnotations = (provider?.metadata?.annotations || {}) as object;
  const annotations = {
    ...currentAnnotations,
    'forklift.konveyor.io/empty-vddk-init-image': 'yes',
  };

  op = Object.keys(currentAnnotations).length ? 'replace' : 'add';

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/metadata/annotations',
        value: annotations,
      },
    ],
    model,
    resource,
  });

  return obj;
};
