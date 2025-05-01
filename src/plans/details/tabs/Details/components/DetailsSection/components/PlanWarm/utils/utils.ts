import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

type OnConfirmWarmParams = {
  newValue: boolean;
  resource: V1beta1Plan;
};

type OnConfirmWarm = (param: OnConfirmWarmParams) => Promise<V1beta1Plan>;

export const onConfirmWarm: OnConfirmWarm = async ({ newValue, resource }) => {
  const op = getPlanIsWarm(resource) === undefined ? ADD : REPLACE;

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/warm',
        value: newValue,
      },
    ],
    model: PlanModel,
    resource,
  });

  return obj;
};
