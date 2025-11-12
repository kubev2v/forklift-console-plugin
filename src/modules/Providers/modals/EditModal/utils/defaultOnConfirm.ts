import {
  getValueByJsonPath,
  openApiJsonPathToPatch,
} from 'src/modules/Providers/utils/helpers/getValueByJsonPath';

import type { OpenApiJsonPath } from '@components/common/utils/types';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import {
  type K8sModel,
  k8sPatch,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

/**
 * Patches a Kubernetes resource with a new value.
 */
export const defaultOnConfirm = async ({
  jsonPath,
  model,
  newValue,
  resource,
}: {
  resource: K8sResourceCommon;
  newValue: unknown;
  jsonPath: OpenApiJsonPath;
  model: K8sModel;
}) => {
  const value = getValueByJsonPath(resource, jsonPath);
  const op = value ? REPLACE : ADD;

  return k8sPatch<K8sResourceCommon>({
    data: [
      {
        op,
        path: openApiJsonPathToPatch(resource, jsonPath),
        value: newValue,
      },
    ],
    model,
    resource,
  });
};
