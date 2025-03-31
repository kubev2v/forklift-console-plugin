import { HookModel, NetworkMapModel, StorageMapModel, type V1beta1Plan } from '@kubev2v/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

export const canDeleteAndPatchPlanMaps = (plan: V1beta1Plan) => {
  const [canDeleteNetworkMap] = useAccessReview({
    group: '',
    name: plan.metadata?.name,
    namespace: plan.metadata?.name,
    resource: NetworkMapModel.plural,
    verb: 'delete',
  });

  const [canPatchNetworkMap] = useAccessReview({
    group: '',
    name: plan.metadata?.name,
    namespace: plan.metadata?.name,
    resource: NetworkMapModel.plural,
    verb: 'patch',
  });

  const [canDeleteStorageMap] = useAccessReview({
    group: '',
    name: plan.metadata?.name,
    namespace: plan.metadata?.name,
    resource: StorageMapModel.plural,
    verb: 'delete',
  });

  const [canPatchStorageMap] = useAccessReview({
    group: '',
    name: plan.metadata?.name,
    namespace: plan.metadata?.name,
    resource: StorageMapModel.plural,
    verb: 'patch',
  });

  return canPatchNetworkMap && canDeleteNetworkMap && canPatchStorageMap && canDeleteStorageMap;
};

export const canDeleteAndPatchPlanHooks = (plan: V1beta1Plan) => {
  const [canDeleteHooks] = useAccessReview({
    group: '',
    name: plan.metadata?.name,
    namespace: plan.metadata?.name,
    resource: HookModel.plural,
    verb: 'delete',
  });

  const [canPatchHooks] = useAccessReview({
    group: '',
    name: plan.metadata?.name,
    namespace: plan.metadata?.name,
    resource: HookModel.plural,
    verb: 'patch',
  });

  return canDeleteHooks && canPatchHooks;
};
