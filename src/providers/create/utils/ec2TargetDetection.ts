import { decode, isValid } from 'js-base64';

import { getLabels, getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import {
  AWS_ACCESS_KEY_ID_SECRET_KEY,
  AWS_SECRET_ACCESS_KEY_SECRET_KEY,
  NODE_ZONE_LABEL,
  WORKER_NODE_ROLE_LABEL,
} from '../fields/ec2/constants';
import type { Ec2WorkerNode } from '../types';

type ParsedAwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const decodeSecretValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || isEmpty(value) || !isValid(value)) {
    return undefined;
  }

  try {
    const decoded = decode(value).trim();
    return isEmpty(decoded) ? undefined : decoded;
  } catch {
    return undefined;
  }
};

/**
 * Decodes the AWS credentials secret exactly once, CLI parity with kubectl-mtv
 * `FetchAWSCredentialsFromCluster`.
 */
export const parseAwsCredsSecret = (secret: unknown): ParsedAwsCredentials | undefined => {
  if (!isRecord(secret) || !isRecord(secret.data)) {
    return undefined;
  }

  const accessKeyId = decodeSecretValue(secret.data[AWS_ACCESS_KEY_ID_SECRET_KEY]);
  const secretAccessKey = decodeSecretValue(secret.data[AWS_SECRET_ACCESS_KEY_SECRET_KEY]);

  if (!accessKeyId || !secretAccessKey) {
    return undefined;
  }

  return { accessKeyId, secretAccessKey };
};

const isWorkerNode = (node: unknown): node is Ec2WorkerNode => {
  const labels = isRecord(node) ? getLabels(node) : undefined;
  return labels !== undefined && Object.hasOwn(labels, WORKER_NODE_ROLE_LABEL);
};

const getNodeZone = (node: Ec2WorkerNode): string =>
  getLabels(node)?.[NODE_ZONE_LABEL]?.trim() ?? '';

/**
 * Picks the availability zone of the first worker node (sorted by name) that carries a zone
 * label, matching kubectl-mtv without depending on API response order.
 */
export const getTargetAzFromNodes = (nodes: unknown): string | undefined => {
  if (!Array.isArray(nodes)) {
    return undefined;
  }

  const zonedWorkers = nodes
    .filter(isWorkerNode)
    .map((node) => ({ name: getName(node) ?? '', zone: getNodeZone(node) }))
    .filter((worker) => !isEmpty(worker.zone))
    .sort((first, second) => first.name.localeCompare(second.name));

  return zonedWorkers[0]?.zone;
};

const isLowercaseLetter = (value: string): boolean => value >= 'a' && value <= 'z';

/**
 * Derives the region from an availability zone by dropping its trailing letter (CLI parity).
 * Local Zones such as `us-west-2-lax-1a` are mis-derived on purpose: Local Zones are not
 * supported for EBS volume creation, so the derived value surfaces the problem instead of hiding it.
 */
export const getRegionFromAz = (az: string): string => {
  const trimmed = az.trim();
  return isLowercaseLetter(trimmed.slice(-1)) ? trimmed.slice(0, -1) : trimmed;
};
