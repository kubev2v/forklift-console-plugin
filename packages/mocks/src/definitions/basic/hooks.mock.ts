/* eslint-disable @cspell/spellchecker */
import { HookModelGroupVersionKind as gvk, V1beta1Hook } from '@kubev2v/types';

import { EPOCH, NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION } from '../utils';

export const hook1: V1beta1Hook = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Hook',
  metadata: {
    name: 'hooktest-01',
    namespace: NAMESPACE_MIGRATION,
    selfLink: `/apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_MIGRATION}/hooks/hooktest-01`,
    uid: '28fde094-b667-4d21-8f29-28c18f22178c',
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    image: 'quay.io/konveyor/hook-runner:latest',
    playbook:
      'LS0tCi0gbmFtZTogTWFpbgogIGhvc3RzOiBsb2NhbGhvc3QKICB0YXNrczoKICAtIG5hbWU6IExvYWQgUGxhbgogICAgaW5jbHVkZV92YXJzOgogICAgICBmaWxlOiBwbGFuLnltbAogICAgICBuYW1lOiBwbGFuCiAgLSBuYW1lOiBMb2FkIFdvcmtsb2FkCiAgICBpbmNsdWRlX3ZhcnM6CiAgICAgIGZpbGU6IHdvcmtsb2FkLnltbAogICAgICBuYW1lOiB3b3JrbG9hZAoK',
  },
};

const hook2: V1beta1Hook = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Hook',
  metadata: {
    name: 'hooktest-02',
    namespace: NAMESPACE_FORKLIFT,
    selfLink: `/apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_FORKLIFT}/hooks/hooktest-02`,
    uid: '28fde094-b667-4d21-8f29-28c18f22178b',
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    image: 'quay.io/konveyor/some-custom-image:latest',
  },
};

export const MOCK_HOOKS: V1beta1Hook[] = [hook1, hook2];
