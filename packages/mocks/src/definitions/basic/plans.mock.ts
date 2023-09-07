/* eslint-disable @cspell/spellchecker */
import {
  PlanModelGroupVersionKind as gvk,
  V1beta1Plan,
  V1beta1PlanStatusMigrationVms,
} from '@kubev2v/types';

import {
  EPOCH,
  getObjectRef,
  nameAndNamespace,
  NAMESPACE_FORKLIFT,
  NAMESPACE_MIGRATION,
  toId,
} from '../utils';

import { hook1 } from './hooks.mock';
import { MOCK_STORAGE_MAPPINGS, networkMapping1, networkMapping2 } from './mappings.mock';
import { MOCK_OPENSHIFT_NAMESPACES } from './namespaces.mock';
import {
  OPENSHIFT_01_UID,
  openshiftProvider1,
  openshiftProviderHost,
  vmwareProvider1,
  vmwareProvider3,
} from './providers.mock';

const vsphereOneToOpenshiftOne = {
  provider: {
    source: getObjectRef(vmwareProvider1.object),
    destination: getObjectRef(openshiftProvider1.object),
  },
  targetNamespace: MOCK_OPENSHIFT_NAMESPACES[OPENSHIFT_01_UID][0].name,
  transferNetwork: null,
  map: {
    network: nameAndNamespace(networkMapping1.metadata),
    storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
  },
  archived: false,
  warm: false,
};

const vm1 = {
  id: 'vm-1630', // test-migration
};

const vm2 = {
  id: 'vm-2844', // test-migration-2
};

const vm3 = {
  id: 'vm-1008', // test-migration-centos
};

const vm4 = {
  // id: 'vm-2685'
  name: 'pemcg-discovery01',
};

const vm5 = {
  // id: 'vm-2686'
  name: 'pemcg-discovery02',
};

const vmStatus1: V1beta1PlanStatusMigrationVms = {
  id: vm1.id,
  name: 'test-migration',
  pipeline: [
    {
      name: 'DiskTransfer',
      description: 'Transfer disks.',
      progress: { total: 1024 * 64, completed: 1024 * 30 + 421 },
      phase: 'Mock Step Phase',
      annotations: { unit: 'MB' },
      started: EPOCH.plus({ minutes: 10 }).toISO(),
      completed: EPOCH.plus({ minutes: 20 }).toISO(),
    },
    {
      name: 'ImageConversion',
      description: 'Convert image to kubevirt.',
      progress: { total: 2, completed: 0 },
      phase: 'Mock Step Phase',
      started: EPOCH.plus({ minutes: 30 }).toISO(),
    },
  ],
  phase: 'Mock VM Phase',
  started: EPOCH.toISO(),
};

const vmStatus2: V1beta1PlanStatusMigrationVms = {
  id: vm2.id,
  name: 'test-migration-2',
  pipeline: [
    {
      name: 'DiskTransfer',
      description: 'Transfer disks.',
      progress: { total: 1024 * 64, completed: 1024 * 64 },
      phase: 'Mock Step Phase',
      annotations: { unit: 'MB' },
      started: EPOCH.plus({ minutes: 10 }).toISO(),
      completed: EPOCH.plus({ minutes: 20 }).toISO(),
    },
    {
      name: 'ImageConversion',
      description: 'Convert image to kubevirt.',
      progress: { total: 1, completed: 0 },
      phase: 'Pending',
      reason: 'AwaitingVDDK',
    },
  ],
  phase: 'Mock VM Phase',
  started: EPOCH.toISO(),
};

const vmStatus3: V1beta1PlanStatusMigrationVms = {
  id: vm3.id,
  name: 'test-migration-centos',
  pipeline: [
    {
      name: 'DiskTransfer',
      description: 'Transfer disks.',
      progress: { total: 1024 * 64, completed: 1024 * 64 },
      phase: 'Mock Step Phase',
      annotations: { unit: 'MB' },
      started: EPOCH.plus({ minutes: 10 }).toISO(),
      completed: EPOCH.plus({ minutes: 20 }).toISO(),
    },
    {
      name: 'ImageConversion',
      description: 'Convert image to kubevirt.',
      progress: { total: 3, completed: 3 },
      phase: 'Mock Step Phase',
      started: EPOCH.plus({ minutes: 30 }).toISO(),
      completed: EPOCH.plus({ minutes: 40 }).toISO(),
    },
  ],
  phase: 'Mock VM Phase',
  started: EPOCH.toISO(),
  completed: EPOCH.plus({ minutes: 50 }).toISO(),
  conditions: [
    {
      category: 'Advisory',
      durable: true,
      lastTransitionTime: EPOCH.plus({ minutes: 50 }),
      message: 'The VM migration has SUCCEEDED.',
      status: 'True',
      type: 'Succeeded',
    },
  ],
};

