import type { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Same shape as Console SDK `WatchK8sResult`, but with a typed error slot.
 * SDK declares the third tuple element as `any`, which trips
 * `@typescript-eslint/no-unsafe-assignment` on every destructure.
 */
export type TypedWatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  R,
  boolean,
  Error | null,
];

/**
 * Typed wrapper around Console SDK `useK8sWatchResource`.
 * The SDK hook is effectively untyped (`any` error slot); this centralizes the cast
 * so call sites stay clean under `@typescript-eslint/no-unsafe-assignment`.
 *
 * Index access (not destructuring) is intentional: destructuring the SDK tuple
 * reintroduces unsafe-assignment on the `any` error element, and a whole-tuple
 * cast is stripped as "unnecessary" because `any` is assignable to `Error | null`.
 * @param initResource
 */
export const useTypedK8sWatchResource = <R extends K8sResourceCommon | K8sResourceCommon[]>(
  initResource: WatchK8sResource | null,
): TypedWatchK8sResult<R> => {
  const result = useK8sWatchResource(initResource);

  return [
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring -- see file comment
    result[0] as R,
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring -- see file comment
    result[1],
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring -- see file comment
    result[2] as Error | null,
  ];
};
