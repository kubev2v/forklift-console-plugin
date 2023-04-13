/**
 * Setup pretty printing to browser console of a URL and other data.
 */
export const fancyCaptureUrl = (url, ...rest) => [
  '%cmock-plugin capture%c \u{1f440} %s',
  'font-weight: bold; color: darkred',
  'font-weight: inherit; color: inherit',
  url,
  ...rest,
];
