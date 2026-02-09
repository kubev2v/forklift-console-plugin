import { t } from '@utils/i18n';

export const EMPTY_MSG = '-';

export const Namespace = {
  AllProjects: '#ALL_NS#',
  Default: 'default',
  KonveyorForklift: 'konveyor-forklift',
  OpenshiftMtv: 'openshift-mtv',
};

export const SYSTEM_NAMESPACES_PREFIX = ['kube-', 'openshift-', 'kubernetes-'];
export const SYSTEM_NAMESPACES = ['default', 'openshift'];

export const ALL_PROJECTS_KEY = '#ALL_NS#';

export enum ServerBranding {
  Okd = 'okd',
}

export const taskStatuses = {
  completed: 'Completed',
  error: 'Error',
  failed: 'Failed',
  pending: 'Pending',
};

export const PHASES = {
  COMPLETE: 'Complete',
  FAILED: 'Failed',
};

export const CONDITION_STATUS = {
  FALSE: 'False',
  TRUE: 'True',
};

export const CATEGORY_TYPES = {
  CANCELED: 'Canceled',
  CONNECTION_FAILED: 'ConnectionFailed',
  CRITERIA_MET: 'SuccessCriteriaMet',
  CRITICAL: 'Critical',
  EXECUTING: 'Executing',
  FAILED: 'Failed',
  NOT_READY: 'Not Ready',
  READY: 'Ready',
  STAGING: 'Staging',
  SUCCEEDED: 'Succeeded',
  VALIDATION_FAILED: 'ValidationFailed',
  WARNING: 'Warn',
};

export const MAP_STATUS: Record<string, string> = {
  [CATEGORY_TYPES.CRITICAL]: CATEGORY_TYPES.CRITICAL,
  [CATEGORY_TYPES.NOT_READY]: CATEGORY_TYPES.NOT_READY,
  [CATEGORY_TYPES.READY]: CATEGORY_TYPES.READY,
};

export const MODEL_KIND = {
  NETWORK_MAP: 'NetworkMap',
  PLAN: 'Plan',
  PROVIDER: 'Provider',
  STORAGE_MAP: 'StorageMap',
};

export const FEATURE_NAMES = {
  COPY_OFFLOAD: 'feature_copy_offload',
  OCP_LIVE_MIGRATION: 'feature_ocp_live_migration',
  VOLUME_POPULATOR: 'feature_volume_populator',
} as const;

/**
 * Default values for feature flags when not specified in the ForkliftController CR.
 * If a feature is not in this list, it defaults to false.
 */
export const FEATURE_FLAG_DEFAULTS: Record<string, boolean> = {
  [FEATURE_NAMES.COPY_OFFLOAD]: true,
};

export const DEFAULT_NETWORK = t('Default network');

export const TIPS_AND_TRICKS_LABEL = t('Tips and tricks');

export const POD = 'pod';
export const MULTUS = 'multus';
export const IGNORED = 'ignored';

export const CREATE_VDDK_HELP_LINK =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html-single/planning_your_migration_to_red_hat_openshift_virtualization/index#creating-vddk-image_mtv';

export const STORAGE_NAMES = {
  GLANCE: 'glance',
};
