import { V1beta1Plan } from '@kubev2v/types';

export const hasPlanMappingsEditable = (plan: V1beta1Plan) => {
  const planHasNeverStarted = !plan.status?.migration?.started ? true : false;

  const migrationHasSomeCompleteRunningVMs =
    plan.status?.migration?.vms?.filter(
      (vm) =>
        (vm.completed && vm.conditions?.find((condition) => condition.type === 'Succeeded')) ||
        vm.phase !== 'Completed',
    ).length > 0 || false;

  return planHasNeverStarted || !migrationHasSomeCompleteRunningVMs;
};
