import { Namespace } from './constants';
import { isUpstream } from './env';

/**
 * When using an upstream build use 'konveyor-forklift', otherwise 'openshift-mtv'.
 * @returns string
 */
export const getDefaultNamespace = (): string => {
  const isUserUpstream = isUpstream();

  if (isUserUpstream) {
    return Namespace.KonveyorForklift;
  }

  return Namespace.OpenshiftMtv;
};

const SYSTEM_NAMESPACES_PREFIX = ['kube-', 'openshift-', 'kubernetes-'];
const SYSTEM_NAMESPACES = ['default', 'openshift'];

export const isSystemNamespace = (option: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => option.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(option);

  return startsWithNamespace || isNamespace;
};
