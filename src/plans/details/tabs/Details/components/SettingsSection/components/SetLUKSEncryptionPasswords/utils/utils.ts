import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import {
  type IoK8sApiCoreV1Secret,
  PlanModel,
  SecretModel,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getLabels, getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

const escapeJsonPointerToken = (token: string): string =>
  token.replaceAll('~', '~0').replaceAll('/', '~1');

const SOURCE_SECRET_LABEL_PATCH_PATH = `/metadata/labels/${escapeJsonPointerToken(SOURCE_SECRET_LABEL)}`;

const createIndexedBase64Object = (encodedString: string): Record<number, string> | undefined => {
  const list = JSON.parse(encodedString || '[]') as string[];
  if (isEmpty(list) || list.every((item) => !item)) {
    return undefined;
  }

  const result = list.reduce<Record<number, string>>((acc, item, index) => {
    if (item) {
      acc[index] = btoa(item);
    }
    return acc;
  }, {});

  return isEmpty(result) ? undefined : result;
};

type SecretDataReplacePatch = {
  op: typeof REPLACE;
  path: '/data';
  value: Record<number, string>;
};

type SecretLabelRemovePatch = {
  op: typeof REMOVE;
  path: string;
};

type LUKSSecret = {
  currentSecret?: IoK8sApiCoreV1Secret;
  newData: Record<number, string> | undefined;
  planName: string | undefined;
  planUID: string | undefined;
  secretName: string | undefined;
  secretNamespace: string | undefined;
};

const getLUKSSecret = async ({
  currentSecret,
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
    const secretResource = { metadata: { name: secretName, namespace: secretNamespace } };
    const updatedSecret = await k8sPatch({
      data: [{ op: REPLACE, path: '/data', value: newData }] satisfies SecretDataReplacePatch[],
      model: SecretModel,
      resource: secretResource,
    });

    // Best-effort: label REMOVE must not fail the passphrase REPLACE (422 if already gone).
    if (getLabels(currentSecret)?.[SOURCE_SECRET_LABEL]) {
      await k8sPatch({
        data: [
          { op: REMOVE, path: SOURCE_SECRET_LABEL_PATCH_PATH },
        ] satisfies SecretLabelRemovePatch[],
        model: SecretModel,
        resource: secretResource,
      }).catch(() => undefined);
    }

    return updatedSecret;
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
            name: planName ?? '',
            uid: planUID ?? '',
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
  if (!secretName) {
    return;
  }

  await k8sDelete({
    model: SecretModel,
    resource: { metadata: { name: secretName, namespace } },
  }).catch(() => undefined);
};

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
    // No-op only when useEditLUKSState auto-seeded the labeled source
    // (labeledSourceSecretName is set). Manual re-selection omits the name so
    // current source data is copied even if the names match.
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
