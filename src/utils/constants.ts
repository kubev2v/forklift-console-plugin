export const EMPTY_MSG = '-';

export const Namespace = {
  AllProjects: '#ALL_NS#',
  Default: 'default',
  KonveyorForklift: 'konveyor-forklift',
  OpenshiftMtv: 'openshift-mtv',
};

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

export const CONDITION_STATUS = {
  FALSE: 'False',
  TRUE: 'True',
};

export const CATEGORY_TYPES = {
  CANCELED: 'Canceled',
  CRITICAL: 'Critical',
  EXECUTING: 'Executing',
  FAILED: 'Failed',
  READY: 'Ready',
  SUCCEEDED: 'Succeeded',
};

export const EMPTY_CELL_CONTENT = '-';

export const FEATURE_NAMES = {
  COPY_OFFLOAD: 'feature_copy_offload',
  VOLUME_POPULATOR: 'feature_volume_populator',
} as const;
