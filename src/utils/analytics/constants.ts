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

// Add new events here following the pattern:
// EVENT_NAME: 'event_name_in_snake_case'
export const TELEMETRY_EVENTS = {
  PLAN_CREATE_COMPLETED: 'plan_create_completed',
  PLAN_CREATE_FAILED: 'plan_create_failed',
  PLAN_CREATE_STARTED: 'plan_create_started',
} as const;
