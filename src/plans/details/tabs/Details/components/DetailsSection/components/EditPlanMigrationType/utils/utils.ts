import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';

type OnConfirmMigrationTypeParams = {
  newValue: MigrationTypeValue;
  resource: V1beta1Plan;
};

export const onConfirmMigrationType = async ({
  newValue,
  resource,
}: OnConfirmMigrationTypeParams): Promise<V1beta1Plan> => {
  const isWarm = newValue === MigrationTypeValue.Warm;
  const warmOp = getPlanIsWarm(resource) === undefined ? ADD : REPLACE;

  return k8sPatch({
    data: [
      {
        op: warmOp,
        path: '/spec/warm',
        value: isWarm,
      },
      {
        op: REPLACE,
        path: '/spec/type',
        value: newValue,
      },
    ],
    model: PlanModel,
    resource,
  });
};
