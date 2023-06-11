import { createFilter, dataToEsm } from '@rollup/pluginutils';

/**
 * This is a Rollup plugin that converts HAR files into ES6 modules.
 *
 * @export
 * @param {Object} [options={}] - An options object.
 * @param {Array<string>} options.include - List of paths/patterns to include.
 * @param {Array<string>} options.exclude - List of paths/patterns to exclude.
 * @param {string} options.indent - The indentation to use in the output ES6 modules.
 * @param {boolean} options.preferConst - If true, declares variables as constants.
 * @param {boolean} options.compact - If true, output compact JS code.
 * @param {boolean} options.namedExports - If true, exports named variables.
 * @returns {Object} The Rollup plugin.
 */
export default function har(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const indent = 'indent' in options ? options.indent : '\t';

  return {
    name: 'har',

    transform(code, id) {
      if (id.slice(-4) !== '.har' || !filter(id)) return null;

      try {
        const parsed = JSON.parse(code);
        return {
          code: dataToEsm(parsed, {
            preferConst: options.preferConst,
            compact: options.compact,
            namedExports: options.namedExports,
            indent,
          }),
          map: { mappings: '' },
        };
      } catch (err) {
        const message = 'Could not parse HAR file';
        this.error({ message, id, cause: err });
        return null;
      }
    },
  };
}
