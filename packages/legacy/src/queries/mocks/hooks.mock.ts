import { IHook } from '../types';
import { CLUSTER_API_VERSION } from 'legacy/src/common/constants';

export let MOCK_HOOKS: IHook[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const hook1: IHook = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Hook',
    metadata: {
      name: 'hooktest-01',
      namespace: 'openshift-migration',
      selfLink:
        '/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-migration/hooks/hooktest-01',
      uid: '28fde094-b667-4d21-8f29-28c18f22178c',
      creationTimestamp: '2021-05-04T19:40:49Z',
    },
    spec: {
      image: 'quay.io/konveyor/hook-runner:latest',
      playbook:
        'LS0tCi0gbmFtZTogTWFpbgogIGhvc3RzOiBsb2NhbGhvc3QKICB0YXNrczoKICAtIG5hbWU6IExvYWQgUGxhbgogICAgaW5jbHVkZV92YXJzOgogICAgICBmaWxlOiBwbGFuLnltbAogICAgICBuYW1lOiBwbGFuCiAgLSBuYW1lOiBMb2FkIFdvcmtsb2FkCiAgICBpbmNsdWRlX3ZhcnM6CiAgICAgIGZpbGU6IHdvcmtsb2FkLnltbAogICAgICBuYW1lOiB3b3JrbG9hZAoK',
    },
  };

  const hook2: IHook = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Hook',
    metadata: {
      name: 'hooktest-02',
      namespace: 'openshift-migration',
      selfLink:
        '/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-migration/hooks/hooktest-02',
      uid: '28fde094-b667-4d21-8f29-28c18f22178b',
      creationTimestamp: '2021-05-04T19:40:50Z',
    },
    spec: {
      image: 'quay.io/konveyor/some-custom-image:latest',
    },
  };

  MOCK_HOOKS = [hook1, hook2];
}