const vmStatus5: V1beta1PlanStatusMigrationVms = {
  id: 'vm-2686',
  name: vm5.name,
  pipeline: [
    {
      name: 'DiskTransfer',
      description: 'Transfer disks.',
      progress: { total: 1024 * 64, completed: 1024 * 64 },
      phase: 'Mock Step Phase',
      annotations: { unit: 'MB' },
      started: EPOCH.plus({ minutes: 10 }).toISO(),
      completed: EPOCH.plus({ minutes: 20 }).toISO(),
    },
    {
      name: 'ImageConversion',
      description: 'Convert image to kubevirt.',
      progress: { total: 3, completed: 1 },
      phase: 'Mock Step Phase',
      started: EPOCH.plus({ minutes: 30 }).toISO(),
      error: {
        phase: 'ImportCreated',
        reasons: [
          'Failed to initialize the source provider (Failed to connect to source provider): Post https://172.31.2.12/sdk: context deadline exceeded',
        ],
      },
    },
  ],
  phase: 'Mock VM Phase',
  started: EPOCH.toISO(),
  completed: '',
  error: {
    phase: 'ImageConversion',
    reasons: [
      'Failed to initialize the source provider (Failed to connect to source provider): Post https://172.31.2.12/sdk: context deadline exceeded',
    ],
  },
};

const vmStatusWithTopLevelError: V1beta1PlanStatusMigrationVms = {
  id: vm2.id,
  name: 'test-with-error',
  pipeline: [
    {
      name: 'DiskTransfer',
      description: 'Transfer disks.',
      progress: { total: 1024 * 64, completed: 0 },
      annotations: { unit: 'MB' },
      started: EPOCH.plus({ minutes: 10 }).toISO(),
    },
    {
      name: 'ImageConversion',
      description: 'Convert image to kubevirt.',
      progress: { total: 1, completed: 0 },
      phase: 'Mock Step Phase',
    },
  ],
  phase: 'Mock VM Phase',
  started: EPOCH.toISO(),
  completed: EPOCH.plus({ minutes: 20 }).toISO(),
  error: { phase: 'ImportCreated', reasons: ['Import CR not found.'] },
};

