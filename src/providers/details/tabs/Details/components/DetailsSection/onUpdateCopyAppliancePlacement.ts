import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  getCopyApplianceDatastore,
  getCopyApplianceFolder,
  getCopyApplianceNetwork,
  getCopyApplianceResourcePool,
} from '@utils/crds/common/selectors';

export type CopyApplianceSettingField = 'datastore' | 'folder' | 'network' | 'resourcePool';

const settingPath: Record<CopyApplianceSettingField, string> = {
  datastore: '/spec/settings/copyApplianceDatastore',
  folder: '/spec/settings/copyApplianceFolder',
  network: '/spec/settings/copyApplianceNetwork',
  resourcePool: '/spec/settings/copyApplianceResourcePool',
};

const getSetting: Record<
  CopyApplianceSettingField,
  (provider: V1beta1Provider) => string | undefined
> = {
  datastore: getCopyApplianceDatastore,
  folder: getCopyApplianceFolder,
  network: getCopyApplianceNetwork,
  resourcePool: getCopyApplianceResourcePool,
};

const onUpdateCopyApplianceSetting = async (
  provider: V1beta1Provider,
  field: CopyApplianceSettingField,
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

export default onUpdateCopyApplianceSetting;
