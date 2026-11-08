import { encode } from 'js-base64';

import { describe, expect, it } from '@jest/globals';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  AWS_ACCESS_KEY_ID_SECRET_KEY,
  AWS_SECRET_ACCESS_KEY_SECRET_KEY,
} from '../../fields/ec2/constants';
import { getRegionFromAz, getTargetAzFromNodes, parseAwsCredsSecret } from '../ec2TargetDetection';

const buildNode = (name: string, labels: Record<string, string>): K8sResourceCommon => ({
  metadata: { labels, name },
});

const workerLabel = { 'node-role.kubernetes.io/worker': '' };
const buildSecret = (data: Record<string, string>): unknown => ({ data });

describe('parseAwsCredsSecret', () => {
  it('decodes both base64 credentials', () => {
    const secret = buildSecret({
      [AWS_ACCESS_KEY_ID_SECRET_KEY]: encode('AKIAKEY'),
      [AWS_SECRET_ACCESS_KEY_SECRET_KEY]: encode('SECRETKEY'),
    });

    expect(parseAwsCredsSecret(secret)).toEqual({
      accessKeyId: 'AKIAKEY',
      secretAccessKey: 'SECRETKEY',
    });
  });

  it('returns undefined when a key is missing', () => {
    const secret = buildSecret({ [AWS_ACCESS_KEY_ID_SECRET_KEY]: encode('AKIAKEY') });

    expect(parseAwsCredsSecret(secret)).toBeUndefined();
  });

  it('returns undefined for empty or invalid base64 values without throwing', () => {
    expect(
      parseAwsCredsSecret(
        buildSecret({
          [AWS_ACCESS_KEY_ID_SECRET_KEY]: '',
          [AWS_SECRET_ACCESS_KEY_SECRET_KEY]: encode('SECRETKEY'),
        }),
      ),
    ).toBeUndefined();
    expect(
      parseAwsCredsSecret(
        buildSecret({
          [AWS_ACCESS_KEY_ID_SECRET_KEY]: '!!!not-base64!!!',
          [AWS_SECRET_ACCESS_KEY_SECRET_KEY]: encode('x'),
        }),
      ),
    ).toBeUndefined();
    expect(parseAwsCredsSecret(undefined)).toBeUndefined();
  });
});

describe('getTargetAzFromNodes', () => {
  it('returns the zone of a single zoned worker', () => {
    const nodes = [
      buildNode('worker-a', { ...workerLabel, 'topology.kubernetes.io/zone': 'us-east-1a' }),
    ];

    expect(getTargetAzFromNodes(nodes)).toBe('us-east-1a');
  });

  it('skips workers without a zone label', () => {
    const nodes = [
      buildNode('worker-a', workerLabel),
      buildNode('worker-b', { ...workerLabel, 'topology.kubernetes.io/zone': 'us-east-1b' }),
    ];

    expect(getTargetAzFromNodes(nodes)).toBe('us-east-1b');
  });

  it('ignores zoned nodes without the worker role', () => {
    const nodes = [buildNode('master-a', { 'topology.kubernetes.io/zone': 'us-east-1c' })];

    expect(getTargetAzFromNodes(nodes)).toBeUndefined();
  });

  it('returns undefined for no nodes or only unzoned nodes', () => {
    expect(getTargetAzFromNodes([])).toBeUndefined();
    expect(getTargetAzFromNodes(undefined)).toBeUndefined();
    expect(getTargetAzFromNodes([buildNode('worker-a', workerLabel)])).toBeUndefined();
  });

  it('picks deterministically by node name', () => {
    const nodes = [
      buildNode('worker-z', { ...workerLabel, 'topology.kubernetes.io/zone': 'us-east-1b' }),
      buildNode('worker-a', { ...workerLabel, 'topology.kubernetes.io/zone': 'us-east-1a' }),
    ];

    expect(getTargetAzFromNodes(nodes)).toBe('us-east-1a');
  });
});

describe('getRegionFromAz', () => {
  it.each([
    ['us-east-1a', 'us-east-1'],
    ['eu-west-2c', 'eu-west-2'],
    ['', ''],
    ['us-east-1', 'us-east-1'],
  ])('derives region from %s', (az, region) => {
    expect(getRegionFromAz(az)).toBe(region);
  });
});
