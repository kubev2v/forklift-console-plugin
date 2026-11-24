import pluginMetadata from './plugin-metadata';

export const ENVIRONMENT_DEFAULTS = {
  /**
   * UI branding name.
   *
   * Note: downstream builds are set to: 'RedHat'
   */
  BRAND_TYPE: 'Forklift' as 'RedHat' | 'Forklift',
  /**
   * Used for testing when no api servers are available.  If set to `mock`, network api
   * calls will use mock data.
   */
  DATA_SOURCE: 'remote' as 'mock' | 'remote',
  /**
   * Namespaces used by UI forms and modals if no namespace is given by the user.
   *
   * Note: downstream build are set to: 'openshift-mtv'
   */
  DEFAULT_NAMESPACE: 'konveyor-forklift',
  /**
   * Development-only override that shows the Azure provider on a non-Azure
   * cluster. Azure is otherwise gated on the cluster running on Azure.
   */
  FORCE_SHOW_AZURE_PROVIDER: 'false',
  /**
   * Name of the console plugin.  It should be set to the plugin name used in the
   * installation scripts.  Defaults to the name in `package.json`: 'forklift-console-plugin'.
   */
  PLUGIN_NAME: pluginMetadata.name,
  /**
   * Version of the plugin.  Defaults to the version in `package.json`.
   */
  VERSION: pluginMetadata.version,
};
