import { t } from '@utils/i18n';

import { StorageMapFieldId, type StorageMapping } from './types';

/**
 * Validates that offload fields follow an "all or nothing" rule:
 * either all three fields (plugin, secret, product) are set, or none are.
 *
 * @returns Translated error string if partially filled, undefined if valid
 */
export const validateOffloadFields = (mapping: StorageMapping): string | undefined => {
  const offloadPlugin = mapping[StorageMapFieldId.OffloadPlugin];
  const storageSecret = mapping[StorageMapFieldId.StorageSecret];
  const storageProduct = mapping[StorageMapFieldId.StorageProduct];

  const filledCount = [offloadPlugin, storageSecret, storageProduct].filter(Boolean).length;

  const ALL_FILLED = 3;
  const NONE_FILLED = 0;

  if (filledCount === NONE_FILLED || filledCount === ALL_FILLED) {
    return undefined;
  }

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
};
