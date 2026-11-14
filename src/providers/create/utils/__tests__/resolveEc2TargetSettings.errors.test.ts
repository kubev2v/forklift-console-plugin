import { encode } from 'js-base64';

import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { ProviderFormFieldId } from '../../fields/constants';
import {
  AWS_ACCESS_KEY_ID_SECRET_KEY,
  AWS_SECRET_ACCESS_KEY_SECRET_KEY,
} from '../../fields/ec2/constants';
import type { Ec2FormData, Ec2TargetResolutionFailure, Ec2WorkerNodeList } from '../../types';
import { Ec2TargetResolutionError } from '../ec2TargetResolutionError';
import { resolveEc2TargetSettings } from '../resolveEc2TargetSettings';

type Fetcher = () => Promise<unknown>;

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

const httpError = (properties: Record<string, unknown>): Error =>
  Object.assign(new Error('request failed'), properties);

const rejectWith =
  <T>(error: Error) =>
  (): Promise<T> =>
    Promise.reject(error);

const resolveList =
  (response: unknown): (() => Promise<Ec2WorkerNodeList>) =>
  (): Promise<Ec2WorkerNodeList> =>
    Promise.resolve(response as Ec2WorkerNodeList);

const resolve = (secret: Fetcher, nodes: Fetcher = resolveList([])): Promise<unknown> =>
  resolveEc2TargetSettings({
    ec2Region: 'us-east-1',
    fetchAwsCredsSecret: jest.fn(secret),
    formData,
    listWorkerNodes: jest.fn(nodes as () => Promise<Ec2WorkerNodeList>),
  });

const expectReason = async (
  promise: Promise<unknown>,
  reason: Ec2TargetResolutionFailure,
): Promise<Ec2TargetResolutionError> => {
  const error = await promise.then(
    () => undefined,
    (rejection: unknown) => rejection,
  );

  expect(error).toBeInstanceOf(Ec2TargetResolutionError);
  expect(error).toMatchObject({ reason });
  return error as Ec2TargetResolutionError;
};

const SECRET_FORBIDDEN_ERRORS: [string, Error][] = [
  ['status', httpError({ status: 403 })],
  ['nested response status', httpError({ response: { status: 403 } })],
  ['numeric string code', httpError({ code: '403' })],
  ['forbidden message', httpError({ message: 'forbidden' })],
  ['forbidden reason', httpError({ reason: 'Forbidden' })],
];

const NODE_FORBIDDEN_ERRORS: [string, Error][] = [
  ['status code field', httpError({ statusCode: 403 })],
  ['nested response status', httpError({ response: { status: 403 } })],
  ['numeric string code', httpError({ code: '403' })],
  ['forbidden message', httpError({ message: 'Request failed: Forbidden' })],
];

describe('resolveEc2TargetSettings error classification', () => {
  it.each(SECRET_FORBIDDEN_ERRORS)(
    'maps a %s secret error to secretForbidden',
    async (_, error) => {
      await expectReason(resolve(rejectWith(error)), 'secretForbidden');
    },
  );

  it.each(NODE_FORBIDDEN_ERRORS)('maps a %s node error to nodesForbidden', async (_, error) => {
    await expectReason(resolve(resolveList(awsCredsSecret), rejectWith(error)), 'nodesForbidden');
  });

  it('maps a not-found secret message to secretNotFound', async () => {
    await expectReason(resolve(rejectWith(httpError({ reason: 'NotFound' }))), 'secretNotFound');
  });

  it('includes the underlying message for unknown errors', async () => {
    const error = await expectReason(resolve(rejectWith(new Error('socket hang up'))), 'unknown');

    expect(error.message).toContain('socket hang up');
    expect(error.message).toContain('Enter the target settings manually');
  });

  it('truncates long unknown error details', async () => {
    const error = await expectReason(resolve(rejectWith(new Error('x'.repeat(500)))), 'unknown');

    expect(error.message).toContain('x'.repeat(200));
    expect(error.message).not.toContain('x'.repeat(201));
  });
});
