import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Get reference group version kind string forgroup version kind strings
 * @param  {string} group
 * @param  {string} version
 * @param  {string} kind
 */
export const referenceFor = (group: string, version: string, kind: string) =>
  `${group}~${version}~${kind}`;

/**
 * Get the group version kind object from a k8s object
 * @param  {K8sResourceCommon} obj
 */
export const groupVersionKindForObj = (obj: K8sResourceCommon) => {
  const [group, version] = obj.apiVersion.split('/');
  return { group, version, kind: obj.kind };
};

/**
 * Get the group version kind object from a k8s reference
 * @param  {K8sResourceCommon} reference in format "group~version~kind"
 */
export const groupVersionKindForReference = (reference: string) => {
  const [group, version, kind] = reference.split('~');
  return { group, version, kind };
};

/**
 * Get reference group version kind string for k8s objects
 * @param  {K8sResourceCommon} obj
 */
export const referenceForObj = (obj: K8sResourceCommon) => {
  const { group, version, kind } = groupVersionKindForObj(obj);
  return referenceFor(group, version, kind);
};

/**
 * @param reference in format "group~version~kind"
 * @param namespace (optional)
 */
export const createK8sPath = (reference: string, namespace?: string) =>
  namespace ? `/k8s/ns/${namespace}/${reference}` : `/k8s/all-namespaces/${reference}`;
