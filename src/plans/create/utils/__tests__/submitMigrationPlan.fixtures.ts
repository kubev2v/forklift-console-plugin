import {
  AapFormFieldId,
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
  MigrationHookFieldId,
} from '../../steps/migration-hooks/constants';
import { MigrationTypeValue } from '../../steps/migration-type/constants';
import type { CreatePlanFormData } from '../../types';

const disabledHook = { [MigrationHookFieldId.EnableHook]: false };
const enabledHook = {
  [MigrationHookFieldId.AnsiblePlaybook]: '---\n',
  [MigrationHookFieldId.EnableHook]: true,
  [MigrationHookFieldId.HookRunnerImage]: 'quay.io/hook',
};

export const baseFormData = {
  [AapFormFieldId.AapPostHookJobTemplateId]: undefined,
  [AapFormFieldId.AapPreHookJobTemplateId]: undefined,
  [AapFormFieldId.HookSource]: HOOK_SOURCE_NONE,
  instanceTypes: {},
  migrateSharedDisks: true,
  migrationType: MigrationTypeValue.Cold,
  nbdeClevis: false,
  planDescription: 'desc',
  planName: 'plan-a',
  planProject: 'plan-ns',
  postMigrationHook: disabledHook,
  preMigrationHook: disabledHook,
  preserveStaticIps: true,
  rootDevice: '',
  sourceProvider: {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: { name: 'src' },
    spec: { type: 'vsphere' },
  },
  targetPowerState: { label: 'on', value: 'on' },
  targetProject: 'tgt-ns',
  targetProvider: {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: { name: 'tgt' },
    spec: { type: 'openshift' },
  },
  transferNetwork: undefined,
  vms: { vm1: { id: 'vm-1', name: 'vm-one' } },
} as unknown as CreatePlanFormData;

export const localHooksFormData = {
  ...baseFormData,
  [AapFormFieldId.HookSource]: HOOK_SOURCE_LOCAL,
  postMigrationHook: enabledHook,
  preMigrationHook: enabledHook,
} as unknown as CreatePlanFormData;

export const aapHooksFormData = {
  ...baseFormData,
  [AapFormFieldId.AapPostHookJobTemplateId]: 22,
  [AapFormFieldId.AapPreHookJobTemplateId]: 11,
  [AapFormFieldId.HookSource]: HOOK_SOURCE_AAP,
} as unknown as CreatePlanFormData;

export const mockNetworkMap = { metadata: { name: 'net-map' } };
export const mockStorageMap = { metadata: { name: 'storage-map' } };
export const mockPlanRef = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  name: 'plan-a',
  namespace: 'plan-ns',
};
export const mockCreatedHooks = {
  postHook: { metadata: { name: 'plan-a-post-hook' } },
  preHook: { metadata: { name: 'plan-a-pre-hook' } },
};
