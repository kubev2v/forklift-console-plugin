import { useMemo } from 'react';

import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

import { offloadPlugins } from '../constants';
import { getStorageMapSchema } from '../utils/getStorageMapSchema';

import { useStorageMapCrd } from './useStorageMapCrd';

type UseOffloadPluginsResult = {
  offloadPlugins: string[];
  loading: boolean;
  error: Error | null;
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
 * Hook that fetches offload plugin names from CRD, extends with constants
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
