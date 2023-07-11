import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Provides resource url.
 *
 * @param {GetResourceUrlProps} param0 - An object of GetResourceUrlProps
 * @returns {string} - The resource URL
 */
export const getResourceUrl = ({
  reference,
  groupVersionKind,
  namespaced = true,
  namespace,
  name,
}: GetResourceUrlProps): string => {
  const ns = namespace ? `ns/${namespace}` : 'all-namespaces';
  const resourcePath = namespaced ? ns : 'cluster';
  const reference_ =
    reference || `${groupVersionKind.group}~${groupVersionKind.version}~${groupVersionKind.kind}`;
  const name_ = name ? `/${encodeURIComponent(name)}` : '';

  return `/k8s/${resourcePath}/${reference_}${name_}`;
};

interface GetResourceUrlProps {
  reference?: string;
  groupVersionKind?: K8sGroupVersionKind;
  namespaced?: boolean;
  namespace?: string;
  name?: string;
}
