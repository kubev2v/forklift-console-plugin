import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

import { storageVendorProducts } from '../constants';
import { getStorageMapSchema } from '../utils/getStorageMapSchema';

import { useStorageMapCrd } from './useStorageMapCrd';

type UseStorageVendorProductsResult = {
  storageVendorProducts: string[];
  loading: boolean;
  error: Error | null;
};

/**
 * Gets storage vendor product enum values from StorageMap CRD schema
 */
const getStorageVendorProductNames = (crd: CustomResourceDefinition): string[] | undefined => {
  const schema = getStorageMapSchema(crd);

  const enumValues =
    schema?.spec?.properties?.map?.items?.properties?.offloadPlugin?.properties?.vsphereXcopyConfig
      ?.properties?.storageVendorProduct?.enum;

  return Array.isArray(enumValues) && isEmpty(enumValues) ? undefined : enumValues;
};

/**
 * Hook that fetches storage vendor product enums from CRD, extends with constants
 */
export const useStorageVendorProducts = (): UseStorageVendorProductsResult => {
  const { crd, error, loading } = useStorageMapCrd();

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
