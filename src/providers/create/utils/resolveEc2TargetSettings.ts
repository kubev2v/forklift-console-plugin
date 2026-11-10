import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sGet, k8sList } from '@openshift-console/dynamic-plugin-sdk';

import { ProviderFormFieldId } from '../fields/constants';
import {
  AWS_CREDS_NAMESPACE,
  AWS_CREDS_SECRET_NAME,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  NODE_MODEL,
  WORKER_NODE_ROLE_LABEL,
} from '../fields/ec2/constants';
import type {
  Ec2FormData,
  Ec2ResolvedTarget,
  Ec2TargetResolutionFailure,
  Ec2WorkerNode,
  Ec2WorkerNodeList,
} from '../types';

import { getRegionFromAz, getTargetAzFromNodes, parseAwsCredsSecret } from './ec2TargetDetection';
import { getEc2TargetErrorCode, getEc2TargetErrorMessage } from './ec2TargetErrorDetails';
import { Ec2TargetResolutionError } from './ec2TargetResolutionError';
import { firstNonEmpty } from './firstNonEmpty';

type ParsedAwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
};

type ResolveEc2TargetSettingsOptions = {
  ec2Region: string;
  fetchAwsCredsSecret?: () => Promise<unknown>;
  formData: Ec2FormData;
  listWorkerNodes?: () => Promise<Ec2WorkerNodeList>;
};

const fetchAwsCredsSecretFromCluster = async (): Promise<unknown> =>
  k8sGet<IoK8sApiCoreV1Secret>({
    model: SecretModel,
    name: AWS_CREDS_SECRET_NAME,
    ns: AWS_CREDS_NAMESPACE,
  });

const listWorkerNodesFromCluster = async (): Promise<Ec2WorkerNodeList> =>
  k8sList({
    model: NODE_MODEL,
    queryParams: { labelSelector: WORKER_NODE_ROLE_LABEL },
  });

const toWorkerNodes = (response: Ec2WorkerNodeList): Ec2WorkerNode[] =>
  Array.isArray(response) ? response : (response.items ?? []);

const mapSecretError = (error: unknown): Ec2TargetResolutionFailure => {
  const code = getEc2TargetErrorCode(error);
  if (code === HTTP_FORBIDDEN) {
    return 'secretForbidden';
  }
  if (code === HTTP_NOT_FOUND) {
    return 'secretNotFound';
  }

  return 'unknown';
};

const loadAwsCredentials = async (
  fetchAwsCredsSecret: () => Promise<unknown>,
): Promise<ParsedAwsCredentials> => {
  try {
    const parsedCredentials = parseAwsCredsSecret(await fetchAwsCredsSecret());
    if (!parsedCredentials) {
      throw new Ec2TargetResolutionError('secretInvalid');
    }
    return parsedCredentials;
  } catch (error) {
    if (error instanceof Ec2TargetResolutionError) {
      throw error;
    }

    throw new Ec2TargetResolutionError(mapSecretError(error), getEc2TargetErrorMessage(error));
  }
};

const mapNodesError = (error: unknown): Ec2TargetResolutionFailure =>
  getEc2TargetErrorCode(error) === HTTP_FORBIDDEN ? 'nodesForbidden' : 'unknown';

const detectTargetAz = async (
  listWorkerNodes: () => Promise<Ec2WorkerNodeList>,
): Promise<string | undefined> => {
  let response: Ec2WorkerNodeList;
  try {
    response = await listWorkerNodes();
  } catch (error) {
    throw new Ec2TargetResolutionError(mapNodesError(error), getEc2TargetErrorMessage(error));
  }

  const az = getTargetAzFromNodes(toWorkerNodes(response));
  if (!az) {
    throw new Ec2TargetResolutionError('noWorkerZone');
  }
  return az;
};

export const resolveEc2TargetSettings = async ({
  ec2Region,
  fetchAwsCredsSecret = fetchAwsCredsSecretFromCluster,
  formData,
  listWorkerNodes = listWorkerNodesFromCluster,
}: ResolveEc2TargetSettingsOptions): Promise<Ec2ResolvedTarget> => {
  const resolved: Ec2ResolvedTarget = {};

  const explicitKeyId = firstNonEmpty(formData[ProviderFormFieldId.Ec2TargetAccessKeyId]);
  const explicitSecretKey = firstNonEmpty(formData[ProviderFormFieldId.Ec2TargetSecretAccessKey]);

  if (explicitKeyId && explicitSecretKey) {
    resolved.targetAccessKeyId = explicitKeyId;
    resolved.targetSecretAccessKey = explicitSecretKey;
  } else {
    const credentials = await loadAwsCredentials(fetchAwsCredsSecret);
    resolved.targetAccessKeyId = explicitKeyId ?? credentials.accessKeyId;
    resolved.targetSecretAccessKey = explicitSecretKey ?? credentials.secretAccessKey;
  }

  const explicitAz = firstNonEmpty(formData[ProviderFormFieldId.Ec2TargetAz]);
  const targetAz = explicitAz ?? (await detectTargetAz(listWorkerNodes));
  if (targetAz) {
    resolved.targetAz = targetAz;
  }

  const targetRegion =
    firstNonEmpty(formData[ProviderFormFieldId.Ec2TargetRegion]) ??
    firstNonEmpty(getRegionFromAz(targetAz ?? '')) ??
    firstNonEmpty(ec2Region);
  if (targetRegion) {
    resolved.targetRegion = targetRegion;
  }

  return resolved;
};
