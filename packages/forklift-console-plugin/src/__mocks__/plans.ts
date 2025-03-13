/* eslint-disable @cspell/spellchecker */
import { PlanData } from 'src/modules/Plans/utils';
import {
  PlanConditionCategory,
  PlanConditionType,
} from 'src/modules/Plans/utils/types/PlanCondition';

import { V1beta1Migration, V1beta1MigrationStatusVms } from '@kubev2v/types';

export const mockFailedVm: V1beta1MigrationStatusVms = {
  started: '2025-01-14T06:37:20Z',
  pipeline: [],
  error: {
    phase: 'CopyDisks',
    reasons: [
      'Unable to process data: Unable to transfer source data to scratch space: failed to pull image: unexpected EOF',
    ],
  },
  completed: '2025-01-14T08:38:41Z',
  name: 'winweb01',
  conditions: [
    {
      category: PlanConditionCategory.Advisory,
      durable: true,
      lastTransitionTime: '2025-01-14T08:38:38Z',
      message: 'The VM migration has FAILED.',
      status: 'True',
      type: PlanConditionType.Failed,
    },
  ],
  restorePowerState: 'On',
  id: '616e985a-170f-471b-b538-c39f8d848559',
  namespace: 'vmimported',
  phase: 'Completed',
};

export const mockSucceededVm: V1beta1MigrationStatusVms = {
  started: '2025-01-07T18:42:50Z',
  pipeline: [],
  completed: '2025-01-07T18:54:14Z',
  name: 'haproxy-cf5d4',
  luks: {},
  conditions: [
    {
      category: PlanConditionCategory.Advisory,
      durable: true,
      lastTransitionTime: '2025-01-07T18:54:14Z',
      message: 'The VM migration has SUCCEEDED.',
      status: 'True',
      type: PlanConditionType.Succeeded,
    },
  ],
  restorePowerState: 'Off',
  id: 'vm-146146',
  phase: 'Completed',
};

export const mockPlanData: PlanData = {
  obj: {
    kind: 'Plan',
    apiVersion: 'forklift.konveyor.io/v1beta1',
    metadata: {
      annotations: { populatorLabels: 'True' },
      creationTimestamp: '2025-01-14T15:29:38Z',
      generation: 2,
      managedFields: [],
      name: 'testing',
      namespace: 'openshift-mtv',
      resourceVersion: '20558300',
      uid: '342f3ad5-eac9-4f89-8f1e-a37bee91f16a',
    },
    spec: {
      map: {
        network: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'NetworkMap',
          name: 'vmware-wd2q7',
          namespace: 'openshift-mtv',
          uid: '2fe5e6cc-3a63-4034-8828-a7d38ac8f3c2',
        },
        storage: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'StorageMap',
          name: 'vmware-k2bmn',
          namespace: 'openshift-mtv',
          uid: '7cf7f014-7d5e-47a4-99a4-57c14fdceeb6',
        },
      },
      provider: {
        destination: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Provider',
          name: 'host',
          namespace: 'openshift-mtv',
          uid: 'adf42f04-b5dd-41a6-8626-642686c0145a',
        },
        source: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Provider',
          name: 'vmware',
          namespace: 'openshift-mtv',
          uid: 'a14fc19a-0332-4cf2-bd91-6ceb3a7e8f47',
        },
      },
      targetNamespace: 'openshift-mtv',
      vms: [{ id: 'vm-146147', name: 'database-cf5d4' }],
      warm: true,
    },
    status: {
      conditions: [
        {
          category: PlanConditionCategory.Critical,
          items: [" id:vm-146147 name:'database-cf5d4' "],
          lastTransitionTime: '2025-01-14T15:29:38Z',
          message: 'Target VM already exists.',
          reason: 'NotUnique',
          status: 'True',
          type: PlanConditionType.VMAlreadyExists,
        },
      ],
      migration: {},
      observedGeneration: 2,
    },
  },
  permissions: { canCreate: true, canPatch: true, canDelete: true, canGet: true, loading: false },
};

export const mockMigration: V1beta1Migration = {
  kind: 'Migration',
  apiVersion: 'forklift.konveyor.io/v1beta1',
  metadata: {
    generateName: 'test1-',
    resourceVersion: '28653414',
    name: 'test1-j5w4l',
    uid: '193b4e36-6b14-4a09-8675-6d587019a747',
    creationTimestamp: '2025-01-14T06:44:23Z',
    generation: 1,
    managedFields: [],
    namespace: 'openshift-mtv',
    ownerReferences: [],
  },
  spec: {
    plan: {
      name: 'test1',
      namespace: 'openshift-mtv',
      uid: 'fd4b5f8b-d28c-4b51-a663-c3e011bfb666',
    },
  },
  status: {
    conditions: [
      {
        category: PlanConditionCategory.Required,
        lastTransitionTime: '2025-01-14T06:44:23Z',
        message: 'The migration is ready.',
        status: 'True',
        type: PlanConditionType.Ready,
      },
      {
        category: PlanConditionCategory.Advisory,
        lastTransitionTime: '2025-01-14T06:44:23Z',
        message: 'The migration is RUNNING.',
        status: 'True',
        type: PlanConditionType.Running,
      },
    ],
    started: '2025-01-14T06:44:23Z',
    vms: [
      {
        id: '637c61c3-8501-405e-a35a-873520085a6b',
        luks: {},
        name: 'database',
        namespace: 'vmimported',
        phase: 'CopyDisks',
        pipeline: [
          {
            completed: '2025-01-14T06:44:47Z',
            description: 'Initialize migration.',
            name: 'Initialize',
            phase: 'Completed',
            progress: {
              completed: 0,
              total: 1,
            },
            started: '2025-01-14T06:44:23Z',
          },
          {
            annotations: {
              unit: 'MB',
            },
            description: 'Transfer disks.',
            name: 'DiskTransfer',
            phase: 'Running',
            progress: {
              completed: 0,
              total: 16384,
            },
            started: '2025-01-14T06:44:50Z',
            tasks: [
              {
                annotations: {
                  unit: 'MB',
                },
                name: 'vmimported/database',
                phase: 'Running',
                progress: {
                  completed: 0,
                  total: 16384,
                },
                reason:
                  'Error; Unable to connect to http data source: expected status code 200, got 404. Status: 404 Not Found',
                started: '2025-01-14T06:45:26Z',
              },
            ],
          },
          {
            description: 'Create VM.',
            name: 'VirtualMachineCreation',
            phase: 'Pending',
            progress: {
              completed: 0,
              total: 1,
            },
          },
        ],
        restorePowerState: 'On',
        started: '2025-01-14T06:44:23Z',
      },
    ],
  },
};
