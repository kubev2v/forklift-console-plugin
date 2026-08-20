import type { K8sResourceCommon, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Same shape as Console SDK `WatchK8sResult`, but with a typed error slot.
 *
 * The SDK already generics the resource (`useK8sWatchResource<R>(...)`), but its
 * public return type is `[R, boolean, any]` — see `WatchK8sResult` in
 * `@openshift-console/dynamic-plugin-sdk`. That `any` error slot trips
 * `@typescript-eslint/no-unsafe-assignment` on every destructure.
 *
 * A whole-tuple `as [R, boolean, Error | null]` is stripped as "unnecessary"
 * (because `any` is assignable to `Error | null`), so we narrow via `.at()` +
 * per-slot assertions at this single boundary instead.
 */
export type TypedWatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  R,
  boolean,
  Error | null,
];

export const toTypedWatchResult = <R extends K8sResourceCommon | K8sResourceCommon[]>(
  result: WatchK8sResult<R>,
): TypedWatchK8sResult<R> => [
  result.at(0) as R,
  result.at(1) as boolean,
  result.at(2) as Error | null,
];
