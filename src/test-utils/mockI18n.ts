import { jest } from '@jest/globals';

export const mockI18n = () => {
  jest.mock('@utils/i18n', () => ({
    useForkliftTranslation: () => ({
      t: (key: string) => key,
    }),
  }));
};
