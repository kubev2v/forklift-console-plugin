import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';
import { scriptsToConfigMapData } from 'src/plans/create/steps/customization-scripts/utils';
import { createCustomScriptsConfigMap } from 'src/plans/create/utils/createCustomScriptsConfigMap';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';
import { PlanModel } from '@forklift-ui/types';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ConfigMapModel } from '@utils/constants';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

type SaveCustomScriptsParams = {
  configMap: IoK8sApiCoreV1ConfigMap | undefined;
  plan: V1beta1Plan;
  scripts: CustomScript[];
};

const removeAllScripts = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  plan: V1beta1Plan,
): Promise<void> => {
  await k8sPatch({
    data: [{ op: REMOVE, path: '/spec/customizationScripts' }],
    model: PlanModel,
    resource: plan,
  });

  await k8sDelete({ model: ConfigMapModel, resource: configMap });
};

export const saveCustomScripts = async ({
  configMap,
  plan,
  scripts,
}: SaveCustomScriptsParams): Promise<void> => {
  if (configMap) {
    if (isEmpty(scripts)) {
      await removeAllScripts(configMap, plan);
      return;
    }

    await k8sPatch({
      data: [
        {
          op: configMap.data ? REPLACE : ADD,
          path: '/data',
          value: scriptsToConfigMapData(scripts),
        },
      ],
      model: ConfigMapModel,
      resource: configMap,
    });

    return;
  }

  if (isEmpty(scripts)) {
    return;
  }

  const planName = getName(plan) ?? '';
  const planProject = getNamespace(plan) ?? '';

  const newConfigMap = await createCustomScriptsConfigMap({
    planName,
    planProject,
    scripts,
  });

  await k8sPatch({
    data: [
      {
        op: ADD,
        path: '/spec/customizationScripts',
        value: {
          name: newConfigMap.metadata?.name,
          namespace: newConfigMap.metadata?.namespace,
        },
      },
    ],
    model: PlanModel,
    resource: plan,
  });
};
