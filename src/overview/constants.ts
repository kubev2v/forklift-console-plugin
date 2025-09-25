import { t } from '@utils/i18n';

export const OVERVIEW_BASE_PATH = '/mtv/overview';

export enum OverviewTabHref {
  Overview = '',
  YAML = 'yaml',
  Health = 'health',
  History = 'history',
  Settings = 'settings',
}

export const OverviewTabName = {
  Health: t('Health'),
  History: t('History'),
  Overview: t('Overview'),
  Settings: t('Settings'),
  YAML: t('YAML'),
} as const;
