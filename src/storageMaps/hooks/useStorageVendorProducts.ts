import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@kubev2v/types';

import { storageVendorProducts } from '../constants';
import { getStorageMapSchema } from '../utils/getStorageMapSchema';

import { useStorageMapCRD } from './useStorageMapCRD';

type UseStorageVendorProductsResult = {
  storageVendorProducts: string[];
  loading: boolean;
  error: Error | null;
};

/**
 * Gets storage vendor product enum values from StorageMap CRD schema
 */
const getStorageVendorProductNames = (crd: CustomResourceDefinition): string[] | null => {
  const schema = getStorageMapSchema(crd);

  const enumValues =
    schema?.spec?.properties?.map?.items?.properties?.offloadPlugin?.properties?.vsphereXcopyConfig
      ?.properties?.storageVendorProduct?.enum;

  return Array.isArray(enumValues) && enumValues.length > 0 ? enumValues : null;
};

/**
 * Hook that fetches storage vendor product enums from CRD, extends with constants
 */
export const useStorageVendorProducts = (): UseStorageVendorProductsResult => {
  const { crd, error, loading } = useStorageMapCRD();

  const products = useMemo(() => {
    if (loading || error || !crd) {
      return storageVendorProducts;
    }

    try {
      const crdProducts = getStorageVendorProductNames(crd);

      if (!crdProducts) {
        return storageVendorProducts;
      }

      return Array.from(new Set([...crdProducts, ...storageVendorProducts]));
    } catch {
      return storageVendorProducts;
    }
  }, [crd, error, loading]);

  return {
    error,
    loading,
    storageVendorProducts: products,
  };
};
