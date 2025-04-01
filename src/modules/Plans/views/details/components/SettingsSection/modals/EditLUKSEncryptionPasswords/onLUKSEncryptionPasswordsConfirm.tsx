import { OnConfirmHookType } from 'src/modules/Providers/modals/EditModal/types';

import { IoK8sApiCoreV1Secret, SecretModel, V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { createIndexedBase64Object } from './createIndexedBase64Object';

export const onLUKSEncryptionPasswordsConfirm: OnConfirmHookType = async ({
  resource,
  model,
  newValue,
}) => {
  const plan = resource as V1beta1Plan;

  // Check for secret
  const secretName = plan.spec.vms?.[0]?.luks?.name;
  const secretNamespace = plan.metadata.namespace;

  // Check for new data
  const newData = createIndexedBase64Object(newValue as string);

  // Init an empty secret
  let secret: IoK8sApiCoreV1Secret = undefined;

  // if secret exist and we have no new data
  if (secretName && !newData) {
    // delete secret
    await k8sDelete({
      model: SecretModel,
      resource: { metadata: { name: secretName, namespace: secretNamespace } },
    });
  }

  // if secret exist and we have new data
  if (secretName && newData) {
    // edit secret
    secret = await k8sPatch({
      model: SecretModel,
      resource: { metadata: { name: secretName, namespace: secretNamespace } },
      data: [
        {
          op: 'replace',
          path: '/data',
          value: newData,
        },
      ],
    });
  }

  // if no secret
  if (!secretName && newData) {
    // create secret
    const newSecret: IoK8sApiCoreV1Secret = {
      metadata: {
        generateName: `${plan.metadata.name}-`,
        namespace: secretNamespace,
        ownerReferences: [
          {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            name: plan.metadata.name,
            uid: plan.metadata.uid,
          },
        ],
      },
      data: newData,
      type: 'Opaque',
    };

    secret = await k8sCreate({
      model: SecretModel,
      data: newSecret,
    });
  }

  // update plan vms
  const resourceValue = plan?.spec?.vms;
  const op = resourceValue ? 'replace' : 'add';
  const newVMs = resourceValue.map((vm) => ({
    ...vm,
    luks: secret ? { name: secret.metadata.name } : undefined,
  }));

  const obj = await k8sPatch({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: '/spec/vms',
        value: newVMs || undefined,
      },
    ],
  });

  return obj;
};
