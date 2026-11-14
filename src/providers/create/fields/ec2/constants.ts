import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const AWS_ACCESS_KEY_ID_SECRET_KEY = 'aws_access_key_id';
export const AWS_CREDS_NAMESPACE = 'kube-system';
export const AWS_CREDS_SECRET_NAME = 'aws-creds';
export const AWS_SECRET_ACCESS_KEY_SECRET_KEY = 'aws_secret_access_key';
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const NODE_ZONE_LABEL = 'topology.kubernetes.io/zone';
export const WORKER_NODE_ROLE_LABEL = 'node-role.kubernetes.io/worker';

export const NODE_MODEL: K8sModel = {
  abbr: 'N',
  apiVersion: 'v1',
  kind: 'Node',
  label: 'Node',
  labelPlural: 'Nodes',
  plural: 'nodes',
};
