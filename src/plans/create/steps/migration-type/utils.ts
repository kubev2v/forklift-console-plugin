import type { FC } from 'react';

import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { t } from '@utils/i18n';
import { LIVE_MIGRATION_HELP_LINK, WARM_MIGRATION_HELP_LINK } from '@utils/links';

import { MigrationTypeValue } from './constants';

type MigrationTypeConfig = {
  description: string;
  helpBody?: string;
  helpLink?: string;
  PreviewLabel?: FC;
};

export const getMigrationTypeConfig = (migrationType: MigrationTypeValue): MigrationTypeConfig => {
  switch (migrationType) {
    case MigrationTypeValue.Cold:
      return {
        description: t('A cold migration moves a shut-down VM between hosts.'),
      };
    case MigrationTypeValue.Warm:
      return {
        description: t(
          'A warm migration moves an active VM with minimal downtime (not zero-downtime).',
        ),
        helpBody: t(
          'Warm migration copies most VM data while it is still running; at cut-over the VM is paused and the rest of the data is copied.',
        ),
        helpLink: WARM_MIGRATION_HELP_LINK,
      };
    case MigrationTypeValue.Live: {
      const liveDesc = t('A live migration moves an active VM between hosts with zero downtime.');
      return {
        description: liveDesc,
        helpBody: liveDesc,
        helpLink: LIVE_MIGRATION_HELP_LINK,
        PreviewLabel: TechPreviewLabel,
      };
    }
    default:
      return {
        description: '',
      };
  }
};
