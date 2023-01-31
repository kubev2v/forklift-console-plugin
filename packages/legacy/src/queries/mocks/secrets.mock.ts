import { ISecret } from '../types';

export let MOCK_SECRET: ISecret;

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_SECRET = {
    kind: 'Secret',
    apiVersion: 'v1',
    metadata: {
      name: 'mock-secret',
      namespace: 'openshift-migration',
      selfLink: '/foo/secret',
      uid: 'e0f1078b-ce2a-4487-8281-5176267b78c2',
      creationTimestamp: '2020-12-18T17:43:30Z',
    },
    data: {
      password: 'bW9jay1wYXNzd29yZA==',
      thumbprint:
        'Mzk6NUM6NkE6MkQ6MzY6Mzg6QjI6NTI6MkI6MjE6RUE6NzQ6MTE6NTk6ODk6NUU6MjA6RDU6RDk6QTI=', // Change this to something else base64-encoded like YnVsbHNoaXQ= to test "cannot verify" warning state
      user: 'bW9jay11c2Vy',
      token: 'bW9jay1zYS10b2tlbg==',
    },
    type: 'Opaque',
  };
}
