import { HostModel, type V1beta1Host } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const patchHost = async (host: V1beta1Host, ipAddress: string) => {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/ipAddress',
        value: ipAddress,
      },
    ],
    model: HostModel,
    resource: host,
  });
};
