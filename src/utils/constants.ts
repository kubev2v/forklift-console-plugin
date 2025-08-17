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
  CRITERIA_MET: 'SuccessCriteriaMet',
  CRITICAL: 'Critical',
  EXECUTING: 'Executing',
  FAILED: 'Failed',
  READY: 'Ready',
  SUCCEEDED: 'Succeeded',
};

export const FEATURE_NAMES = {
  COPY_OFFLOAD: 'feature_copy_offload',
  OCP_LIVE_MIGRATION: 'feature_ocp_live_migration',
  VOLUME_POPULATOR: 'feature_volume_populator',
} as const;

export const POD_NETWORK = t('Pod network');
