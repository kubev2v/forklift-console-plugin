import * as path from 'node:path';
import { type WebpackPluginInstance, Compilation, Compiler, sources } from 'webpack';

export type WriteJsonFilePluginOptions = {
  /**
   * The contents (JSON data or a JS object) to write as JSON to a file.
   */
  contents: string | object;

  /**
   * Path and name of the JSON metadata file, relative to the configured webpack output path.
   */
  jsonFilename: string;
};

/**
 * Write an object as JSON to a given file in the webpack destination.
 */
export class WriteJsonFilePlugin implements WebpackPluginInstance {
  private readonly contents: string;
  private readonly jsonFilename: string;

  constructor({ contents, jsonFilename }: WriteJsonFilePluginOptions) {
    const _contents = typeof contents === 'string' ? JSON.parse(contents) : contents;
    this.contents = JSON.stringify(_contents, null, 2);

    this.jsonFilename = jsonFilename;
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(WriteJsonFilePlugin.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: WriteJsonFilePlugin.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const filename = path.normalize(this.jsonFilename);
          const source = new sources.RawSource(this.contents);

          // filename is relative to webpack's configured output path
          compilation.emitAsset(filename, source);
        },
      );
    });
  }
}
