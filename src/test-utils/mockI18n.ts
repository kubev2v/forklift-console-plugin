import { jest } from '@jest/globals';

const createMockT =
  (): ((key: string, params?: Record<string, unknown>) => string) =>
  (key: string, params?: Record<string, unknown>): string => {
    // Handle template strings with parameters
    if (params && typeof key === 'string') {
      return key.replace(/\{\{(?<paramName>\w+)\}\}/gu, (match, paramName: string) => {
        const paramValue = params[paramName];
        return paramValue?.toString() ?? match;
      });
    }
    return key;
  };

export const mockI18n = (): void => {
  const mockT = createMockT();

  const i18nMock = {
    ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
    t: mockT,
    useForkliftTranslation: (): { t: typeof mockT } => ({
      t: mockT,
    }),
  };

  jest.mock('@utils/i18n', () => i18nMock);
  jest.mock('src/utils/i18n', () => i18nMock);
};
