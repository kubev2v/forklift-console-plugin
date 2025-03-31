import type { OnConfirmHookType } from 'src/modules/Providers/modals';

import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { createIndexedBase64Object } from './createIndexedBase64Object';

export const onLUKSEncryptionPasswordsConfirm: OnConfirmHookType = async ({
  model,
  newValue,
  resource,
}) => {
  const plan = resource as V1beta1Plan;

  // Check for secret
  const secretName = plan.spec.vms?.[0]?.luks?.name;
  const secretNamespace = plan.metadata.namespace;

  // Check for new data
  const newData = createIndexedBase64Object(newValue as string);

  // Init an empty secret
  let secret: IoK8sApiCoreV1Secret;

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
      data: [
        {
          op: 'replace',
          path: '/data',
          value: newData,
        },
      ],
      model: SecretModel,
      resource: { metadata: { name: secretName, namespace: secretNamespace } },
    });
  }

  // if no secret
  if (!secretName && newData) {
    // create secret
    const newSecret: IoK8sApiCoreV1Secret = {
      data: newData,
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
      type: 'Opaque',
    };

    secret = await k8sCreate({
      data: newSecret,
      model: SecretModel,
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
    data: [
      {
        op,
        path: '/spec/vms',
        value: newVMs || undefined,
      },
    ],
    model,
    resource,
  });

  return obj;
};
