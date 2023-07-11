import { K8sModel, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { ProvidersPermissionStatus } from '../utils';

/**
 * Type for the parameters of the useGetDeleteAndEditAccessReview custom hook.
 *
 * @typedef {Object} K8sModelAccessReviewParams
 * @property {K8sModel} model - The Kubernetes model to check permissions on.
 * @property {string} [name] - The name of the specific instance of the model, if any.
 * @property {string} [namespace] - The namespace in which to review access permissions.
 */
interface K8sModelAccessReviewParams {
  model: K8sModel;
  name?: string;
  namespace?: string;
}

/**
 * A React hook that checks permissions for different actions on a Kubernetes model within a specified namespace.
 * @param {K8sModelAccessReviewParams} param0 - An object that contains model, name and namespace details.
 * @returns {Object} An object containing permissions and a loading state.
 */
export const useGetDeleteAndEditAccessReview: UseAccessReviewFn = ({ model, name, namespace }) => {
  const [canCreate, loadingCreate] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'create',
    namespace,
  });

  const [canPatch, loadingPatch] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'patch',
    name,
    namespace,
  });

  const [canDelete, loadingDelete] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'delete',
    name,
    namespace,
  });

  const [canGet, loadingGet] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'get',
    name,
    namespace,
  });

  return {
    canCreate,
    canPatch,
    canDelete,
    canGet,
    loading: loadingCreate || loadingPatch || loadingDelete || loadingGet,
  };
};

type UseAccessReviewFn = (props: K8sModelAccessReviewParams) => ProvidersPermissionStatus;

export default useGetDeleteAndEditAccessReview;
