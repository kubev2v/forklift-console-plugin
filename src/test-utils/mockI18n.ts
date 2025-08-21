import { jest } from '@jest/globals';

const createMockT = () => (key: string, params?: Record<string, unknown>) => {
  // Handle template strings with parameters
  if (params && typeof key === 'string') {
    return key.replace(/\{\{(?<paramName>\w+)\}\}/gu, (match, paramName: string) => {
      const paramValue = params[paramName];
      return paramValue?.toString() ?? match;
    });
  }
  return key;
};

export const mockI18n = () => {
  const mockT = createMockT();

  jest.mock('@utils/i18n', () => ({
    t: mockT,
    useForkliftTranslation: () => ({
      t: mockT,
    }),
  }));
};
