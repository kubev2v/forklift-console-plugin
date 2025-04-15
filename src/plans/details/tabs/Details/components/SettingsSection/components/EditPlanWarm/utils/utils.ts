import type { OnConfirmHookType } from 'src/modules/Providers/modals/EditModal/types';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ADD, REPLACE } from '@utils/constants';

export const onConfirmWarm: OnConfirmHookType = async ({ newValue, resource }) => {
  const plan = resource as V1beta1Plan;

  const targetWarm = plan?.spec?.warm;
  const op = targetWarm === undefined ? ADD : REPLACE;

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/warm',
        value: newValue === 'true' || undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return obj;
};
