import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanDescription } from '@utils/crds/plans/selectors';

type OnConfirmDescriptionParams = {
  newValue: string | undefined;
  resource: V1beta1Plan;
};

type OnConfirmDescription = (param: OnConfirmDescriptionParams) => Promise<V1beta1Plan>;

export const onConfirmDescription: OnConfirmDescription = async ({ newValue, resource }) => {
  const op = getPlanDescription(resource) ? REPLACE : ADD;
  const trimmedValue = newValue?.trim();

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/description',
        value: trimmedValue,
      },
    ],
    model: PlanModel,
    resource,
  });

  return obj;
};
