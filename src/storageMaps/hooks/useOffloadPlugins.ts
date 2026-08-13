import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { offloadPlugins } from '../utils/constants';
import { getStorageMapSchema } from '../utils/getStorageMapSchema';

import { useStorageMapCrd } from './useStorageMapCrd';

type UseOffloadPluginsResult = {
  error: Error | null;
  loading: boolean;
  offloadPlugins: string[];
};

/**
 * Gets available offload plugin names from StorageMap CRD schema
 */
const getOffloadPluginNames = (crd: CustomResourceDefinition): string[] | undefined => {
  const schema = getStorageMapSchema(crd);

  const offloadPluginProperties =
    schema?.spec?.properties?.map?.items?.properties?.offloadPlugin?.properties;

  const pluginNames = offloadPluginProperties ? Object.keys(offloadPluginProperties) : [];
  return isEmpty(pluginNames) ? undefined : pluginNames;
};

/**
 * Hook that fetches offload plugin names from the StorageMap CRD when available.
 * Falls back to local constants while loading, on error, or when the CRD has no plugins.
 * Does not force-merge local constants over the CRD (CSI stays hidden until the CRD lists it).
 */
export const useOffloadPlugins = (): UseOffloadPluginsResult => {
  const { crd, error, loading } = useStorageMapCrd();

  const plugins = useMemo(() => {
    if (loading || error || !crd) {
      return offloadPlugins;
    }

    try {
      const crdPlugins = getOffloadPluginNames(crd);

      if (!crdPlugins) {
        return offloadPlugins;
      }

      return crdPlugins;
    } catch {
      return offloadPlugins;
    }
  }, [crd, error, loading]);

  return {
    error,
    loading,
    offloadPlugins: plugins,
  };
};
