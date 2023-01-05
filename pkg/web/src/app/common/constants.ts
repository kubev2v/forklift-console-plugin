import * as yup from 'yup';
import { BrandType, IEnvVars } from './types';

/**
 * Collect and expose the various webpack `EnvironmentPlugin` values to the app.  Since
 * the webpack plugin does straight simple string replace, the values need to be full
 * identifiers.  Default values aren't needed since the default values are given in
 * `EnvironmentPlugin`'s definition in __webpack.config.js__.
 */
export const ENV: IEnvVars = {
  DATA_SOURCE: process.env.DATA_SOURCE,
  BRAND_TYPE: process.env.BRAND_TYPE as BrandType,
  NAMESPACE: process.env.NAMESPACE,
  NODE_ENV: process.env.NODE_ENV,
  PLUGIN_NAME: process.env.PLUGIN_NAME,
};

if (ENV.NODE_ENV === 'development') {
  console.info('forklift-console-plugin ENV:', JSON.stringify(ENV));
}

export const APP_BRAND: BrandType = (process.env.BRAND_TYPE as BrandType) || BrandType.Konveyor;

export const APP_TITLE =
  ENV.BRAND_TYPE === 'RedHat' ? 'Migration Toolkit for Virtualization' : 'Forklift';

export const CLUSTER_API_VERSION = 'forklift.konveyor.io/v1beta1';

export const CLOUD_MA_LINK = {
  href: 'https://cloud.redhat.com/migrations/migration-analytics',
  label: 'cloud.redhat.com',
};

export const PRODUCT_DOCO_LINK = {
  href: 'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/',
  label: 'product documentation',
};

export const PROVIDER_TYPES = ['vsphere', 'ovirt', 'openshift'] as const;
export type ProviderType = typeof PROVIDER_TYPES[number];
export const SOURCE_PROVIDER_TYPES: ProviderType[] = ['vsphere', 'ovirt'];
export const TARGET_PROVIDER_TYPES: ProviderType[] = ['openshift'];

export const PROVIDER_TYPE_NAMES: Record<ProviderType, string> = {
  vsphere: 'VMware',
  ovirt: ENV.BRAND_TYPE === 'RedHat' ? 'Red Hat Virtualization' : 'oVirt',
  openshift: ENV.BRAND_TYPE === 'RedHat' ? 'OpenShift Virtualization' : 'KubeVirt',
};

export enum StatusCategoryType {
  Required = 'Required',
  Critical = 'Critical',
  Error = 'Error',
  Advisory = 'Advisory',
  Warn = 'Warn',
}

export type ConditionType =
  | 'Ready'
  | 'Executing'
  | 'Succeeded'
  | 'Failed'
  | 'Canceled'
  | 'Archived';

export type ColdPlanState = Exclude<
  PlanState,
  'Copying' | 'Copying-CutoverScheduled' | 'Copying-Failed' | 'Copying-Canceled' | 'StartingCutover'
>;

export type PlanState =
  | 'NotStarted-Ready' // Just created, no action taken yet
  | 'NotStarted-NotReady' // Not ready for migration, likely a critical condition was encountered
  | 'Starting' // User clicked start button, Migration CR exists but no status data exists yet
  | 'Copying' // Warm-specific. "Running incremental copies" in the UI, the first stage of a warm migration
  | 'Copying-CutoverScheduled' // Warm-specific. Copying, but a future cutover time is set.
  | 'Copying-Failed' // Warm-specific. Plan failed during copying
  | 'Copying-Canceled' // Warm-specific. Plan was canceled during copying
  | 'StartingCutover' // Warm-specific. User has clicked the cutover button but the first pipeline step doesn't have a start time yet
  | 'PipelineRunning' // The migration pipeline is running.
  | 'Canceled'
  | 'Finished-Succeeded' // Has a completed timestamp
  | 'Finished-Failed'
  | 'Finished-Incomplete'
  | 'Archived'
  | 'Archiving'
  | 'Unknown'; // No status data is available and the plan is over 30 seconds old (to give the controller time to catch up)

export enum StepType {
  Full = 'Full',
  Half = 'Half',
  Empty = 'Empty',
  Canceled = 'Canceled',
}

export const dnsLabelNameSchema = yup
  .string()
  .max(63)
  .matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: ({ label }) =>
      `${label} can only contain lowercase alphanumeric characters and dashes (-), and must start and end with an alphanumeric character`,
    excludeEmptyString: true,
  });

export const urlSchema = yup.string().test('is-valid-url', 'Must be a valid URL', (value) => {
  try {
    new URL(value as string);
  } catch (_) {
    return false;
  }
  return true;
});

// https://www.regexpal.com/?fam=104038
const ipAddressRegex =
  /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
// https://www.regextester.com/103452
const subdomainRegex = /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/;

export const hostnameSchema = yup
  .string()
  .max(253)
  .required()
  .test(
    'valid-ip-or-hostname',
    ({ label }) => `${label} must be a valid IPv4 or IPv6 address or a valid DNS subdomain`,
    (value: string | null | undefined) => {
      if (!value) return false;
      const isValidIp = !!value.match(ipAddressRegex);
      const isValidSubdomain = !!value.match(subdomainRegex);
      return isValidIp || isValidSubdomain;
    }
  );

export const fingerprintSchema = yup
  .string()
  .label('SHA-1 fingerprint')
  .matches(/^[a-fA-F0-9]{2}((:[a-fA-F0-9]{2}){19}|(:[a-fA-F0-9]{2}){15})$/, {
    message:
      'Fingerprint must consist of 16 or 20 pairs of hexadecimal characters separated by colons, e.g. XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX',
    excludeEmptyString: true,
  });

export const usernameSchema = yup
  .string()
  .max(320)
  .matches(/^\S*$/, {
    message: ({ label }) => `${label} must not contain spaces`,
    excludeEmptyString: true,
  });

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

// Base URL path for forklift pages.
export const PATH_PREFIX = '/mtv';

// constant references to create links in the legacy code
export const PLANS_REFERENCE = 'forklift.konveyor.io~v1beta1~Plan';
export const PROVIDERS_REFERENCE = 'forklift.konveyor.io~v1beta1~Provider';
