import { Namespace } from './constants';
import { isUpstream } from './env';

/**
 * When using an upstream build, use the env default namespace
 * with a fallback of 'default', otherwise use 'openshift-mtv'.
 * @returns string
 */
export const getDefaultNamespace = (): string => {
  const isUserUpstream = isUpstream();

  if (isUserUpstream) {
    return process.env.DEFAULT_NAMESPACE || Namespace.Default;
  }

  return Namespace.OpenshiftMtv;
};