const PLAN_01_UID = 'plan-01-uid';
export const plan1: V1beta1Plan = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Plan',
  metadata: {
    name: 'plantest-01',
    namespace: NAMESPACE_MIGRATION,
    selfLink: `apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_MIGRATION}/plans/plantest-01`,
    uid: PLAN_01_UID,
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    description: 'my first plan',
    ...vsphereOneToOpenshiftOne,
    vms: [vm1, vm2],
  },
  status: {
    conditions: [
      {
        category: 'Critical',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The destination provider is not valid.',
        reason: 'TypeNotValid',
        status: 'True',
        type: 'DestinationProviderNotValid',
      },
      {
        category: 'Critical',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Source network not valid.',
        reason: 'NotFound',
        status: 'True',
        type: 'SourceNetworkNotValid',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'In progress',
        reason: 'Valid',
        status: 'True',
        type: 'Executing',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      vms: [vmStatus1, vmStatus2],
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            generation: 1,
            uid: 'uid-0-0',
            name: 'plantest-01-mock-migration',
            namespace: NAMESPACE_MIGRATION,
          },
          plan: {
            generation: 1,
            uid: PLAN_01_UID,
            name: 'plantest-01',
            namespace: NAMESPACE_MIGRATION,
          },
          provider: {
            source: toId(vmwareProvider1),
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_02_UID = 'plan-02-uid';
export const plan2: V1beta1Plan = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Plan',
  metadata: {
    name: 'plantest-02',
    namespace: NAMESPACE_MIGRATION,
    selfLink: `apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_MIGRATION}/plans/plantest-02`,
    uid: PLAN_02_UID,
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    description: 'my 2nd plan',
    ...vsphereOneToOpenshiftOne,
    transferNetwork: {
      name: 'ocp-network-2',
      namespace: vsphereOneToOpenshiftOne.targetNamespace,
    },
    vms: [
      {
        ...vm1,
        hooks: [
          {
            hook: nameAndNamespace(hook1.metadata),
            step: 'PreHook',
          },
          {
            hook: nameAndNamespace(hook1.metadata),
            step: 'PostHook',
          },
        ],
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
  },
};

const vmStatus1WithCancel: V1beta1PlanStatusMigrationVms = {
  ...vmStatus1,
  pipeline: [
    vmStatus1.pipeline[0],
    { ...vmStatus1.pipeline[1], completed: EPOCH.plus({ minutes: 40 }).toISO() },
  ],
  conditions: [
    {
      type: 'Canceled',
      category: 'Information',
      status: 'True',
      message: 'Canceled by user',
      lastTransitionTime: EPOCH.plus({ minutes: 40 }).toISO(),
    },
  ],
};

const PLAN_03_UID = 'plan-03-uid';
export const plan3: V1beta1Plan = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Plan',
  metadata: {
    name: 'plantest-03',
    namespace: NAMESPACE_MIGRATION,
    selfLink: `apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_MIGRATION}/plans/plantest-03`,
    uid: PLAN_03_UID,
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    description: 'my 3rd plan',
    ...vsphereOneToOpenshiftOne,
    vms: [vm1, vm2, vm3, vm5],
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Failed',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      vms: [vmStatus1WithCancel, vmStatusWithTopLevelError, vmStatus3, vmStatus5],
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            name: 'plantest-03-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-3-0',
          },
          plan: {
            name: 'plantest-03',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_03_UID,
          },
          provider: {
            source: undefined,
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_04_UID = 'plan-04-uid';
export const plan4: V1beta1Plan = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Plan',
  metadata: {
    name: 'plantest-04',
    namespace: NAMESPACE_MIGRATION,
    selfLink: `apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_MIGRATION}/plans/plantest-04`,
    uid: PLAN_04_UID,
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    description: 'my 4th plan',
    ...vsphereOneToOpenshiftOne,
    vms: [vm3],
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Succeeded',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      completed: EPOCH.plus({ minutes: 50 }).toISO(),
      vms: [vmStatus3],
      history: [
        {
          conditions: [
            {
              type: 'Succeeded',
              status: 'True',
              category: 'Advisory',
              lastTransitionTime: EPOCH.plus({ minutes: 50 }).toISO(),
              message: 'The plan execution has SUCCEEDED.',
              durable: true,
            },
          ],
          map: {},
          migration: {
            name: 'plantest-04-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-4-0',
          },
          plan: {
            name: 'plantest-04',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_04_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const vmStatus1WithError: V1beta1PlanStatusMigrationVms = {
  ...vmStatus1,
  pipeline: [
    {
      ...vmStatus1.pipeline[0],
      error: {
        phase: 'DiskTransferFailed',
        reasons: ['Could not transfer disks'],
      },
    },
    { ...vmStatus1.pipeline[1], started: undefined },
  ],
  error: {
    phase: 'DiskTransfer',
    reasons: ['Could not transfer disks'],
  },
};

const vmStatus2WithError: V1beta1PlanStatusMigrationVms = {
  ...vmStatus1,
  pipeline: [
    vmStatus1.pipeline[0],
    {
      ...vmStatus1.pipeline[1],
      completed: EPOCH.toISO(),
      error: {
        phase: 'ImageConversionFailed',
        reasons: ['Could not convert image'],
      },
    },
  ],
  error: {
    phase: 'ImageConversion',
    reasons: ['Could not convert image'],
  },
};

const PLAN_05_UID = 'plan-05-uid';
export const plan5: V1beta1Plan = {
  ...plan1,
  metadata: { ...plan1.metadata, name: 'plantest-05', uid: PLAN_05_UID },
  spec: {
    ...plan1.spec,
    description: 'completed with errors',
    archived: true,
  },
  status: {
    conditions: [
      {
        category: 'Advisory',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The migration plan has been archived.',
        reason: 'UserRequested',
        status: 'True',
        type: 'Archived',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Failed',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      vms: [vmStatus1WithError, vmStatus2WithError],
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            name: 'plantest-05-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-5-0',
          },
          plan: {
            name: 'plantest-05',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_05_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_06_UID = 'plan-06-uid';
export const plan6: V1beta1Plan = {
  apiVersion: `${gvk.group}/${gvk.version}`,
  kind: 'Plan',
  metadata: {
    name: 'plantest-06',
    namespace: NAMESPACE_FORKLIFT,
    selfLink: `apis/${gvk.group}/${gvk.version}/namespaces/${NAMESPACE_FORKLIFT}/plans/plantest-06`,
    uid: PLAN_06_UID,
    creationTimestamp: EPOCH.toISO(),
  },
  spec: {
    description: 'newly created warm plan',
    provider: {
      source: getObjectRef(vmwareProvider3.object),
      destination: getObjectRef(openshiftProviderHost.object),
    },
    targetNamespace: NAMESPACE_FORKLIFT,
    transferNetwork: null,
    archived: false,
    map: {
      network: nameAndNamespace(networkMapping2.metadata),
      storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
    },
    vms: [vm4],
    warm: true,
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
  },
};

const warmVmPrecopying: V1beta1PlanStatusMigrationVms = {
  ...vmStatus1,
  pipeline: vmStatus1.pipeline.map((step) => {
    // Remove started/completed/progress
    const { name, description, phase, annotations } = step;
    return {
      name,
      description,
      progress: { ...step.progress, completed: 0 },
      phase,
      annotations,
    };
  }),
  warm: {
    consecutiveFailures: 0,
    failures: 0,
    precopies: [
      {
        start: EPOCH.toISO(),
      },
    ],
    successes: 0,
  },
};

const warmVmCanceled: V1beta1PlanStatusMigrationVms = {
  ...warmVmPrecopying,
  completed: EPOCH.toISO(),
  conditions: [
    {
      type: 'Canceled',
      category: 'Information',
      status: 'True',
      message: 'Canceled by user',
      lastTransitionTime: EPOCH.toISO(),
    },
  ],
  warm: {
    consecutiveFailures: 0,
    failures: 0,
    precopies: [
      {
        start: EPOCH.toISO(),
      },
    ],
    successes: 0,
  },
};

const warmVmWithConsecutiveFailures: V1beta1PlanStatusMigrationVms = {
  ...vmStatus2,
  pipeline: warmVmPrecopying.pipeline,
  warm: {
    consecutiveFailures: 2,
    failures: 0,
    precopies: [
      {
        start: EPOCH.plus({ minutes: 10 }).toISO(),
        end: EPOCH.plus({ minutes: 20 }).toISO(),
      },
      {
        start: EPOCH.plus({ minutes: 30 }).toISO(),
        end: EPOCH.plus({ minutes: 40 }).toISO(),
      },
      {
        start: EPOCH.plus({ minutes: 50 }).toISO(),
      },
    ],
    successes: 0,
  },
};

const warmVmPrecopyingWithError: V1beta1PlanStatusMigrationVms = {
  ...warmVmPrecopying,
  completed: EPOCH.plus({ minutes: 10 }).toISO(),
  error: { phase: 'Mock Error', reasons: ['Something went wrong with a precopy?'] },
};

const warmVmIdle: V1beta1PlanStatusMigrationVms = {
  ...vmStatus3,
  completed: undefined,
  pipeline: warmVmPrecopying.pipeline,
  warm: {
    consecutiveFailures: 0,
    failures: 0,
    nextPrecopyAt: EPOCH.plus({ minutes: 70 }).toISO(),
    precopies: [
      {
        start: EPOCH.plus({ minutes: 10 }).toISO(),
        end: EPOCH.plus({ minutes: 20 }).toISO(),
      },
      {
        start: EPOCH.plus({ minutes: 30 }).toISO(),
        end: EPOCH.plus({ minutes: 40 }).toISO(),
      },
      {
        start: EPOCH.plus({ minutes: 50 }).toISO(),
        end: EPOCH.plus({ minutes: 60 }).toISO(),
      },
    ],
    successes: 3,
  },
};

const warmVmCuttingOver1: V1beta1PlanStatusMigrationVms = {
  ...vmStatus1,
  warm: warmVmIdle.warm,
};

const warmVmCuttingOver2: V1beta1PlanStatusMigrationVms = {
  ...vmStatus2,
  warm: warmVmIdle.warm,
};

const warmVmCuttingOver3: V1beta1PlanStatusMigrationVms = {
  ...vmStatus3,
  warm: warmVmIdle.warm,
};

const PLAN_07_UID = 'plan-07-uid';
export const plan7: V1beta1Plan = {
  ...plan1,
  metadata: { ...plan1.metadata, name: 'plantest-07', uid: PLAN_07_UID },
  spec: {
    ...plan1.spec,
    description: 'various precopy states',
    warm: true,
    vms: [vm1, vm2, vm3],
    archived: false,
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'In progress',
        reason: 'Valid',
        status: 'True',
        type: 'Executing',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      vms: [warmVmCanceled, warmVmWithConsecutiveFailures, warmVmIdle],
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            name: 'plantest-07-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-7-0',
          },
          plan: {
            name: 'plantest-07',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_07_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_08_UID = 'plan-08-uid';
export const plan8: V1beta1Plan = {
  ...plan7,
  metadata: { ...plan1.metadata, name: 'plantest-08', uid: PLAN_08_UID },
  spec: {
    ...plan7.spec,
    description: 'cutover scheduled',
    archived: false,
  },
  status: {
    conditions: plan7.status?.conditions.filter((condition) => condition.type !== 'Archived') || [],
    migration: {
      started: EPOCH.toISO(),
      vms: plan7.status?.migration?.vms,
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            name: 'plantest-08-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-8-0',
          },
          plan: {
            name: 'plantest-08',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_08_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_09_UID = 'plan-09-uid';
export const plan9: V1beta1Plan = {
  ...plan1,
  metadata: { ...plan1.metadata, name: 'plantest-09', uid: PLAN_09_UID },
  spec: { ...plan7.spec, description: 'cutover started', vms: [vm1, vm2, vm3], archived: false },
  status: {
    conditions: plan7.status?.conditions.filter((condition) => condition.type !== 'Archived') || [],
    migration: {
      started: EPOCH.toISO(),
      vms: [warmVmCuttingOver1, warmVmCuttingOver2, warmVmCuttingOver3],
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            name: 'plantest-09-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-9-0',
          },
          plan: {
            name: 'plantest-09',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_09_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_10_UID = 'plan-10-uid';
export const plan10: V1beta1Plan = {
  ...plan1,
  metadata: {
    ...plan1.metadata,
    name: 'plantest-10',
    uid: PLAN_10_UID,
  },
  spec: { ...plan7.spec, description: 'failed before cutover', archived: false },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Failed',
      },
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      completed: EPOCH.plus({ minutes: 10 }).toISO(),
      vms: [warmVmPrecopyingWithError],
      history: [
        {
          conditions: [
            {
              type: 'Failed',
              status: 'True',
              category: 'Advisory',
              message: 'The plan execution has FAILED.',
              durable: true,
              lastTransitionTime: EPOCH.plus({ minutes: 10 }).toISO(),
            },
          ],
          map: {},
          migration: {
            name: 'plantest-10-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-10-0',
          },
          plan: {
            name: 'plantest-10',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_10_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

const PLAN_11_UID = 'plan-11-uid';
export const plan11: V1beta1Plan = {
  ...plan1,
  metadata: { ...plan1.metadata, name: 'plantest-11', uid: PLAN_11_UID },
  spec: { ...plan1.spec, description: 'finished with some canceled VMs' },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Ready for migration',
        reason: 'Valid',
        status: 'True',
        type: 'Ready',
      },
    ],
    migration: {
      started: EPOCH.toISO(),
      completed: EPOCH.plus({ minutes: 40 }).toISO(),
      vms: [vmStatus1WithCancel, vmStatus3],
      history: [
        {
          conditions: [],
          map: {},
          migration: {
            name: 'plantest-11-mock-migration',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: 'uid-11-0',
          },
          plan: {
            name: 'plantest-11',
            namespace: NAMESPACE_MIGRATION,
            generation: 1,
            uid: PLAN_11_UID,
          },
          provider: {
            destination: toId(openshiftProvider1),
          },
        },
      ],
    },
  },
};

export const MOCK_PLANS: V1beta1Plan[] = [
  plan1,
  plan2,
  plan3,
  plan4,
  plan5,
  plan6,
  plan7,
  plan8,
  plan9,
  plan10,
  plan11,
];
