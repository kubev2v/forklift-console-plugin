import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@kubev2v/types';

import { offloadPlugins } from '../constants';
import { getStorageMapSchema } from '../utils/getStorageMapSchema';

import { useStorageMapCRD } from './useStorageMapCRD';

type UseOffloadPluginsResult = {
  offloadPlugins: string[];
  loading: boolean;
  error: Error | null;
};

/**
 * Gets available offload plugin names from StorageMap CRD schema
 */
const getOffloadPluginNames = (crd: CustomResourceDefinition): string[] | null => {
  const schema = getStorageMapSchema(crd);

  const offloadPluginProperties =
    schema?.spec?.properties?.map?.items?.properties?.offloadPlugin?.properties;

  const pluginNames = offloadPluginProperties ? Object.keys(offloadPluginProperties) : [];
  return pluginNames.length > 0 ? pluginNames : null;
};

/**
 * Hook that fetches offload plugin names from CRD, extends with constants
 */
export const useOffloadPlugins = (): UseOffloadPluginsResult => {
  const { crd, error, loading } = useStorageMapCRD();

  const plugins = useMemo(() => {
    if (loading || error || !crd) {
      return offloadPlugins;
    }

    try {
      const crdPlugins = getOffloadPluginNames(crd);

      if (!crdPlugins) {
        return offloadPlugins;
      }

      return Array.from(new Set([...crdPlugins, ...offloadPlugins]));
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
