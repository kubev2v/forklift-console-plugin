import { t } from '@utils/i18n';

import {
  OffloadPlugin,
  StorageMapFieldId,
  type StorageMapping,
  StorageVendorProduct,
} from './types';

export const defaultStorageMapping: StorageMapping = {
  [StorageMapFieldId.OffloadPlugin]: '',
  [StorageMapFieldId.SourceStorage]: { name: '' },
  [StorageMapFieldId.StorageProduct]: '',
  [StorageMapFieldId.StorageSecret]: '',
  [StorageMapFieldId.TargetStorage]: { name: '' },
};

export const storageMapFieldLabels: Partial<Record<StorageMapFieldId, ReturnType<typeof t>>> = {
  [StorageMapFieldId.MapName]: t('Storage map name'),
  [StorageMapFieldId.OffloadPlugin]: t('Offload plugin'),
  [StorageMapFieldId.Project]: t('Project'),
  [StorageMapFieldId.SourceProvider]: t('Source provider'),
  [StorageMapFieldId.SourceStorage]: t('Source storage'),
  [StorageMapFieldId.StorageProduct]: t('Storage product'),
  [StorageMapFieldId.StorageSecret]: t('Storage secret'),
  [StorageMapFieldId.TargetProvider]: t('Target provider'),
  [StorageMapFieldId.TargetStorage]: t('Target storage'),
};

export const offloadPluginLabels: Record<OffloadPlugin, ReturnType<typeof t>> = {
  [OffloadPlugin.VSphereXcopyConfig]: t('vSphere XCOPY'),
};

export const storageVendorProductLabels: Record<StorageVendorProduct, ReturnType<typeof t>> = {
  [StorageVendorProduct.FlashSystem]: t('IBM FlashSystem'),
  [StorageVendorProduct.Infinibox]: t('Infinidat Infinibox'),
  [StorageVendorProduct.Ontap]: t('NetApp ONTAP'),
  [StorageVendorProduct.PowerFlex]: t('Dell PowerFlex'),
  [StorageVendorProduct.PowerMax]: t('Dell PowerMax'),
  [StorageVendorProduct.PowerStore]: t('Dell PowerStore'),
  [StorageVendorProduct.Primera3Par]: t('HPE Primera/3PAR'),
  [StorageVendorProduct.PureFlashArray]: t('Pure Storage FlashArray'),
  [StorageVendorProduct.Vantara]: t('Hitachi Vantara'),
};

export const offloadPlugins = Object.values(OffloadPlugin);
export const storageVendorProducts = Object.values(StorageVendorProduct);
