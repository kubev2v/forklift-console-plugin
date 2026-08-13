import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

export const OPAQUE_SECRET_TYPE = 'Opaque';

/**
 * Kubernetes defaults Secret.type to Opaque when unset.
 * @param secret
 */
export const isOpaqueSecret = (secret: Pick<IoK8sApiCoreV1Secret, 'type'>): boolean =>
  (secret.type ?? OPAQUE_SECRET_TYPE) === OPAQUE_SECRET_TYPE;

export const filterOpaqueSecrets = (
  secrets: IoK8sApiCoreV1Secret[] | undefined,
): IoK8sApiCoreV1Secret[] => (secrets ?? []).filter(isOpaqueSecret);
