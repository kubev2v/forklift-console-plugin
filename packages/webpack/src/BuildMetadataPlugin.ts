import * as path from 'node:path';
import { PackageJson } from 'type-fest';
import { type WebpackPluginInstance, BannerPlugin, Compilation, Compiler, sources } from 'webpack';

import { createBannerComment, getBuildMetadata } from '@kubev2v/build/src/metadata';

export type BuildMetadataPluginOptions = {
  /**
   * The contents of `package.json` to provide package name and version.
   */
  packageJson: PackageJson;

  /**
   * Path and name of the JSON metadata file, relative to the configured webpack output path.
   *
   * Default value: `build-metadata.json`
   */
  jsonMetadataFilename?: string;

  /**
   * The tag to include in the chunk banner.  This can be used to configure terser to
   * retain the banner comment in the optimized chunks.
   *
   * Default value: `@buildInfo`
   */
  bannerBuildInfoTag?: string;
};

/**
 * Collect and output build metadata from a provided `package.json` and from calls to
 * git.  The metadata is saved in two places:
 *   - A banner comment starting with `bannerBuildInfoTag` in each chunk
 *   - A json metadata file
 */
export class BuildMetadataPlugin implements WebpackPluginInstance {
  private readonly packageJson: PackageJson;
  private readonly jsonMetadataFilename: string;
  private readonly bannerBuildInfoTag: string;

  constructor(options: BuildMetadataPluginOptions = { packageJson: {} }) {
    this.packageJson = options.packageJson;
    this.jsonMetadataFilename = options.jsonMetadataFilename ?? 'build-metadata.json';
    this.bannerBuildInfoTag = options.bannerBuildInfoTag ?? '@buildInfo';
  }

  apply(compiler: Compiler) {
    //
    // Lookup the build metadata (package.json of the thing running webpack & git info):
    //
    const buildInfo = getBuildMetadata(this.packageJson);

    //
    // Build up the chunk banner (include the @buildInfo tag so terser can be configured to keep it):
    //
    const banner = createBannerComment(
      this.packageJson,
      buildInfo,
      `${this.bannerBuildInfoTag} for \`[file]\``,
    );

    //
    // run the BannerPlugin:
    //
    new BannerPlugin({ banner, raw: true }).apply(compiler);

    //
    // Emit `build-metadata.json`:
    //
    compiler.hooks.thisCompilation.tap(BuildMetadataPlugin.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: BuildMetadataPlugin.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const filename = path.normalize(this.jsonMetadataFilename);
          const source = new sources.RawSource(JSON.stringify(buildInfo, undefined, 2));

          // filename is relative to webpack's configured output path
          compilation.emitAsset(filename, source);
        },
      );
    });
  }
}
