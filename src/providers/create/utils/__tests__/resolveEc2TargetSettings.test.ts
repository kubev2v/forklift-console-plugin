import { encode } from 'js-base64';

import { describe, expect, it, jest } from '@jest/globals';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { ProviderFormFieldId } from '../../fields/constants';
import {
  AWS_ACCESS_KEY_ID_SECRET_KEY,
  AWS_SECRET_ACCESS_KEY_SECRET_KEY,
} from '../../fields/ec2/constants';
import type { Ec2FormData, Ec2ResolvedTarget, Ec2TargetResolutionFailure } from '../../types';
import { Ec2TargetResolutionError } from '../ec2TargetResolutionError';
import { resolveEc2TargetSettings } from '../resolveEc2TargetSettings';

type SecretFetcher = () => Promise<unknown>;
type NodeLister = () => Promise<K8sResourceCommon[]>;

type ResolveHarness = {
  fetchAwsCredsSecret: jest.MockedFunction<SecretFetcher>;
  listWorkerNodes: jest.MockedFunction<NodeLister>;
  promise: Promise<Ec2ResolvedTarget>;
};

const resolveTo = <T>(value: T): Promise<T> => Promise.resolve(value);
const rejectWith = (error: Error): Promise<never> => Promise.reject(error);
const httpError = (code: number): Error => Object.assign(new Error(`HTTP ${code}`), { code });

const zonedWorker: K8sResourceCommon = {
  metadata: {
    labels: {
      'node-role.kubernetes.io/worker': '',
      'topology.kubernetes.io/zone': 'us-east-1a',
    },
    name: 'worker-a',
  },
};

const awsCredsSecret = {
  data: {
    [AWS_ACCESS_KEY_ID_SECRET_KEY]: encode('TARGETKEY'),
    [AWS_SECRET_ACCESS_KEY_SECRET_KEY]: encode('TARGETSECRET'),
  },
};

const formData: Ec2FormData = {
  [ProviderFormFieldId.ProviderName]: 'ec2',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'ec2',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
};

const resolve = (
  overrides: Partial<Ec2FormData> = {},
  secret: SecretFetcher = (): Promise<unknown> => resolveTo(awsCredsSecret),
  nodes: NodeLister = (): Promise<K8sResourceCommon[]> => resolveTo([zonedWorker]),
): ResolveHarness => {
  const fetchAwsCredsSecret = jest.fn(secret);
  const listWorkerNodes = jest.fn(nodes);

  return {
    fetchAwsCredsSecret,
    listWorkerNodes,
    promise: resolveEc2TargetSettings({
      ec2Region: 'us-east-1',
      fetchAwsCredsSecret,
      formData: { ...formData, ...overrides },
      listWorkerNodes,
    }),
  };
};

const rejectionOf = async (
  overrides: Partial<Ec2FormData>,
  secret: SecretFetcher,
  reason: Ec2TargetResolutionFailure,
): Promise<void> => {
  await expect(resolve(overrides, secret).promise).rejects.toMatchObject({ reason });
};

describe('resolveEc2TargetSettings', () => {
  it('resolves credentials, zone and region on the happy path', async () => {
    await expect(resolve().promise).resolves.toEqual({
      targetAccessKeyId: 'TARGETKEY',
      targetAz: 'us-east-1a',
      targetRegion: 'us-east-1',
      targetSecretAccessKey: 'TARGETSECRET',
    });
  });

  it('maps a forbidden secret and never lists nodes', async () => {
    const harness = resolve({}, (): Promise<unknown> => rejectWith(httpError(403)));

    await expect(harness.promise).rejects.toMatchObject({ reason: 'secretForbidden' });
    expect(harness.listWorkerNodes).not.toHaveBeenCalled();
  });

  it('maps a missing secret', async () => {
    await rejectionOf({}, (): Promise<unknown> => rejectWith(httpError(404)), 'secretNotFound');
  });

  it('maps a secret without usable keys', async () => {
    await rejectionOf({}, (): Promise<unknown> => resolveTo({ data: {} }), 'secretInvalid');
  });

  it('maps a forbidden node list', async () => {
    await expect(
      resolve({}, undefined, (): Promise<K8sResourceCommon[]> => rejectWith(httpError(403)))
        .promise,
    ).rejects.toMatchObject({ reason: 'nodesForbidden' });
  });

  it('maps a cluster without a zoned worker', async () => {
    await expect(
      resolve({}, undefined, (): Promise<K8sResourceCommon[]> => resolveTo([])).promise,
    ).rejects.toMatchObject({ reason: 'noWorkerZone' });
  });

  it('maps unexpected errors to unknown', async () => {
    await rejectionOf({}, (): Promise<unknown> => rejectWith(new Error('boom')), 'unknown');
  });

  it('prefers explicit cross-account keys and skips the secret read', async () => {
    const harness = resolve({
      [ProviderFormFieldId.Ec2TargetAccessKeyId]: 'EXPLICIT',
      [ProviderFormFieldId.Ec2TargetSecretAccessKey]: 'EXPLICITSECRET',
    });

    await expect(harness.promise).resolves.toMatchObject({
      targetAccessKeyId: 'EXPLICIT',
      targetAz: 'us-east-1a',
      targetSecretAccessKey: 'EXPLICITSECRET',
    });
    expect(harness.fetchAwsCredsSecret).not.toHaveBeenCalled();
  });

  it('decodes base64 credentials exactly once', async () => {
    const resolved = await resolve().promise;

    expect(resolved.targetAccessKeyId).toBe('TARGETKEY');
    expect(resolved.targetAccessKeyId).not.toBe(encode('TARGETKEY'));
  });

  it('provides distinct, non-empty copy for every failure reason', () => {
    const reasons: Ec2TargetResolutionFailure[] = [
      'secretForbidden',
      'secretNotFound',
      'secretInvalid',
      'nodesForbidden',
      'noWorkerZone',
      'unknown',
    ];
    const messages = reasons.map((reason) => new Ec2TargetResolutionError(reason).message);

    expect(new Set(messages).size).toBe(reasons.length);
    expect(messages.every((message) => message.length > 0)).toBe(true);
  });
});
