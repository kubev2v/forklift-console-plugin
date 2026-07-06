import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import {
  type IoK8sApiCoreV1Secret,
  PlanModel,
  SecretModel,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

const createIndexedBase64Object = (encodedString: string): Record<number, string> | undefined => {
  const list: string[] = JSON.parse(encodedString || '[]');
  if (isEmpty(list) || list.every((item) => !item)) return undefined;

  const result = list.reduce<Record<number, string>>((acc, item, index) => {
    if (item) acc[index] = btoa(item);
    return acc;
  }, {});

  return isEmpty(result) ? undefined : result;
};

type LUKSSecret = {
  secretName: string | undefined;
  secretNamespace: string | undefined;
  planName: string | undefined;
  planUID: string | undefined;
  newData: Record<number, string> | undefined;
};

const getLUKSSecret = async ({
  newData,
  planName,
  planUID,
  secretName,
  secretNamespace,
}: LUKSSecret): Promise<IoK8sApiCoreV1Secret | undefined> => {
  if (secretName && !newData) {
    return k8sDelete({
      model: SecretModel,
      resource: { metadata: { name: secretName, namespace: secretNamespace } },
    });
  }

  if (secretName && newData) {
    return k8sPatch({
      data: [{ op: REPLACE, path: '/data', value: newData }],
      model: SecretModel,
      resource: { metadata: { name: secretName, namespace: secretNamespace } },
    });
  }

  if (!secretName && newData) {
    const newSecret: IoK8sApiCoreV1Secret = {
      data: newData,
      metadata: {
        generateName: `${planName}-`,
        namespace: secretNamespace,
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: planName!,
            uid: planUID!,
          },
        ],
      },
      type: 'Opaque',
    };

    return k8sCreate({ data: newSecret, model: SecretModel });
  }

  return undefined;
};

const copySecretForPlan = async (
  existingSecret: IoK8sApiCoreV1Secret,
  planName: string,
  planUID: string,
  namespace: string,
): Promise<IoK8sApiCoreV1Secret> => {
  const newSecret: IoK8sApiCoreV1Secret = {
    data: existingSecret.data,
    metadata: {
      generateName: `${planName}-`,
      labels: {
        [SOURCE_SECRET_LABEL]: existingSecret.metadata?.name ?? '',
      },
      namespace,
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Plan',
          name: planName,
          uid: planUID,
        },
      ],
    },
    type: existingSecret.type ?? 'Opaque',
  };

  return k8sCreate({ data: newSecret, model: SecretModel });
};

const deleteCurrentSecret = async (
  secretName: string | undefined,
  namespace: string | undefined,
): Promise<void> => {
  if (!secretName) return;

  await k8sDelete({
    model: SecretModel,
    resource: { metadata: { name: secretName, namespace } },
  }).catch(() => undefined);
};

export const onDiskDecryptionConfirm = async ({
  existingSecret,
  nbdeClevis,
  newValue,
  resource,
}: {
  existingSecret?: IoK8sApiCoreV1Secret;
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
    const copiedSecret = await copySecretForPlan(
      existingSecret,
      planName!,
      planUID!,
      secretNamespace!,
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
