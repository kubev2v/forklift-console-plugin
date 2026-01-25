import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const patchSecret = async (
  secretData: IoK8sApiCoreV1Secret,
  encodedIpAddress: string,
  encodedUser?: string,
  encodedPassword?: string,
) => {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/data/ip',
        value: encodedIpAddress,
      },
      {
        op: 'replace',
        path: '/data/user',
        value: encodedUser,
      },
      {
        op: 'replace',
        path: '/data/password',
        value: encodedPassword,
      },
    ],
    model: SecretModel,
    resource: secretData,
  });
};
