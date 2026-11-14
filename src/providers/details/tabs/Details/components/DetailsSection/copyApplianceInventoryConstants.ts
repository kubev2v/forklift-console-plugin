import type { CopyApplianceSettingField } from './copyAppliancePlacementConfig';

export const COPY_APPLIANCE_INVENTORY_ENDPOINTS: Record<CopyApplianceSettingField, string> = {
  datastore: 'datastores?detail=1',
  folder: 'folders?detail=1',
  network: 'networks',
  resourcePool: 'resourcepools?detail=1',
};
