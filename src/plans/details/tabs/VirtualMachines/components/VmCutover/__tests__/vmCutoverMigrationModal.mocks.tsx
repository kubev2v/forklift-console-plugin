import type { ReactElement } from 'react';

import type { V1beta1Migration, V1beta1MigrationSpec } from '@forklift-ui/types';
import { jest } from '@jest/globals';

export const mockPatchMigrationVmCutover = jest.fn(() => Promise.resolve(undefined));
const mockTrackEvent = jest.fn();

jest.mock('src/plans/components/CutoverModal/utils/utils', () => ({
  ...jest.requireActual<object>('src/plans/components/CutoverModal/utils/utils'),
  patchMigrationVmCutover: jest.fn((...args: unknown[]): unknown =>
    mockPatchMigrationVmCutover(...(args as [])),
  ),
}));

const mockT = (key: string): string => key;

jest.mock('@utils/i18n', () => ({
  ForkliftTrans: (): ReactElement => <div data-testid="vm-cutover-description" />,
  t: mockT,
  useForkliftTranslation: (): { t: typeof mockT } => ({ t: mockT }),
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: (): { trackEvent: unknown } => ({ trackEvent: mockTrackEvent }),
}));

export const VM_ID = 'vm-1000';
export const VM_NAME = 'mtv-tests-rhel8';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PLAN_CUTOVER = new Date(Date.now() + ONE_DAY_MS).toISOString();
const VM_CUTOVER = new Date(Date.now() + 2 * ONE_DAY_MS).toISOString();

const buildMigration = (spec: Partial<V1beta1MigrationSpec>): V1beta1Migration =>
  ({ metadata: { name: 'migration-1', namespace: 'openshift-mtv' }, spec }) as V1beta1Migration;

export const inheritingMigration = buildMigration({ cutover: PLAN_CUTOVER });

export const overriddenMigration = buildMigration({
  cutover: PLAN_CUTOVER,
  vmCutover: [{ cutover: VM_CUTOVER, id: VM_ID }],
});
