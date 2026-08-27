import type { V1beta1Provider } from '@forklift-ui/types';

/**
 * Prefer a freshly watched provider over overlay launch props.
 * useOverlay freezes props at click time — if the details-page watch had not
 * resolved yet, inventory would stay empty for the whole modal lifetime.
 */
export const resolveProvider = (
  watched: V1beta1Provider | undefined,
  watchedLoaded: boolean,
  launched: V1beta1Provider | undefined,
): V1beta1Provider | undefined => {
  if (watchedLoaded && watched?.metadata?.uid) {
    return watched;
  }
  if (launched?.metadata?.uid) {
    return launched;
  }
  return undefined;
};
