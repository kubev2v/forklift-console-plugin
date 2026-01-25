import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Fetching providers list by namespace.
 *
 * @param {string} namespace to fetch providers by.
 * @returns {Promise<V1beta1Provider[]>} providers list by namespace.
 */
export const k8sGetProvidersByNamespace = async (
  namespace: string | undefined,
): Promise<V1beta1Provider[]> => {
  type K8sListResponse<T> = {
    items: T[];
  };
  const providersList = await k8sGet({ model: ProviderModel, ns: namespace });

  return (providersList as K8sListResponse<V1beta1Provider>)?.items;
};
