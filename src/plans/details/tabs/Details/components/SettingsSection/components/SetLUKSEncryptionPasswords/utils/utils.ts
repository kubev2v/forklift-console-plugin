import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { type IoK8sApiCoreV1Secret, PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import {
  copySecretForPlan,
  createIndexedBase64Object,
  deleteCurrentSecret,
  getLUKSSecret,
} from './luksSecretOperations';

export const onDiskDecryptionConfirm = async ({
  currentSecret,
  existingSecret,
  labeledSourceSecretName,
  nbdeClevis,
  newValue,
  resource,
}: {
  currentSecret?: IoK8sApiCoreV1Secret;
  existingSecret?: IoK8sApiCoreV1Secret;
  labeledSourceSecretName?: string;
  nbdeClevis: boolean;
  newValue: string;
  resource: V1beta1Plan;
}): Promise<unknown> => {
  const currentSecretName = getLUKSSecretName(resource);
  const secretNamespace = getNamespace(resource);
  const planName = getName(resource);
  const planUID = getUID(resource);
  const planVirtualMachines = getPlanVirtualMachines(resource);

  if (existingSecret) {
    if (labeledSourceSecretName && getName(existingSecret) === labeledSourceSecretName) {
      return undefined;
    }

    const copiedSecret = await copySecretForPlan(
      existingSecret,
      planName ?? '',
      planUID ?? '',
      secretNamespace ?? '',
    );

    await deleteCurrentSecret(currentSecretName, secretNamespace);

    const updatedVMs = planVirtualMachines.map((vm) => ({
      ...vm,
      luks: { name: getName(copiedSecret) },
      nbdeClevis: false,
    }));

    return k8sPatch({
      data: [
        {
          op: planVirtualMachines ? REPLACE : ADD,
          path: '/spec/vms',
          value: updatedVMs,
        },
      ],
      model: PlanModel,
      resource,
    });
  }

  const newData = nbdeClevis ? undefined : createIndexedBase64Object(newValue);

  const secret = await getLUKSSecret({
    currentSecret,
    newData,
    planName,
    planUID,
    secretName: currentSecretName,
    secretNamespace,
  });

  const updatedVMs = planVirtualMachines.map((vm) => ({
    ...vm,
    luks: secret ? { name: getName(secret) } : undefined,
    nbdeClevis,
  }));

  return k8sPatch({
    data: [
      {
        op: planVirtualMachines ? REPLACE : ADD,
        path: '/spec/vms',
        value: updatedVMs,
      },
    ],
    model: PlanModel,
    resource,
  });
};
