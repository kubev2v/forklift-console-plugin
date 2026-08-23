import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';

export const mockPatchMigrationCutover = jest.fn().mockResolvedValue(undefined);

jest.mock('../utils/utils', () => ({
  formatDateTo12Hours: jest.fn((): string => '12:00 PM'),
  patchMigrationCutover: jest.fn((...args: unknown[]): unknown =>
    mockPatchMigrationCutover(...args),
  ),
}));

export const mockUsePlanMigration = jest.fn();

jest.mock('src/plans/hooks/usePlanMigration', () => ({
  usePlanMigration: jest.fn((...args: unknown[]): unknown => mockUsePlanMigration(...args)),
}));

const mockT = (key: string): string => key;

jest.mock('src/utils/i18n', () => ({
  ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
  t: mockT,
  useForkliftTranslation: (): { t: typeof mockT } => ({ t: mockT }),
}));

jest.mock('@utils/i18n', () => ({
  ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
  t: mockT,
  useForkliftTranslation: (): { t: typeof mockT } => ({ t: mockT }),
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: (): { trackEvent: jest.Mock } => ({ trackEvent: jest.fn() }),
}));

jest.mock('@utils/crds/common/selectors', () => ({
  getName: jest.fn((): string => 'test-plan'),
}));

export const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: { warm: true },
} as unknown as V1beta1Plan;

export const mockMigrationWithoutCutover = {
  metadata: { name: 'test-migration', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Migration;

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const mockMigrationWithCutover = {
  metadata: { name: 'test-migration', namespace: 'test-ns' },
  spec: { cutover: new Date(Date.now() + ONE_DAY_MS).toISOString() },
} as unknown as V1beta1Migration;

export const closeOverlay = jest.fn();
