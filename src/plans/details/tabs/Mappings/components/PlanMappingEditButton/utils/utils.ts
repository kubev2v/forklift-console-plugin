import { NetworkMapModel, StorageMapModel, type V1beta1Plan } from '@kubev2v/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { CATEGORY_TYPES, taskStatuses } from '@utils/constants';
import { getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

export const canDeleteAndPatchPlanMaps = ({
  name,
  namespace,
}: {
  name?: string;
  namespace?: string;
}) => {
  const [canDeleteNetworkMap] = useAccessReview({
    group: '',
    name,
    namespace,
    resource: NetworkMapModel.plural,
    verb: 'delete',
  });

  const [canPatchNetworkMap] = useAccessReview({
    group: '',
    name,
    namespace,
    resource: NetworkMapModel.plural,
    verb: 'patch',
  });

  const [canDeleteStorageMap] = useAccessReview({
    group: '',
    name,
    namespace,
    resource: StorageMapModel.plural,
    verb: 'delete',
  });

  const [canPatchStorageMap] = useAccessReview({
    group: '',
    name,
    namespace,
    resource: StorageMapModel.plural,
    verb: 'patch',
  });

  return canPatchNetworkMap && canDeleteNetworkMap && canPatchStorageMap && canDeleteStorageMap;
};

export const hasSomeCompleteRunningVMs = (plan: V1beta1Plan) => {
  const planHasNeverStarted = !plan.status?.migration?.started;

  const migrationHasSomeCompleteRunningVMs = getPlanVirtualMachinesMigrationStatus(plan)?.filter(
    (vm) =>
      (vm.completed &&
        vm.conditions?.find((condition) => condition.type === CATEGORY_TYPES.SUCCEEDED)) ??
      vm.phase !== taskStatuses.completed,
  );

  return !planHasNeverStarted && !isEmpty(migrationHasSomeCompleteRunningVMs);
};
