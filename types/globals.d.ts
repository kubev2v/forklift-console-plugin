/* eslint-disable @cspell/spellchecker */
declare module 'eslint-plugin-barrel-files';
declare module 'eslint-plugin-promise';

declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.scss';
declare module '*.css';

declare module '*.json' {
  const content: string;
  export default content;
}

// Reference: https://github.com/openshift/console/blob/c126b66e62655eec01683b7419a6fbe835bc9ee1/frontend/%40types/console/index.d.ts#L15
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
  SERVER_FLAGS: {
    addPage: string; // JSON encoded configuration
    alertManagerBaseURL: string;
    alertmanagerUserWorkloadBaseURL: string;
    authDisabled: boolean;
    basePath: string;
    branding: string;
    capabilities: Record<string, string>[];
    clusterID?: string;
    consolePlugins: string[]; // Console dynamic plugins enabled on the cluster
    consoleVersion: string;
    controlPlaneTopology: string;
    copiedCSVsDisabled: boolean;
    customLogoURL: string;
    customProductName: string;
    developerCatalogCategories: string;
    developerCatalogTypes: string;
    documentationBaseURL: string;
    GOARCH: string;
    GOOS: string;
    graphqlBaseURL: string;
    hubConsoleURL: string;
    i18nNamespaces: string[]; // Available i18n namespaces
    inactivityTimeout: number;
    k8sMode: string;
    kubeAPIServerURL: string;
    loadTestFactor: number;
    loginErrorURL: string;
    loginSuccessURL: string;
    loginURL: string;
    logoutRedirect: string;
    logoutURL: string;
    nodeArchitectures: string[];
    nodeOperatingSystems: string[];
    perspectives: string;
    projectAccessClusterRoles: string;
    prometheusBaseURL: string;
    prometheusTenancyBaseURL: string;
    quickStarts: string;
    releaseVersion: string;
    statuspageID: string;
    telemetry: Record<string, string>;
    userSettingsLocation: string;
  };
  analytics?: SegmentAnalytics;
}

// Based on Segment Analytics.js 2.0 snippet v5.2.0
// Reference: https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/
// Intersection avoids index-signature vs field ordering conflicts between member-ordering and perfectionist.
type SegmentAnalytics = {
  _loadOptions?: Record<string, unknown>;
  _writeKey?: string;
  factory: (method: string) => (...args: unknown[]) => SegmentAnalytics;
  initialized?: boolean;
  invoked?: boolean;
  load: (key: string, options?: Record<string, unknown>) => void;
  methods?: string[];
  page: () => void;
  push: (args: unknown[]) => number;
  SNIPPET_VERSION?: string;
  track: (
    event: string,
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => void;
} & Record<string, unknown>;

declare module 'eslint-plugin-import' {
  const flatConfigs: {
    recommended: unknown;
  };
  export { flatConfigs };
}
