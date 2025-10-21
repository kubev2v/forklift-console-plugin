import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const onConfirmPreserveStaticIPs = async ({
  newValue,
  resource,
}: {
  resource: V1beta1Plan;
  newValue: boolean;
}): Promise<V1beta1Plan> => {
  const current = resource?.spec?.preserveStaticIPs;
  const op = current === undefined ? ADD : REPLACE;

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/preserveStaticIPs',
        value: newValue,
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};
