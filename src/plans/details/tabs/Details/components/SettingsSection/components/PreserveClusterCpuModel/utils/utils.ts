import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const onConfirmPreserveCpuModel = async ({
  newValue,
  resource,
}: {
  resource: V1beta1Plan;
  newValue: boolean;
}): Promise<V1beta1Plan> => {
  const current = resource?.spec?.preserveClusterCpuModel;
  const op = current === undefined ? ADD : REPLACE;

  const patched = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/preserveClusterCpuModel',
        value: newValue || undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return patched;
};
