// This dummy file is used to resolve @Console imports from @openshift-console for JEST
// Check "moduleNameMapper" in jest.config.ts

// re-export React components that require tsx syntax
export * from './console_components';

// mocks for non-React code (standard ts syntax)
export class Dummy extends Error {
  public constructor() {
    super('Dummy file for exports');
  }
}

/**
 * @export
 * @returns {any[]}
 */
export const useResolvedExtensions = (): any[] => {
  return [[], undefined, undefined];
};
