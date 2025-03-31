/* eslint-disable @cspell/spellchecker */

declare module '*.svg' {
  const content: string;
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
declare type Window = {
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
  };
};
