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
