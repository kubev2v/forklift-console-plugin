import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const getPlanXfsCompatibility = (plan: V1beta1Plan): boolean | undefined =>
  plan?.spec?.xfsCompatibility;

export const onConfirmXfsCompatibility = async ({
  newValue,
  resource,
}: {
  newValue: boolean;
  resource: V1beta1Plan;
}): Promise<V1beta1Plan> => {
  const current = resource?.spec?.xfsCompatibility;
  const op = current === undefined ? ADD : REPLACE;

  return k8sPatch({
    data: [{ op, path: '/spec/xfsCompatibility', value: newValue }],
    model: PlanModel,
    resource,
  });
};
