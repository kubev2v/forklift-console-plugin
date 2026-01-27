import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

const getMigrateSharedDisks = (resource: V1beta1Plan): boolean | undefined =>
  resource?.spec?.migrateSharedDisks;

export const getMigrateSharedDisksValue = (resource: V1beta1Plan): boolean => {
  const migrateSharedDisks = getMigrateSharedDisks(resource);
  return migrateSharedDisks ?? true;
};

export const onConfirmMigrateSharedDisks = async ({
  newValue,
  resource,
}: {
  resource: V1beta1Plan;
  newValue: boolean;
}): Promise<V1beta1Plan> => {
  const current = getMigrateSharedDisks(resource);
  const op = current === undefined ? ADD : REPLACE;

  const updated = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/migrateSharedDisks',
        value: newValue ?? undefined,
      },
    ],
    model: PlanModel,
    resource,
  });

  return updated;
};
