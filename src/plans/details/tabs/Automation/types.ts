import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';

export type ScriptEditProps = {
  configMap: IoK8sApiCoreV1ConfigMap | undefined;
  plan: V1beta1Plan;
  scripts: CustomScript[];
};

export type ScriptEditFormValues = {
  scripts: CustomScript[];
};
