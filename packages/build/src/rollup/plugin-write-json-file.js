/**
 * A Rollup plugin that emits a JSON file to the build output.
 *
 * @export
 * @param {Object} options - An options object.
 * @param {string} options.fileName - The name of the output JSON file.
 * @param {import('type-fest').JsonValue} options.value - The JSON value to be written to the file.
 * @returns {import('rollup').Plugin} The Rollup plugin.
 */
export default function writeJSONFile({ fileName, value }) {
  return {
    name: 'write-json-file',

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName,
        source: JSON.stringify(value, null, 2),
      });
    },
  };
}
