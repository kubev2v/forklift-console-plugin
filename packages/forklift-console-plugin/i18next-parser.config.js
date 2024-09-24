/* eslint-disable no-dupe-args */
/* eslint-disable no-redeclare */
// eslint-disable-next-line no-undef
module.exports = {
  createOldCatalogs: false,
  keySeparator: false,
  sort: true,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultValue: function (_local, _namespace, key) {
    // The `useKeysAsDefaultValues` option is deprecated in favor of `defaultValue` option function arguments.
    // The `key` is used to set default value.
    return key;
  },
  defaultNamespace: 'plugin__forklift-console-plugin',
};
