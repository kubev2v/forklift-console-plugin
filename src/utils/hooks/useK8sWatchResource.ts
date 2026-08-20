import {
  type K8sResourceCommon,
  useK8sWatchResource as useSdkK8sWatchResource,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

/**
 * Same-named drop-in for Console SDK `useK8sWatchResource`.
 *
 * The SDK already generics the resource, but `WatchK8sResult` types the error
 * slot as `any`, which trips `@typescript-eslint/no-unsafe-assignment` on
 * destructure. Import this module instead of the SDK hook.
 */
export type TypedWatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  R,
  boolean,
  Error | null,
];

export const useK8sWatchResource = <R extends K8sResourceCommon | K8sResourceCommon[]>(
  initResource: WatchK8sResource | null,
): TypedWatchK8sResult<R> => {
  const result = useSdkK8sWatchResource<R>(initResource);

  return [result.at(0) as R, result.at(1) as boolean, (result.at(2) ?? null) as Error | null];
};
