import type { ProviderType } from '@kubev2v/types';

export { type ProviderType };

export const ConfigMapModel = {
  abbr: 'CM',
  apiGroup: '',
  apiVersion: 'v1',
  kind: 'ConfigMap',
  label: 'ConfigMap',
  labelPlural: 'ConfigMaps',
  plural: 'configmaps',
};

export const ConsoleConfigMap = {
  ConfigKey: 'console-config.yaml',
  Name: 'console-config',
  Namespace: 'openshift-console',
} as const;

export enum TelemetryConfigField {
  ClusterId = 'CLUSTER_ID',
  SegmentPublicApiKey = 'SEGMENT_PUBLIC_API_KEY',
  DevSegmentApiKey = 'DEV_SEGMENT_API_KEY',
}

export const SEGMENT_SNIPPET_VERSION = '5.2.0';

export const SEGMENT_METHODS = [
  'trackSubmit',
  'trackClick',
  'trackLink',
  'trackForm',
  'pageview',
  'identify',
  'reset',
  'group',
  'track',
  'ready',
  'alias',
  'debug',
  'page',
  'screen',
  'once',
  'off',
  'on',
  'addSourceMiddleware',
  'addIntegrationMiddleware',
  'setAnonymousId',
  'addDestinationMiddleware',
  'register',
] as const;

export enum CreationMethod {
  Form = 'form',
  YamlEditor = 'yaml-editor',
  PlanWizard = 'plan-wizard',
}

export enum ProviderCreateSource {
  ProvidersPage = 'providers-page',
  PlanWizard = 'plan-wizard',
}

export enum TipsTopicSourceComponent {
  TipsTopicSelect = 'selectDropdownOption',
  TipsTopicCard = 'selectCard',
}

export enum TipsTopic {
  MigratingVMs = 'migratingVirtualMachines',
  MigrationTypes = 'choosingMigrationType',
  Troubleshooting = 'troubleshooting',
  KeyTerminology = 'terminology',
}

// Add new events here following the pattern:
// EVENT_NAME: 'Event name' (MTV prefix is automatically added)
export const TELEMETRY_EVENTS = {
  MIGRATION_CUTOVER_SCHEDULED: 'Migration cutover scheduled',
  MIGRATION_STARTED: 'Migration started',
  NETWORK_MAP_CREATE_COMPLETED: 'Network map created',
  NETWORK_MAP_CREATE_FAILED: 'Network map create failed',
  NETWORK_MAP_CREATE_STARTED: 'Network map create started',
  OVERVIEW_TAB_CLICKED: 'Overview tab clicked',
  OVERVIEW_WELCOME_PROVIDER_CLICKED: 'Overview welcome provider clicked',
  PLAN_CREATE_BUTTON_CLICKED: 'Plan create button clicked',
  PLAN_CREATE_COMPLETED: 'Plan created',
  PLAN_CREATE_FAILED: 'Plan create failed',
  PLAN_CREATE_FROM_OVERVIEW_CLICKED: 'Plan create from overview clicked',
  PLAN_CREATE_FROM_PROVIDER_CLICKED: 'Plan create from provider clicked',
  PLAN_CREATE_STARTED: 'Plan create started',
  PLAN_WIZARD_STEP_VISITED: 'Plan wizard step visited',
  PROVIDER_CREATE_CLICKED: 'Provider create clicked',
  PROVIDER_CREATE_COMPLETED: 'Provider created',
  PROVIDER_CREATE_FAILED: 'Provider create failed',
  PROVIDER_CREATE_STARTED: 'Provider create started',
  STORAGE_MAP_CREATE_COMPLETED: 'Storage map created',
  STORAGE_MAP_CREATE_FAILED: 'Storage map create failed',
  STORAGE_MAP_CREATE_STARTED: 'Storage map create started',
  TIPS_AND_TRICKS_CLICKED: 'Tips and tricks clicked',
  TIPS_AND_TRICKS_VISITED: 'Tips and tricks visited',
} as const;
