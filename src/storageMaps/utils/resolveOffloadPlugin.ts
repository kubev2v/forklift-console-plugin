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
export type ResolvableOffloadPlugin = {
  csiVolumeImport?: OffloadPluginBlock;
  vsphereXcopyConfig?: OffloadPluginBlock;
};

type OffloadPluginConfigFields = {
  dedicatedMigrationHosts: string[];
  storageProduct: string;
  storageSecret: string;
};

/**
 * Resolves which offload plugin key is set on a StorageMap mapping.
 */
export const resolveOffloadPlugin = (
  offloadPlugin: ResolvableOffloadPlugin | undefined,
): OffloadPlugin | '' => {
  if (offloadPlugin?.csiVolumeImport) {
    return OffloadPlugin.CsiVolumeImport;
  }

  if (offloadPlugin?.vsphereXcopyConfig) {
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
