import { CLUSTER_API_VERSION } from '@kubev2v/legacy/common/constants';
import { hasCondition } from '@kubev2v/legacy/common/helpers';
import { IStatusCondition } from '@kubev2v/legacy/queries/types';
import { K8sResourceCommon, ObjectReference } from '@openshift-console/dynamic-plugin-sdk';

import { ProviderRef, ProviderResource } from './types';

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
 * Resolve GVK based on the provided list (or fallback if matching provider is missing).
 */
export const resolveProviderRef = (
  { name, namespace }: ObjectReference,
  providers: ProviderResource[],
): ProviderRef => {
  // fallback is required if provider reference inside plan is obsolete/out-of-synch
  const fallbackProvider: Partial<ProviderResource> = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Provider',
  };

  const provider = providers.find(
    (p) => p.metadata?.namespace === namespace && p.metadata?.name === name,
  );

  return {
    resolved: !!provider,
    name,
    gvk: groupVersionKindForObj(provider ?? fallbackProvider),
    ready: hasCondition((provider?.status?.conditions ?? []) as IStatusCondition[], 'Ready'),
  };
};

export enum ResourceKind {
  Provider = 'Provider',
  NetworkMap = 'NetworkMap',
  StorageMap = 'StorageMap',
  Plan = 'Plan',
  Migration = 'Migration',
  Host = 'Host',
  Hook = 'Hook',
}
