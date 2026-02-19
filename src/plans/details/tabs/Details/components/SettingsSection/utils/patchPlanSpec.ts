import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

type PatchPlanSpecParams<T> = {
  currentValue: T | undefined;
  newValue: T | undefined;
  path: string;
  plan: V1beta1Plan;
};

export const patchPlanSpec = async <T>({
  currentValue,
  newValue,
  path,
  plan,
}: PatchPlanSpecParams<T>): Promise<V1beta1Plan> => {
  const op = currentValue === undefined ? ADD : REPLACE;

  return k8sPatch({
    data: [{ op, path, value: newValue }],
    model: PlanModel,
    resource: plan,
  });
};
