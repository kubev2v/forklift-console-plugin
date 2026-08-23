import { SOURCE_SECRET_LABEL } from 'src/plans/create/utils/copyDecryptionSecret';

import { REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getLabels } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

const escapeJsonPointerToken = (token: string): string =>
  token.replaceAll('~', '~0').replaceAll('/', '~1');

const SOURCE_SECRET_LABEL_PATCH_PATH = `/metadata/labels/${escapeJsonPointerToken(SOURCE_SECRET_LABEL)}`;

export const createIndexedBase64Object = (
  encodedString: string,
): Record<number, string> | undefined => {
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

type LUKSSecretParams = {
  currentSecret?: IoK8sApiCoreV1Secret;
  newData: Record<number, string> | undefined;
  planName: string | undefined;
  planUID: string | undefined;
  secretName: string | undefined;
  secretNamespace: string | undefined;
};

export const getLUKSSecret = async ({
  currentSecret,
  newData,
  planName,
  planUID,
  secretName,
  secretNamespace,
}: LUKSSecretParams): Promise<IoK8sApiCoreV1Secret | undefined> => {
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

    if (currentSecret && getLabels(currentSecret)?.[SOURCE_SECRET_LABEL]) {
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

export const copySecretForPlan = async (
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

export const deleteCurrentSecret = async (
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
