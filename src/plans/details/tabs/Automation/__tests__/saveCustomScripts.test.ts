import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { saveCustomScripts } from '../utils/saveCustomScripts';

const mockK8sDelete = jest.fn();
const mockK8sPatch = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sDelete: jest.fn((...args) => mockK8sDelete(...args)),
  k8sPatch: jest.fn((...args) => mockK8sPatch(...args)),
}));

const mockCreateConfigMap = jest.fn();
jest.mock('src/plans/create/utils/createCustomScriptsConfigMap', () => ({
  createCustomScriptsConfigMap: jest.fn((...args) => mockCreateConfigMap(...args)),
}));

const mockPlan = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Plan;

const mockConfigMap = {
  data: { 'some-key': 'some-value' },
  metadata: { name: 'test-plan-scripts', namespace: 'test-ns' },
} as unknown as IoK8sApiCoreV1ConfigMap;

const mockScripts: CustomScript[] = [
  {
    content: '#!/bin/bash\necho hello',
    guestType: 'linux',
    name: 'setup',
    scriptType: 'firstboot',
  },
] as CustomScript[];

describe('saveCustomScripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('patches existing configMap when configMap is provided', async () => {
    await saveCustomScripts({ configMap: mockConfigMap, plan: mockPlan, scripts: mockScripts });

    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: mockConfigMap,
      }),
    );
    expect(mockCreateConfigMap).not.toHaveBeenCalled();
  });

  it('creates configMap and patches plan when configMap is undefined', async () => {
    const createdConfigMap = {
      metadata: { name: 'test-plan-scripts', namespace: 'test-ns' },
    };
    mockCreateConfigMap.mockResolvedValue(createdConfigMap);

    await saveCustomScripts({ configMap: undefined, plan: mockPlan, scripts: mockScripts });

    expect(mockCreateConfigMap).toHaveBeenCalledWith({
      planName: 'test-plan',
      planProject: 'test-ns',
      scripts: mockScripts,
    });

    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            op: 'add',
            path: '/spec/customizationScripts',
            value: {
              name: 'test-plan-scripts',
              namespace: 'test-ns',
            },
          },
        ],
        resource: mockPlan,
      }),
    );
  });

  it('deletes configMap and removes plan ref when saving empty scripts with existing configMap', async () => {
    await saveCustomScripts({ configMap: mockConfigMap, plan: mockPlan, scripts: [] });

    expect(mockK8sDelete).toHaveBeenCalledTimes(1);
    expect(mockK8sDelete).toHaveBeenCalledWith(
      expect.objectContaining({ resource: mockConfigMap }),
    );
    expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ op: 'remove', path: '/spec/customizationScripts' }],
        resource: mockPlan,
      }),
    );
  });

  it('does nothing when saving empty scripts with no existing configMap', async () => {
    await saveCustomScripts({ configMap: undefined, plan: mockPlan, scripts: [] });

    expect(mockK8sDelete).not.toHaveBeenCalled();
    expect(mockK8sPatch).not.toHaveBeenCalled();
    expect(mockCreateConfigMap).not.toHaveBeenCalled();
  });

  it('uses add op when configMap exists but has no data', async () => {
    const emptyConfigMap = {
      metadata: { name: 'test-plan-scripts', namespace: 'test-ns' },
    } as unknown as IoK8sApiCoreV1ConfigMap;

    await saveCustomScripts({ configMap: emptyConfigMap, plan: mockPlan, scripts: mockScripts });

    expect(mockK8sPatch).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ op: 'add' })],
        resource: emptyConfigMap,
      }),
    );
  });
});
