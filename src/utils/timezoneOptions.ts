export const timezoneOptions = Intl.supportedValuesOf('timeZone').map((tz) => ({
  content: tz,
  value: tz,
}));
