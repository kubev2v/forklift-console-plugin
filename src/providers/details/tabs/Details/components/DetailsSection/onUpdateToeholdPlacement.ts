import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  getCopyApplianceResourcePool,
  getToeholdDatastore,
  getToeholdFolder,
  getToeholdNetwork,
} from '@utils/crds/common/selectors';

export type ToeholdSettingField = 'datastore' | 'folder' | 'network' | 'resourcePool';

const settingPath: Record<ToeholdSettingField, string> = {
  datastore: '/spec/settings/toeholdDatastore',
  folder: '/spec/settings/toeholdFolder',
  network: '/spec/settings/toeholdNetwork',
  resourcePool: '/spec/settings/copyApplianceResourcePool',
};

const getSetting: Record<ToeholdSettingField, (provider: V1beta1Provider) => string | undefined> = {
  datastore: getToeholdDatastore,
  folder: getToeholdFolder,
  network: getToeholdNetwork,
  resourcePool: getCopyApplianceResourcePool,
};

const onUpdateToeholdSetting = async (
  provider: V1beta1Provider,
  field: ToeholdSettingField,
  value: string,
): Promise<V1beta1Provider> => {
  const current = getSetting[field](provider);
  return k8sPatch({
    data: [
      {
        op: current ? REPLACE : ADD,
        path: settingPath[field],
        value: value || undefined,
      },
    ],
    model: ProviderModel,
    resource: provider,
  });
};

export default onUpdateToeholdSetting;
