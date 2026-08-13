import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { CSI_VOLUME_IMPORT_VENDOR_PRODUCTS, storageVendorProducts } from '../utils/constants';
import { getStorageMapSchema } from '../utils/getStorageMapSchema';
import { OffloadPlugin } from '../utils/types';

import { useStorageMapCrd } from './useStorageMapCrd';

type UseStorageVendorProductsResult = {
  error: Error | null;
  loading: boolean;
  storageVendorProducts: string[];
};

/**
 * Gets storage vendor product enum values from StorageMap CRD schema for a given plugin.
 */
const getStorageVendorProductNames = (
  crd: CustomResourceDefinition,
  offloadPlugin: OffloadPlugin,
): string[] | undefined => {
  const schema = getStorageMapSchema(crd);

  const enumValues =
    schema?.spec?.properties?.map?.items?.properties?.offloadPlugin?.properties?.[offloadPlugin]
      ?.properties?.storageVendorProduct?.enum;

  if (!Array.isArray(enumValues) || isEmpty(enumValues)) {
    return undefined;
  }

  return enumValues;
};

const getFallbackVendorProducts = (offloadPlugin?: OffloadPlugin | string): string[] => {
  if (offloadPlugin === OffloadPlugin.CsiVolumeImport) {
    return [...CSI_VOLUME_IMPORT_VENDOR_PRODUCTS];
  }

  return storageVendorProducts;
};

/**
 * Hook that fetches storage vendor product enums from CRD for the selected offload plugin.
 * CSI Volume Import is gated to CRD-allowed values (primera3par); XCOPY uses the full enum.
 */
export const useStorageVendorProducts = (
  offloadPlugin?: OffloadPlugin | string,
): UseStorageVendorProductsResult => {
  const { crd, error, loading } = useStorageMapCrd();

  const products = useMemo(() => {
    const fallback = getFallbackVendorProducts(offloadPlugin);

    if (loading || error || !crd) {
      return fallback;
    }

    if (
      offloadPlugin !== OffloadPlugin.CsiVolumeImport &&
      offloadPlugin !== OffloadPlugin.VSphereXcopyConfig
    ) {
      return fallback;
    }

    try {
      const crdProducts = getStorageVendorProductNames(crd, offloadPlugin);

      if (!crdProducts) {
        return fallback;
      }

      if (offloadPlugin === OffloadPlugin.CsiVolumeImport) {
        return Array.from(new Set(crdProducts));
      }

      return Array.from(new Set([...crdProducts, ...storageVendorProducts]));
    } catch {
      return fallback;
    }
  }, [crd, error, loading, offloadPlugin]);

  return {
    error,
    loading,
    storageVendorProducts: products,
  };
};
