/**
 * Type for the return value of useAccessReviewProviders hook.
 *
 * @typedef {Object} ProvidersPermissionStatus
 * @property {boolean} canCreate - Permission to create a resource.
 * @property {boolean} canPatch - Permission to patch a resource.
 * @property {boolean} canDelete - Permission to delete a resource.
 * @property {boolean} canGet - Permission to get a resource.
 * @property {boolean} loading - Flag indicating if any access review is pending.
 */
export type ProvidersPermissionStatus = {
  canCreate: boolean;
  canPatch: boolean;
  canDelete: boolean;
  canGet: boolean;
  loading: boolean;
};
