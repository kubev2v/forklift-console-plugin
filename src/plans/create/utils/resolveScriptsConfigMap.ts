import type { IoK8sApiCoreV1ConfigMap } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { CustomScriptsType } from '../steps/customization-scripts/constants';
import type { CreatePlanFormData } from '../types';

import { createCustomScriptsConfigMap } from './createCustomScriptsConfigMap';

export const resolveScriptsConfigMap = async ({
  customScripts,
  customScriptsType,
  existingCustomScriptsConfigMap,
  planName,
  planProject,
}: Pick<
  CreatePlanFormData,
  | 'customScripts'
  | 'customScriptsType'
  | 'existingCustomScriptsConfigMap'
  | 'planName'
  | 'planProject'
>): Promise<IoK8sApiCoreV1ConfigMap | undefined> => {
  if (customScriptsType === CustomScriptsType.Existing) {
    return existingCustomScriptsConfigMap;
  }

  if (isEmpty(customScripts)) {
    return undefined;
  }

  return createCustomScriptsConfigMap({ planName, planProject, scripts: customScripts });
};
