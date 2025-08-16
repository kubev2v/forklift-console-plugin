/* eslint-disable @cspell/spellchecker */
declare module '*.svg' {
  export default ReactComponent;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: string;
  export default content;
}

// Reference: https://github.com/openshift/console/blob/c126b66e62655eec01683b7419a6fbe835bc9ee1/frontend/%40types/console/index.d.ts#L15
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
  SERVER_FLAGS: {
    copiedCSVsDisabled: boolean;
    alertManagerBaseURL: string;
    alertmanagerUserWorkloadBaseURL: string;
    authDisabled: boolean;
    basePath: string;
    branding: string;
    consoleVersion: string;
    customLogoURL: string;
    customProductName: string;
    documentationBaseURL: string;
    kubeAPIServerURL: string;
    loadTestFactor: number;
    loginErrorURL: string;
    loginSuccessURL: string;
    loginURL: string;
    logoutRedirect: string;
    logoutURL: string;
    prometheusBaseURL: string;
    prometheusTenancyBaseURL: string;
    quickStarts: string;
    releaseVersion: string;
    inactivityTimeout: number;
    statuspageID: string;
    GOARCH: string;
    GOOS: string;
    graphqlBaseURL: string;
    developerCatalogCategories: string;
    perspectives: string;
    developerCatalogTypes: string;
    userSettingsLocation: string;
    addPage: string; // JSON encoded configuration
    consolePlugins: string[]; // Console dynamic plugins enabled on the cluster
    i18nNamespaces: string[]; // Available i18n namespaces
    projectAccessClusterRoles: string;
    controlPlaneTopology: string;
    telemetry: Record<string, string>;
    nodeArchitectures: string[];
    nodeOperatingSystems: string[];
    hubConsoleURL: string;
    k8sMode: string;
    capabilities: Record<string, string>[];
    clusterID?: string;
  };
  analytics?: SegmentAnalytics;
}

// Based on Segment Analytics.js 2.0 snippet v5.2.0
// Reference: https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/
type SegmentAnalytics = {
  [key: string]: unknown;
  initialized?: boolean;
  track: (
    event: string,
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => void;
  factory: (method: string) => (...args: unknown[]) => SegmentAnalytics;
  invoked?: boolean;
  load: (key: string, options?: Record<string, unknown>) => void;
  methods?: string[];
  page: () => void;
  push: (args: unknown[]) => number;
  SNIPPET_VERSION?: string;
  _loadOptions?: Record<string, unknown>;
  _writeKey?: string;
};

declare module 'eslint-plugin-import' {
  const flatConfigs: {
    recommended: unknown;
  };
  export { flatConfigs };
}

type LinkifyProps = {
  children: React.ReactNode;
  componentDecorator?: (
    decoratedHref: string,
    decoratedText: string,
    key: number,
  ) => React.ReactNode;
  hrefDecorator?: (href: string) => string;
  matchDecorator?: (text: string) => object[];
  textDecorator?: (text: string) => string;
};

declare module 'react-linkify' {
  import { Component } from 'react';

  export default class Linkify extends Component<LinkifyProps> {}
}
