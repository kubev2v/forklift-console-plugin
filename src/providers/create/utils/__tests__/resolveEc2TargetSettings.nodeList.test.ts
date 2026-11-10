import { encode } from 'js-base64';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { k8sList, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { ProviderFormFieldId } from '../../fields/constants';
import {
  AWS_ACCESS_KEY_ID_SECRET_KEY,
  AWS_SECRET_ACCESS_KEY_SECRET_KEY,
  NODE_MODEL,
} from '../../fields/ec2/constants';
import type { Ec2FormData, Ec2WorkerNodeList } from '../../types';
import { resolveEc2TargetSettings } from '../resolveEc2TargetSettings';

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  k8sGet: jest.fn(),
  k8sList: jest.fn(),
}));

const mockList = k8sList as jest.MockedFunction<typeof k8sList>;

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

const zonedWorker: K8sResourceCommon = {
  metadata: {
    labels: {
      'node-role.kubernetes.io/worker': '',
      'topology.kubernetes.io/zone': 'us-east-1b',
    },
    name: 'worker-b',
  },
};

const zonedNonWorker: K8sResourceCommon = {
  metadata: {
    labels: { 'topology.kubernetes.io/zone': 'us-east-1a' },
    name: 'master-a',
  },
};

const unzonedWorker: K8sResourceCommon = {
  metadata: {
    labels: { 'node-role.kubernetes.io/worker': '' },
    name: 'worker-a',
  },
};

const mixedNodes = [zonedWorker, zonedNonWorker, unzonedWorker];

const resolveWithClusterFetchers = (): Promise<unknown> =>
  resolveEc2TargetSettings({
    ec2Region: 'us-east-1',
    fetchAwsCredsSecret: jest.fn((): Promise<unknown> => Promise.resolve(awsCredsSecret)),
    formData,
  });

const resolveWithList = (response: Ec2WorkerNodeList): Promise<unknown> =>
  resolveEc2TargetSettings({
    ec2Region: 'us-east-1',
    fetchAwsCredsSecret: jest.fn((): Promise<unknown> => Promise.resolve(awsCredsSecret)),
    formData,
    listWorkerNodes: jest.fn((): Promise<Ec2WorkerNodeList> => Promise.resolve(response)),
  });

describe('resolveEc2TargetSettings node list responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockList.mockResolvedValue({ items: mixedNodes });
  });

  it('lists nodes without a label selector', async () => {
    await resolveWithClusterFetchers();

    expect(mockList).toHaveBeenCalledTimes(1);
    const [[options]] = mockList.mock.calls;
    expect(options.model).toBe(NODE_MODEL);
    expect(options.queryParams).toEqual({});
  });

  it('picks the zoned worker from a mixed node list', async () => {
    await expect(resolveWithClusterFetchers()).resolves.toMatchObject({
      targetAz: 'us-east-1b',
      targetRegion: 'us-east-1',
    });
  });

  it('reads nodes from an items wrapper', async () => {
    await expect(resolveWithList({ items: [zonedWorker] })).resolves.toMatchObject({
      targetAz: 'us-east-1b',
      targetRegion: 'us-east-1',
    });
  });

  it('accepts a bare array response', async () => {
    await expect(resolveWithList([zonedWorker])).resolves.toMatchObject({
      targetAz: 'us-east-1b',
    });
  });

  it('reports noWorkerZone for an empty items wrapper', async () => {
    await expect(resolveWithList({ items: [] })).rejects.toMatchObject({ reason: 'noWorkerZone' });
  });
});
