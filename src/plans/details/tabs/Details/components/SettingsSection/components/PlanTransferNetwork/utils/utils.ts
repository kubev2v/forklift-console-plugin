import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import {
  PlanModel,
  type V1beta1Plan,
  type V1beta1PlanSpecTransferNetwork,
} from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanTransferNetwork } from '@utils/crds/plans/selectors';

import { PROVIDER_DEFAULTS } from './constants';

export const getNetworkName = (value: V1beta1PlanSpecTransferNetwork | null): string => {
  if (!value || typeof value === 'string') return PROVIDER_DEFAULTS;
  return `${value?.namespace}/${value?.name}`;
};

export const onConfirmTransferNetwork = async ({
  newValue,
  resource,
}: {
  newValue: V1beta1PlanSpecTransferNetwork | null;
  resource: V1beta1Plan;
}): Promise<V1beta1Plan> => {
  const op = getPlanTransferNetwork(resource) ? REPLACE : ADD;

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/transferNetwork',
        value: newValue ?? undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return result;
};
