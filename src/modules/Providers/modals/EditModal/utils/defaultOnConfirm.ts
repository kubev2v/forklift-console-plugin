import { getValueByJsonPath, jsonPathToPatch } from 'src/modules/Providers/utils/helpers';

import { k8sPatch, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Patches a Kubernetes resource with a new value.
 */
export const defaultOnConfirm = async ({ jsonPath, model, newValue: value, resource }) => {
  const op = getValueByJsonPath(resource, jsonPath) ? 'replace' : 'add';

  return k8sPatch<K8sResourceCommon>({
    data: [
      {
        op,
        path: jsonPathToPatch(jsonPath),
        value,
      },
    ],
    model,
    resource,
  });
};

/**
 * Wraps the defaultOnConfirm method to convert the newValue from string to int before patching.
 */
export const defaultOnConfirmWithIntValue = async ({ jsonPath, model, newValue, resource }) => {
  // Convert the newValue from string to int
  const intValue = parseInt(newValue.toString(), 10);

  // Call the original method with the converted value
  return defaultOnConfirm({ jsonPath, model, newValue: intValue, resource });
};
