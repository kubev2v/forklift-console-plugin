// Shared constants for resource management
export const MTV_NAMESPACE = 'openshift-mtv';

export const RESOURCE_KINDS = {
  FORKLIFT_CONTROLLER: 'ForkliftController',
  MIGRATION: 'Migration',
  NETWORK_MAP: 'NetworkMap',
  NETWORK_ATTACHMENT_DEFINITION: 'NetworkAttachmentDefinition',
  PLAN: 'Plan',
  PROVIDER: 'Provider',
  STORAGE_MAP: 'StorageMap',
  VIRTUAL_MACHINE: 'VirtualMachine',
  PROJECT: 'Project',
  NAMESPACE: 'Namespace',
} as const;

export const RESOURCE_TYPES = {
  FORKLIFT_CONTROLLERS: 'forkliftcontrollers',
  MIGRATIONS: 'migrations',
  NETWORK_MAPS: 'networkmaps',
  NETWORK_ATTACHMENT_DEFINITIONS: 'network-attachment-definitions',
  PLANS: 'plans',
  PROVIDERS: 'providers',
  STORAGE_MAPS: 'storagemaps',
  VIRTUAL_MACHINES: 'virtualmachines',
  PROJECTS: 'projects',
  NAMESPACES: 'namespaces',
} as const;

export const OPENSHIFT_PROJECT_KIND = 'Project';
export const OPENSHIFT_PROJECT_API_VERSION = 'project.openshift.io/v1';
export const NAMESPACE_KIND = 'Namespace';
export const NAMESPACE_API_VERSION = 'v1';

export const FORKLIFT_API_VERSION = 'forklift.konveyor.io/v1beta1';
export const KUBEVIRT_API_VERSION = 'kubevirt.io/v1';
export const NAD_API_VERSION = 'k8s.cni.cncf.io/v1';

export const RESOURCES_FILE = 'playwright/.resources.json';

// API paths and endpoints
export const API_PATHS = {
  KUBERNETES_BASE: '/api/kubernetes',
  KUBEVIRT: '/api/kubernetes/apis/kubevirt.io/v1',
  OPENSHIFT_PROJECT: '/api/kubernetes/apis/project.openshift.io/v1',
  KUBERNETES_CORE: '/api/kubernetes/api/v1',
  FORKLIFT: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1',
  NAD: '/api/kubernetes/apis/k8s.cni.cncf.io/v1',
} as const;

// HTTP headers and other constants
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
  CSRF_TOKEN: 'X-CSRFToken',
} as const;

export const COOKIE_NAMES = {
  CSRF_TOKEN: 'csrf-token',
} as const;
