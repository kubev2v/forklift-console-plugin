import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { PackageJson } from 'type-fest';
import { type WebpackPluginInstance, BannerPlugin, Compilation, Compiler, sources } from 'webpack';

const getBaseBuildMetadata = () => {
  const now = new Date();

  return {
    buildDateTime: now.toISOString(),
    gitCommit: execSync('git rev-parse HEAD').toString().trim(),
    gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
    gitTags: execSync('git tag --points-at HEAD').toString().trim().split('\n').filter(Boolean),
  };
};

export type BuildMetadataPluginOptions = {
  /**
   * The contents of `package.json` to provide package name and version.
   */
  packageJson: PackageJson;

  /**
   * Output path for the metadata file.
   *
   * Defaults value: the configured webpack output path
   */
  outputPath?: string;

  /**
   * Name of the JSON metadata file.
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
  private readonly outputPath: string;
  private readonly jsonMetadataFilename: string;
  private readonly bannerBuildInfoTag: string;

  constructor(options: BuildMetadataPluginOptions = { packageJson: {} }) {
    this.packageJson = options.packageJson;
    this.outputPath = options.outputPath ?? '.';
    this.jsonMetadataFilename = options.jsonMetadataFilename ?? 'build-metadata.json';
    this.bannerBuildInfoTag = options.bannerBuildInfoTag ?? '@buildInfo';
  }

  apply(compiler: Compiler) {
    //
    // Lookup the build metadata (package.json of the thing running webpack & git info):
    //
    const buildInfo = {
      packageName: this.packageJson.name,
      packageVersion: this.packageJson.version,
      ...getBaseBuildMetadata(),
    };

    //
    // Build up the chunk banner (include the @buildInfo tag so terser can be configured to keep it):
    //
    const bannerInfo = [
      `${this.bannerBuildInfoTag} for [file]:`,
      `${buildInfo.packageName}@${buildInfo.packageVersion}`,
      `built: ${buildInfo.buildDateTime}`,
      !buildInfo?.gitCommit && 'built from non-git repo',
      buildInfo?.gitCommit && `commit: ${buildInfo.gitCommit}`,
      buildInfo?.gitBranch && `branch: ${buildInfo.gitBranch}`,
      buildInfo?.gitTags.length && `tags: ${buildInfo.gitTags.join(', ')}`,
    ].filter(Boolean);
    const banner = `/***\n    ${bannerInfo.join('\n    ')}\n***/`;

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
          const filename = path.relative(
            compilation.options.output.path,
            path.resolve(
              this.outputPath ?? compilation.options.output.path,
              this.jsonMetadataFilename,
            ),
          );

          const source = new sources.RawSource(JSON.stringify(buildInfo, undefined, 2));
          compilation.emitAsset(filename, source);
        },
      );
    });
  }
}
