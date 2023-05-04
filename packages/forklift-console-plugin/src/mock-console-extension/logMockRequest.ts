/**
 * Log the request status to the console.
 *
 * @param status - The status of the request (handled, passthrough, etc.)
 * @param url - The URL of the request
 */
export const logMockRequest = (status: string, url: string): void => {
  console.log(`mock-extension ${status} \u{1fa83} %s`, url);
};
