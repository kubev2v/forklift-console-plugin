import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const onConfirmPVCNameTemplate = async ({
  newValue,
  resource,
}: {
  newValue: string | undefined;
  resource: V1beta1Plan;
}): Promise<V1beta1Plan> => {
  const current = resource?.spec?.pvcNameTemplate;
  const op = current === undefined ? ADD : REPLACE;

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/pvcNameTemplate',
        value: newValue ?? undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};
