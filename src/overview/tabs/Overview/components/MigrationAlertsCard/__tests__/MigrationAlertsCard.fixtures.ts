import type { MigrationAlert } from '@utils/hooks/useMigrationAlerts/types';

export const failedAlert: MigrationAlert = {
  activeAt: '2026-06-23T14:30:00Z',
  alertName: 'MigrationFailed',
  description:
    'Cold migration plan "plan-alpha" with VSphere provider failed on DiskTransfer phase.',
  mode: 'Cold',
  phase: 'DiskTransfer',
  planName: 'plan-alpha',
  planUid: 'uid-1',
  provider: 'VSphere',
  severity: 'critical',
  state: 'firing',
  target: 'Local',
};

export const succeededAlert: MigrationAlert = {
  activeAt: '2026-06-24T10:00:00Z',
  alertName: 'MigrationSucceeded',
  description: 'Migration plan "plan-beta" succeeded.',
  mode: 'Warm',
  phase: '',
  planName: 'plan-beta',
  planUid: 'uid-2',
  provider: 'oVirt',
  severity: 'info',
  state: 'firing',
  target: 'Local',
};
