/* eslint-disable no-console -- intentional test/lifecycle logger for Playwright helpers */
export const testLog = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console -- see file-level disable
  console.log(...args);
};

export const testWarn = (...args: unknown[]): void => {
  console.warn(...args);
};

export const testError = (...args: unknown[]): void => {
  console.error(...args);
};
