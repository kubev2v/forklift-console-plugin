import type { V1beta1Provider } from '@forklift-ui/types';
import {
  getCopyApplianceDatastore,
  getCopyApplianceFolder,
  getCopyApplianceNetwork,
  getCopyApplianceResourcePool,
} from '@utils/crds/providers/selectors';

export type CopyApplianceSettingField = 'datastore' | 'folder' | 'network' | 'resourcePool';

export type CopyAppliancePlacementValues = {
  datastore: string;
  folder: string;
  network: string;
  resourcePool: string;
};

export const COPY_APPLIANCE_SETTING_FIELDS: CopyApplianceSettingField[] = [
  'datastore',
  'folder',
  'network',
  'resourcePool',
];

export const COPY_APPLIANCE_SETTING_KEY: Record<CopyApplianceSettingField, string> = {
  datastore: 'copyApplianceDatastore',
  folder: 'copyApplianceFolder',
  network: 'copyApplianceNetwork',
  resourcePool: 'copyApplianceResourcePool',
};

export const COPY_APPLIANCE_SETTING_PATH = Object.fromEntries(
  Object.entries(COPY_APPLIANCE_SETTING_KEY).map(([field, key]) => [
    field,
    `/spec/settings/${key}`,
  ]),
) as Record<CopyApplianceSettingField, string>;

export const COPY_APPLIANCE_TEMPLATE_SPEC_KEY: Partial<Record<CopyApplianceSettingField, string>> =
  {
    datastore: 'datastore',
    folder: 'folder',
    network: 'network',
  };

export const COPY_APPLIANCE_SETTING_GETTERS: Record<
  CopyApplianceSettingField,
  (provider: V1beta1Provider) => string | undefined
> = {
  datastore: getCopyApplianceDatastore,
  folder: getCopyApplianceFolder,
  network: getCopyApplianceNetwork,
  resourcePool: getCopyApplianceResourcePool,
};

export const COPY_APPLIANCE_FIELD_IDS: Record<CopyApplianceSettingField, string> = {
  datastore: 'copy-appliance-datastore',
  folder: 'copy-appliance-folder',
  network: 'copy-appliance-network',
  resourcePool: 'copy-appliance-resource-pool',
};
