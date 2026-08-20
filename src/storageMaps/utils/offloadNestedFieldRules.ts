import { StorageMapFieldId } from '@utils/storage/types';

/**
 * Nested offload Controllers must re-validate the parent storageMap field array.
 * Without deps, incomplete offload shows an inline error but Save stays enabled
 * and persist strips the plugin.
 */
export const offloadNestedFieldRules = {
  deps: [StorageMapFieldId.StorageMap],
};
