import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import { PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH } from '../constants';

type OnConfirmOffloadPopulatorPriorityClassParams = {
  newValue?: string;
  resource: V1beta1Plan;
};

const getPatchOperation = (
  currentValue: string | undefined,
  newValue: string | undefined,
): string => {
  if (isEmpty(currentValue)) {
    return ADD;
  }

  return isEmpty(newValue) ? REMOVE : REPLACE;
};

export const onConfirmOffloadPopulatorPriorityClass = async ({
  newValue,
  resource,
}: OnConfirmOffloadPopulatorPriorityClassParams): Promise<V1beta1Plan> => {
  const currentValue = resource.spec?.offloadPopulatorPriorityClassName;

  if (isEmpty(currentValue) && isEmpty(newValue)) {
    return resource;
  }

  const op = getPatchOperation(currentValue, newValue);

  const result = await k8sPatch({
    data: [
      {
        op,
        path: PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH,
        ...(isEmpty(newValue) ? {} : { value: newValue }),
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};
