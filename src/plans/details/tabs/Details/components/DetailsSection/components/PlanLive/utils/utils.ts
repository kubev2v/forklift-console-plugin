import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanIsLive } from '@utils/crds/plans/selectors';

type OnConfirmLiveParams = {
  newValue: boolean;
  resource: V1beta1Plan;
};

type OnConfirmLive = (param: OnConfirmLiveParams) => Promise<V1beta1Plan>;

export const onConfirmLive: OnConfirmLive = async ({ newValue, resource }) => {
  const op = getPlanIsLive(resource) === undefined ? ADD : REPLACE;

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/type',
        value: newValue ? 'live' : 'cold',
      },
    ],
    model: PlanModel,
    resource,
  });

  return obj;
};
