import { type WebpackPluginInstance, Compilation, Compiler, sources } from 'webpack';

import type { PluginManifest } from '@openshift/dynamic-plugin-sdk';
import type { ConsolePluginManifestJSON } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-manifest';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

/**
 * Make the core SDK generated manifest look like a console SDK generated manifest.
 *
 * See: https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/src/webpack/ConsoleAssetPlugin.ts#L32
 */
const blendConsoleAndCorePluginManifestFields = (
  pluginMetadata: ConsolePluginMetadata,
  coreSdkManifest: PluginManifest,
): ConsolePluginManifestJSON => ({
  name: coreSdkManifest.name ?? pluginMetadata.name,
  version: coreSdkManifest.version ?? pluginMetadata.version,
  displayName: pluginMetadata.displayName,
  description: pluginMetadata.description,
  dependencies: pluginMetadata.dependencies,
  disableStaticPlugins: pluginMetadata.disableStaticPlugins,
  extensions: coreSdkManifest.extensions,
});

/**
 * The core SDK webpack plugin only copies fields required by the core SDK runtime to the
 * manifest file.  The console SDK requires additional fields.  This plugin will patch
 * the core SDK generated manifest to be valid for use as a console dynamic plugin.
 */
export class PatchManifestJson implements WebpackPluginInstance {
  constructor(
    private readonly fileName: string,
    private readonly pluginMetadata: ConsolePluginMetadata,
  ) {}

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(PatchManifestJson.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PatchManifestJson.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          const existing = JSON.parse(assets[this.fileName].source().toString());
          const patched = blendConsoleAndCorePluginManifestFields(this.pluginMetadata, existing);
          assets[this.fileName] = new sources.RawSource(JSON.stringify(patched, undefined, 2));
        },
      );
    });
  }
}
