import { getValueByJsonPath, jsonPathToPatch } from 'src/modules/Providers/utils/helpers';

import { k8sPatch, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Patches a Kubernetes resource with a new value.
 */
export const defaultOnConfirm = async ({ resource, jsonPath, model, newValue: value }) => {
  const op = getValueByJsonPath(resource, jsonPath) ? 'replace' : 'add';

  return await k8sPatch<K8sResourceCommon>({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: jsonPathToPatch(jsonPath),
        value: value,
      },
    ],
  });
};

/**
 * Wraps the defaultOnConfirm method to convert the newValue from string to int before patching.
 */
export const defaultOnConfirmWithIntValue = async ({ resource, jsonPath, model, newValue }) => {
  // Convert the newValue from string to int
  const intValue = parseInt(newValue.toString(), 10);

  // Call the original method with the converted value
  return await defaultOnConfirm({ resource, jsonPath, model, newValue: intValue });
};
