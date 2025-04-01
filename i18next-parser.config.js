// eslint-disable-next-line no-undef
module.exports = {
  createOldCatalogs: false,
  defaultNamespace: 'plugin__forklift-console-plugin',
  defaultValue(_local, _namespace, key) {
    // The `useKeysAsDefaultValues` option is deprecated in favor of `defaultValue` option function arguments.
    // The `key` is used to set default value.
    return key;
  },
  keySeparator: false,
  lexers: {
    tsx: [
      {
        componentFunctions: ['Trans', 'ForkliftTrans'],
        lexer: 'JsxLexer',
      },
    ],
  },
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  sort: true,
};
