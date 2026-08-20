import { t } from '@utils/i18n';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { isVendorProductAllowedForPlugin } from './getAllowedVendorProducts';
import { OffloadPlugin } from './types';

const KNOWN_OFFLOAD_PLUGINS: readonly string[] = Object.values(OffloadPlugin);

const isKnownOffloadPlugin = (plugin: string): plugin is OffloadPlugin =>
  KNOWN_OFFLOAD_PLUGINS.includes(plugin);

/**
 * Validates that offload fields follow an "all or nothing" rule:
 * either all three fields (plugin, secret, product) are set, or none are.
 * When all are set, the product must be allowed for the selected plugin.
 *
 * @returns Translated error string if invalid, undefined if valid
 */
export const validateOffloadFields = (mapping: StorageMapping): string | undefined => {
  const offloadPlugin = mapping[StorageMapFieldId.OffloadPlugin];
  const storageSecret = mapping[StorageMapFieldId.StorageSecret];
  const storageProduct = mapping[StorageMapFieldId.StorageProduct];

  const filledCount = [offloadPlugin, storageSecret, storageProduct].filter(Boolean).length;

  const ALL_FILLED = 3;
  const NONE_FILLED = 0;

  if (filledCount === NONE_FILLED) {
    return undefined;
  }

  if (filledCount !== ALL_FILLED) {
    const missing: string[] = [];

    if (!offloadPlugin) {
      missing.push(t('Offload plugin'));
    }

    if (!storageSecret) {
      missing.push(t('Storage secret'));
    }

    if (!storageProduct) {
      missing.push(t('Storage product'));
    }

    return t('{{missing}} must be set when configuring offload options', {
      missing: missing.join(', '),
    });
  }

  if (!offloadPlugin || !isKnownOffloadPlugin(offloadPlugin)) {
    return t('Selected offload plugin is not supported');
  }

  if (!storageProduct || !isVendorProductAllowedForPlugin(offloadPlugin, storageProduct)) {
    return t('Selected storage product is not supported for this offload plugin');
  }

  return undefined;
};
