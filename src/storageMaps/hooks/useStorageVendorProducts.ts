
import { useState, useEffect } from 'react';

import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { CustomResourceDefinitionModel } from '@openshift-console/dynamic-plugin-sdk-internal';

export const useStorageVendorProducts = (): [string[], boolean, Error] => {
  const [vendorProducts, setVendorProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCRD = async () => {
      try {
        setLoading(true);
        const crd = await k8sGet({
          model: CustomResourceDefinitionModel,
          name: 'storagemaps.forklift.konveyor.io',
        });

        const enumValues = crd?.spec?.versions?.[0]?.schema?.openAPIV3Schema?.properties?.spec?.properties?.map?.items?.properties?.offloadPlugin?.properties?.vsphereXcopyVolumePopulator?.properties?.storageVendorProduct?.enum;

        if (enumValues && Array.isArray(enumValues)) {
          setVendorProducts(enumValues);
        } else {
          console.warn('Could not find StorageVendorProduct enum in CRD');
          setVendorProducts([]);
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCRD();
  }, []);

  return [vendorProducts, loading, error];
};
