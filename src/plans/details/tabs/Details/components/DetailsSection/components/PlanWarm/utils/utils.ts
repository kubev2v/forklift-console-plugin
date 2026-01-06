import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

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
  const type = newValue ? MigrationTypeValue.Warm : MigrationTypeValue.Cold;

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/warm',
        value: newValue,
      },
      {
        op: REPLACE,
        path: '/spec/type',
        value: type,
      },
    ],
    model: PlanModel,
    resource,
  });

  return obj;
};
