import fs from 'fs';
import path from 'path';

import { type WebpackPluginInstance, Compiler } from 'webpack';

import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type {
  WebpackSharedConfig,
  WebpackSharedObject,
} from '@openshift/dynamic-plugin-sdk-webpack';
import { DynamicRemotePlugin } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

import { PatchManifestJson } from './PatchManifestJsonPlugin';
import {
  type SharedModuleMetadata,
  sharedPluginModules,
  sharedPluginModulesMetadata,
} from './shared-modules';

const parseJSONFile = <TValue = unknown>(filePath: string) =>
  JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TValue;

function getPluginMetadata(filename: string, baseDir = process.cwd()) {
  const filePath = path.resolve(baseDir, filename);
  const contents = parseJSONFile<ConsolePluginMetadata>(filePath);
  return contents;
}

function buildPluginId(pluginMetadata: ConsolePluginMetadata): string {
  const pluginName: string = pluginMetadata.name;
  const pluginVersion: string = pluginMetadata.version;

  return `${pluginName}@${pluginVersion}`;
}

/**
 * Process the shared modules from console's dynamic-plugin-sdk into a form useable
 * by the core `DynamicRemotePlugin`.
 *
 * This function has be adapted from:
 *   https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/src/webpack/ConsoleRemotePlugin.ts#L88-L108
 *
 * TODO 1: Keep aligned with how console handles its modules.
 * TODO 2: Do we need to add '@openshift/dynamic-plugin-sdk' in for any reason?
 */
function processConsoleSharedModules(
  modules: typeof sharedPluginModules,
  metadata: Record<string, SharedModuleMetadata>,
): WebpackSharedObject {
  return Object.fromEntries(
    modules.map((module) => {
      const moduleMetadata = metadata[module] ?? {};

      const config: WebpackSharedConfig = {
        singleton: moduleMetadata?.singleton ?? true,
        import: moduleMetadata?.allowFallback ?? false ? undefined : false,
      };

      return [module, config];
    }),
  );
}

export type DynamicConsoleRemotePluginOptions = Partial<{
  /**
   * Plugin metadata.
   *
   * The value is either a Plugin metadata JSON file name, or the parsed plugin metadata.
   *
   * Default value: `plugin.json`
   */
  pluginMetadata: string | ConsolePluginMetadata;

  /**
   * List of extensions contributed by the plugin.
   *
   * The value is either a `minimatch` compatible JSON file glob pattern,
   * or the parsed extensions array.
   *
   * Default value: `console-extensions.json`
   */
  extensions: string | EncodedExtension[];
}>;

/**
 * Wrap the core SDK plugin so the output can be patched as necessary to run in console.
 */
export class DynamicConsoleRemotePlugin implements WebpackPluginInstance {
  private readonly pluginMetadata: ConsolePluginMetadata;

  private readonly extensions: string | EncodedExtension[];

  constructor(options: DynamicConsoleRemotePluginOptions = {}) {
    const _pluginMetadata = options.pluginMetadata ?? 'plugin.json';
    this.pluginMetadata =
      typeof _pluginMetadata === 'string' ? getPluginMetadata(_pluginMetadata) : _pluginMetadata;

    this.extensions = options.extensions ?? 'console-extensions.json';
  }

  apply(compiler: Compiler) {
    const sharedModules = processConsoleSharedModules(
      sharedPluginModules,
      sharedPluginModulesMetadata,
    );

    // Do the federated module build and generate the core SDK `plugin-manifest.json` file
    new DynamicRemotePlugin({
      pluginMetadata: { ...this.pluginMetadata }, // PluginBuildMetadata type isn't exported so we do this!
      extensions: this.extensions,
      sharedModules,

      // Setup callbacks names for the generated `plugin-entry.js` to function with
      // the current console runtime openshift/origin-console:latest (as of 7-Sep-2022).
      entryCallbackSettings: {
        name: 'window.loadPluginEntry',
        pluginID: buildPluginId(this.pluginMetadata),
      },
    }).apply(compiler);

    // Patch core SDK manifest to be console SDK manifest compatible
    new PatchManifestJson('plugin-manifest.json', this.pluginMetadata).apply(compiler);
  }
}
