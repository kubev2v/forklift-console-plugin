import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanTimezone } from '@utils/crds/plans/selectors';

export const onConfirmTimezone = async ({
  newValue,
  resource,
}: {
  newValue: string;
  resource: V1beta1Plan;
}): Promise<V1beta1Plan> => {
  const op = getPlanTimezone(resource) ? REPLACE : ADD;

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/timezone',
        value: newValue || undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};
