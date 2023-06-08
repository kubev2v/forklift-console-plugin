/* eslint-disable @cspell/spellchecker */
import { V1Secret } from '@kubev2v/types';

import { EPOCH } from '../utils';

export const secretInsecure = (namespace: string): V1Secret => ({
  kind: 'Secret',
  apiVersion: 'v1',
  metadata: {
    name: 'mock-insecure',
    namespace,
    uid: 'e0f1078b-ce2a-4487-8281-5176267b78c2',
    creationTimestamp: EPOCH.toISO(),
  },
  data: {
    password: 'bW9jay1wYXNzd29yZA==',
    thumbprint: 'Mzk6NUM6NkE6MkQ6MzY6Mzg6QjI6NTI6MkI6MjE6RUE6NzQ6MTE6NTk6ODk6NUU6MjA6RDU6RDk6QTI=', // Change this to something else base64-encoded like YnVsbHNoaXQ= to test "cannot verify" warning state
    user: 'bW9jay11c2Vy',
    token: 'bW9jay1zYS10b2tlbg==',
    username: 'bW9jay11c2Vy', // used by OpenStack only
    domainName: 'bW9jay1kb21haW4=', // used by OpenStack only
    projectName: 'bW9jay1wcm9qZWN0', // used by OpenStack only
    regionName: 'bW9jay1yZWdpb24=', // used by OpenStack only
    insecureSkipVerify: 'dHJ1ZQ==',
  },
  type: 'Opaque',
});

export const secretSecure = (namespace: string): V1Secret => {
  const insecure = secretInsecure(namespace);
  return {
    ...insecure,
    metadata: {
      ...insecure.metadata,
      name: 'mock-secure',
    },
    data: {
      ...insecure.data,
      insecureSkipVerify: 'ZmFsc2U=',
      cacert:
        'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVJekNDQXd1Z0F3SUJBZ0lDRUFBd0RRWUpLb1pJaHZjTkFRRUxCUUF3WnpFTE1BawpFdW1YWGhvRGRyR1g2bG93RkEvNUdiSyt5TFRxNDREUVd0YUd5Sk9aa29iK3BqRkZ0Zz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K',
    },
  };
};
