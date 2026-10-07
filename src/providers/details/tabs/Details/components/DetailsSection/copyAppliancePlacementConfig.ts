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

export const COPY_APPLIANCE_SETTING_PATH: Record<CopyApplianceSettingField, string> = {
  datastore: '/spec/settings/copyApplianceDatastore',
  folder: '/spec/settings/copyApplianceFolder',
  network: '/spec/settings/copyApplianceNetwork',
  resourcePool: '/spec/settings/copyApplianceResourcePool',
};

export const COPY_APPLIANCE_SETTING_CRUMBS: Record<CopyApplianceSettingField, string[]> = {
  datastore: ['Provider', 'spec', 'settings', 'copyApplianceDatastore'],
  folder: ['Provider', 'spec', 'settings', 'copyApplianceFolder'],
  network: ['Provider', 'spec', 'settings', 'copyApplianceNetwork'],
  resourcePool: ['Provider', 'spec', 'settings', 'copyApplianceResourcePool'],
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
