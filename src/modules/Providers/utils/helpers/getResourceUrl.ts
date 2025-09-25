import { Namespace } from 'src/utils/constants';

import type { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

type GetResourceUrlProps = {
  reference?: string;
  groupVersionKind?: K8sGroupVersionKind;
  namespaced?: boolean;
  namespace?: string;
  name?: string;
};

/**
 * Provides resource url.
 *
 * @param {GetResourceUrlProps} param0 - An object of GetResourceUrlProps
 * @returns {string} - The resource URL
 */
export const getResourceUrl = ({
  groupVersionKind,
  name,
  namespace,
  namespaced = true,
  reference,
}: GetResourceUrlProps): string => {
  const ns =
    namespace && namespace !== Namespace.AllProjects ? `ns/${namespace}` : 'all-namespaces';
  const resourcePath = namespaced ? ns : 'cluster';
  if (!reference && !groupVersionKind) {
    return '';
  }

  const resourceReference =
    reference ??
    `${groupVersionKind?.group}~${groupVersionKind?.version}~${groupVersionKind?.kind}`;
  const nameSegment = name ? `/${encodeURIComponent(name)}` : '';

  return `/k8s/${resourcePath}/${resourceReference}${nameSegment}`;
};
