import type { V1beta1Provider } from '@kubev2v/types';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Get reference group version kind string for group version kind strings
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
  if (!obj?.apiVersion) {
    return null;
  }

  const [group, version] = obj.apiVersion.split('/');
  return { group, kind: obj.kind, version };
};

/**
 * Get the group version kind object from a k8s reference
 * @param  {K8sResourceCommon} reference in format "group~version~kind"
 */
export const groupVersionKindForReference = (reference: string) => {
  const [group, version, kind] = reference.split('~');
  return { group, kind, version };
};

/**
 * Get reference group version kind string for k8s objects
 * @param  {K8sResourceCommon} obj
 */
export const referenceForObj = (obj: K8sResourceCommon) => {
  const { group, kind, version } = groupVersionKindForObj(obj);
  return referenceFor(group, version, kind);
};

/**
 * Can this provider be considered a local openshift provider?
 */
export const isProviderLocalOpenshift = (provider: V1beta1Provider): boolean =>
  provider?.spec?.type === 'openshift' && (!provider?.spec?.url || provider?.spec?.url === '');

/**
 * Is this provider an openshift provider?
 */
export const isProviderOpenshift = (provider: V1beta1Provider): boolean =>
  provider?.spec?.type === 'openshift';
