import type { K8sResourceCommon } from '@kubev2v/types';
import type { OwnerReference } from '@openshift-console/dynamic-plugin-sdk';

import { getApiVersion, getKind, getName, getUID } from './selectors';

/**
 * function for creating a resource's owner reference from a resource
 * @param {K8sResourceCommon} owner resource to create an owner reference from
 * @param opts optional additional options
 * @param {boolean} opts.blockOwnerDeletion http://kubevirt.io/api-reference/v0.51.0/definitions.html#_k8s_io_apimachinery_pkg_apis_meta_v1_ownerreference
 * @param {boolean} opts.controller http://kubevirt.io/api-reference/v0.51.0/definitions.html#_k8s_io_apimachinery_pkg_apis_meta_v1_ownerreference
 * @returns a resource's owner reference
 */
export const buildOwnerReference = (
  owner: K8sResourceCommon,
  opts: { blockOwnerDeletion?: boolean; controller?: boolean } = { blockOwnerDeletion: true },
): OwnerReference => ({
  apiVersion: getApiVersion(owner)!,
  blockOwnerDeletion: opts?.blockOwnerDeletion,
  controller: opts?.controller,
  kind: getKind(owner)!,
  name: getName(owner)!,
  uid: getUID(owner)!,
});

export const getRandomChars = (len = 6): string => {
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 36).toString(36)).join('');
};
