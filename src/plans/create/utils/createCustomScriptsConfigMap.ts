import type { IoK8sApiCoreV1ConfigMap } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { ConfigMapModel } from '@utils/analytics/constants';

import type { CustomScript } from '../steps/customization-scripts/types';
import { scriptsToConfigMapData } from '../steps/customization-scripts/utils';

type CreateConfigMapParams = {
  planName: string;
  planProject: string;
  scripts: CustomScript[];
};

export const createCustomScriptsConfigMap = async ({
  planName,
  planProject,
  scripts,
}: CreateConfigMapParams): Promise<IoK8sApiCoreV1ConfigMap> => {
  const configMap: IoK8sApiCoreV1ConfigMap = {
    apiVersion: 'v1',
    data: scriptsToConfigMapData(scripts),
    kind: 'ConfigMap',
    metadata: {
      name: `${planName}-scripts`,
      namespace: planProject,
    },
  };

  return k8sCreate({ data: configMap, model: ConfigMapModel });
};
