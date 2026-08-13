import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { storageVendorProducts } from '../utils/constants';
import { getAllowedVendorProducts } from '../utils/getAllowedVendorProducts';
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

/**
 * Hook that fetches storage vendor product enums from CRD for the selected offload plugin.
 * CSI Volume Import is gated to the shared write-path allowlist (intersected with CRD when present);
 * XCOPY merges CRD values with the full constant list.
 */
export const useStorageVendorProducts = (
  offloadPlugin?: OffloadPlugin | '',
): UseStorageVendorProductsResult => {
  const { crd, error, loading } = useStorageMapCrd();

  const products = useMemo(() => {
    const fallback = getAllowedVendorProducts(offloadPlugin);

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
        const allowed = getAllowedVendorProducts(OffloadPlugin.CsiVolumeImport);
        const filtered = crdProducts.filter((product) => allowed.includes(product));

        return isEmpty(filtered) ? allowed : Array.from(new Set(filtered));
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
