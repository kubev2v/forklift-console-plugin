import { isEmpty } from '@utils/helpers';

import { OffloadPlugin } from './types';

type OffloadPluginBlock = {
  dedicatedMigrationHosts?: string[];
  secretRef?: string;
  storageVendorProduct?: string;
};

/**
 * Flexible offload plugin shape for reading CR / custom form types.
 * Generated `@forklift-ui/types` require non-optional fields; runtime CR data and
 * our local custom types use optional strings.
 */
type ResolvableOffloadPlugin = {
  csiVolumeImport?: OffloadPluginBlock;
  vsphereXcopyConfig?: OffloadPluginBlock;
};

type OffloadPluginConfigFields = {
  dedicatedMigrationHosts: string[];
  storageProduct: string;
  storageSecret: string;
};

/**
 * Empty `{}` plugin blocks are truthy in JS but are not a configured plugin.
 * Treat a block as configured when it has secretRef and/or storageVendorProduct.
 */
const isConfiguredPluginBlock = (block: OffloadPluginBlock | undefined): boolean => {
  if (!block) {
    return false;
  }

  return !isEmpty(block.secretRef) || !isEmpty(block.storageVendorProduct);
};

/**
 * Resolves which offload plugin key is set on a StorageMap mapping.
 * CSI Volume Import takes priority when both plugins are configured.
 */
export const resolveOffloadPlugin = (
  offloadPlugin: ResolvableOffloadPlugin | undefined,
): OffloadPlugin | '' => {
  if (isConfiguredPluginBlock(offloadPlugin?.csiVolumeImport)) {
    return OffloadPlugin.CsiVolumeImport;
  }

  if (isConfiguredPluginBlock(offloadPlugin?.vsphereXcopyConfig)) {
    return OffloadPlugin.VSphereXcopyConfig;
  }

  return '';
};

/**
 * Reads form-facing offload fields from the active plugin block on a StorageMap mapping.
 */
export const getOffloadConfigFields = (
  offloadPlugin: ResolvableOffloadPlugin | undefined,
): OffloadPluginConfigFields => {
  const plugin = resolveOffloadPlugin(offloadPlugin);

  if (plugin === OffloadPlugin.CsiVolumeImport) {
    return {
      dedicatedMigrationHosts: [],
      storageProduct: offloadPlugin?.csiVolumeImport?.storageVendorProduct ?? '',
      storageSecret: offloadPlugin?.csiVolumeImport?.secretRef ?? '',
    };
  }

  if (plugin === OffloadPlugin.VSphereXcopyConfig) {
    return {
      dedicatedMigrationHosts: offloadPlugin?.vsphereXcopyConfig?.dedicatedMigrationHosts ?? [],
      storageProduct: offloadPlugin?.vsphereXcopyConfig?.storageVendorProduct ?? '',
      storageSecret: offloadPlugin?.vsphereXcopyConfig?.secretRef ?? '',
    };
  }

  return {
    dedicatedMigrationHosts: [],
    storageProduct: '',
    storageSecret: '',
  };
};
