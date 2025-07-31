import { t } from '@utils/i18n';

export const getVendorProductLabel = (product: string): string => {
  switch (product) {
    case 'vantara':
      return t('Hitachi Vantara');
    case 'ontap':
      return t('NetApp ONTAP');
    case 'primera3par':
      return t('HPE Primera/3PAR');
    case 'powerflex':
      return t('Dell PowerFlex');
    case 'pureFlashArray':
      return t('Pure Storage FlashArray');
    default:
      return product;
  }
};

export const getPluginLabel = (plugin: string): string => {
  switch (plugin) {
    case 'vsphereXcopyConfig':
      return t('vSphere XCOPY');
    default:
      return plugin;
  }
};
