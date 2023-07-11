import { getValueByJsonPath, jsonPathToPatch } from 'src/modules/Providers/utils';

import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const defaultOnConfirm = async ({ resource, jsonPath, model, newValue: value }) => {
  const op = getValueByJsonPath(resource, jsonPath) ? 'replace' : 'add';

  await k8sPatch({
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
