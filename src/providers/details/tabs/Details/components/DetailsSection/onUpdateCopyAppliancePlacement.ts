import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { buildCopyApplianceSettingPatch } from './buildCopyApplianceSettingPatch';
import {
  COPY_APPLIANCE_SETTING_GETTERS,
  COPY_APPLIANCE_SETTING_PATH,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';

const onUpdateCopyApplianceSetting = async (
  provider: V1beta1Provider,
  field: CopyApplianceSettingField,
  value: string,
): Promise<V1beta1Provider> => {
  const patch = buildCopyApplianceSettingPatch(
    COPY_APPLIANCE_SETTING_GETTERS[field](provider),
    COPY_APPLIANCE_SETTING_PATH[field],
    value,
  );
  if (!patch) {
    return provider;
  }

  return k8sPatch({
    data: [patch],
    model: ProviderModel,
    resource: provider,
  });
};

export default onUpdateCopyApplianceSetting;
